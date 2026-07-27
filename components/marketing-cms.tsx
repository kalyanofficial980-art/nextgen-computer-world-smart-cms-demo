"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Offer, Review } from "@/lib/marketing-types";

type Section = "offers" | "reviews";

type OfferForm = Omit<Offer, "id" | "created_at" | "updated_at"> & { id: string };
type ReviewForm = Omit<Review, "id" | "created_at" | "updated_at"> & { id: string };

const blankOffer: OfferForm = {
  id: "",
  title: "",
  slug: "",
  description: "",
  discount_label: "",
  coupon_code: "",
  image_url: "",
  button_label: "View offer",
  button_link: "/catalogue",
  starts_at: null,
  ends_at: null,
  featured: false,
  active: true,
  sort_order: 0,
};

const blankReview: ReviewForm = {
  id: "",
  customer_name: "",
  customer_city: "",
  rating: 5,
  review_text: "",
  product_or_service: "",
  image_url: "",
  verified_customer: false,
  featured: false,
  published: true,
  sort_order: 0,
  review_date: new Date().toISOString().slice(0, 10),
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toLocalDateTime(value: string | null) {
  return value ? new Date(value).toISOString().slice(0, 16) : "";
}

function parseDateTime(value: string | null) {
  return value ? new Date(value).toISOString() : null;
}

function storagePathFromUrl(url: string, bucket: string) {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = url.indexOf(marker);
  return index >= 0 ? decodeURIComponent(url.slice(index + marker.length)) : null;
}

function validateDestination(value: string) {
  const destination = value.trim();

  if (!destination) return "/catalogue";
  if (destination.startsWith("/")) return destination;

  const parsed = new URL(destination);

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Offer link must be an internal /path or an HTTP/HTTPS URL.");
  }

  return parsed.toString();
}

async function uploadImage(
  supabase: ReturnType<typeof createClient>,
  bucket: "offer-images" | "review-images",
  file: File | null,
) {
  if (!file) return "";

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Upload a JPG, PNG or WebP image.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("The image must be smaller than 5 MB.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  });

  if (error) throw error;

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

async function removeImage(
  supabase: ReturnType<typeof createClient>,
  bucket: "offer-images" | "review-images",
  url: string,
) {
  const path = storagePathFromUrl(url, bucket);

  if (path) {
    await supabase.storage.from(bucket).remove([path]);
  }
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-black text-slate-300">{label}</span>
      {hint && <span className="mb-2 block text-[11px] text-slate-500">{hint}</span>}
      {children}
    </label>
  );
}

const inputClass =
  "focus-ring min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm text-white";
const textareaClass =
  "focus-ring w-full rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-sm text-white";

export function MarketingCms({ section }: { section: Section }) {
  return section === "offers" ? <OffersCms /> : <ReviewsCms />;
}

function OffersCms() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<Offer[]>([]);
  const [form, setForm] = useState<OfferForm>(blankOffer);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState("Loading offers…");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("offers")
      .select("*")
      .order("featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    setRows((data ?? []) as Offer[]);
    setMessage("Offers CMS ready. Images upload directly; no image URL is required.");
  }, [supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setMessage("Saving offer…");

    try {
      if (!form.title.trim() || !form.description.trim()) {
        throw new Error("Offer title and description are required.");
      }

      const start = parseDateTime(form.starts_at);
      const end = parseDateTime(form.ends_at);

      if (start && end && new Date(end) <= new Date(start)) {
        throw new Error("Offer end date must be after its start date.");
      }

      const previousImage = form.image_url;
      const uploaded = await uploadImage(supabase, "offer-images", imageFile);
      const payload = {
        title: form.title.trim(),
        slug: slugify(form.slug || form.title),
        description: form.description.trim(),
        discount_label: form.discount_label.trim(),
        coupon_code: form.coupon_code.trim().toUpperCase(),
        image_url: uploaded || form.image_url,
        button_label: form.button_label.trim() || "View offer",
        button_link: validateDestination(form.button_link),
        starts_at: start,
        ends_at: end,
        featured: form.featured,
        active: form.active,
        sort_order: Number(form.sort_order) || 0,
      };

      const result = form.id
        ? await supabase.from("offers").update(payload).eq("id", form.id)
        : await supabase.from("offers").insert(payload);

      if (result.error) throw result.error;

      if (uploaded && previousImage && uploaded !== previousImage) {
        await removeImage(supabase, "offer-images", previousImage);
      }

      setForm(blankOffer);
      setImageFile(null);
      setMessage("Offer saved and ready for the public website.");
      await load();
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save offer.");
    } finally {
      setSaving(false);
    }
  }

  function edit(row: Offer) {
    setForm({
      id: row.id,
      title: row.title,
      slug: row.slug,
      description: row.description,
      discount_label: row.discount_label,
      coupon_code: row.coupon_code,
      image_url: row.image_url,
      button_label: row.button_label,
      button_link: row.button_link,
      starts_at: row.starts_at,
      ends_at: row.ends_at,
      featured: row.featured,
      active: row.active,
      sort_order: row.sort_order,
    });
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(row: Offer) {
    if (!window.confirm(`Delete offer "${row.title}"?`)) return;

    const { error } = await supabase.from("offers").delete().eq("id", row.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    await removeImage(supabase, "offer-images", row.image_url);
    setMessage("Offer deleted.");
    await load();
    router.refresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[430px_1fr]">
      <form onSubmit={save} className="surface h-fit rounded-3xl p-6 xl:sticky xl:top-28">
        <h2 className="text-2xl font-black text-white">
          {form.id ? "Edit offer" : "Add offer"}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Upload offer artwork, schedule dates and control homepage visibility.
        </p>

        <div className="mt-6 grid gap-4">
          <Field label="Offer title">
            <input
              required
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              className={inputClass}
            />
          </Field>

          <Field label="Slug" hint="Leave blank to generate it from the title.">
            <input
              value={form.slug}
              onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
              className={inputClass}
            />
          </Field>

          <Field label="Description">
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className={textareaClass}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <Field label="Discount label" hint="Example: Save 15% or Free installation">
              <input
                value={form.discount_label}
                onChange={(event) => setForm((current) => ({ ...current, discount_label: event.target.value }))}
                className={inputClass}
              />
            </Field>

            <Field label="Coupon code">
              <input
                value={form.coupon_code}
                onChange={(event) => setForm((current) => ({ ...current, coupon_code: event.target.value }))}
                className={inputClass}
              />
            </Field>

            <Field label="Button label">
              <input
                value={form.button_label}
                onChange={(event) => setForm((current) => ({ ...current, button_label: event.target.value }))}
                className={inputClass}
              />
            </Field>

            <Field label="Button link" hint="Example: /catalogue or /contact">
              <input
                value={form.button_link}
                onChange={(event) => setForm((current) => ({ ...current, button_link: event.target.value }))}
                className={inputClass}
              />
            </Field>

            <Field label="Start date">
              <input
                type="datetime-local"
                value={toLocalDateTime(form.starts_at)}
                onChange={(event) => setForm((current) => ({ ...current, starts_at: event.target.value || null }))}
                className={inputClass}
              />
            </Field>

            <Field label="End date">
              <input
                type="datetime-local"
                value={toLocalDateTime(form.ends_at)}
                onChange={(event) => setForm((current) => ({ ...current, ends_at: event.target.value || null }))}
                className={inputClass}
              />
            </Field>

            <Field label="Sort order">
              <input
                type="number"
                value={form.sort_order}
                onChange={(event) => setForm((current) => ({ ...current, sort_order: Number(event.target.value) }))}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Offer image upload" hint="JPG, PNG or WebP • Maximum 5 MB • No URL required">
            {form.image_url && (
              <div className="relative mb-3 h-32 overflow-hidden rounded-xl bg-slate-950">
                <Image src={form.image_url} alt="Current offer" fill sizes="380px" className="object-cover" />
              </div>
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setImageFile(event.target.files?.[0] ?? null)
              }
              className="w-full text-xs text-slate-400"
            />
          </Field>

          <div className="flex flex-wrap gap-5 text-sm font-bold text-slate-300">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))}
                className="size-4 accent-cyan-300"
              />
              Featured first
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))}
                className="size-4 accent-cyan-300"
              />
              Public
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              disabled={saving}
              type="submit"
              className="focus-ring min-h-12 rounded-xl bg-cyan-300 px-4 font-black text-slate-950 disabled:opacity-50"
            >
              {saving ? "Saving…" : form.id ? "Update offer" : "Add offer"}
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(blankOffer);
                setImageFile(null);
                setMessage("Offer form cleared.");
              }}
              className="focus-ring min-h-12 rounded-xl border border-slate-700 px-4 font-black text-white"
            >
              Clear
            </button>
          </div>
        </div>
      </form>

      <section>
        <p className="rounded-xl border border-cyan-300/10 bg-cyan-300/5 p-3 text-sm text-cyan-100" aria-live="polite">
          {message}
        </p>

        <div className="mt-4 grid gap-4">
          {rows.length ? (
            rows.map((row) => (
              <article key={row.id} className="surface overflow-hidden rounded-3xl">
                <div className="grid gap-0 sm:grid-cols-[180px_1fr]">
                  <div className="relative min-h-40 bg-slate-950">
                    {row.image_url ? (
                      <Image src={row.image_url} alt={row.title} fill sizes="180px" className="object-cover" />
                    ) : (
                      <div className="grid h-full min-h-40 place-items-center p-5 text-center text-lg font-black text-cyan-200">
                        {row.discount_label || "Offer"}
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row">
                      <div>
                        <h3 className="text-xl font-black text-white">{row.title}</h3>
                        <p className="mt-2 text-sm text-slate-400">{row.description}</p>
                        <p className="mt-3 text-xs font-bold text-slate-500">
                          {[row.discount_label, row.active ? "Public" : "Draft", row.featured ? "Featured" : ""]
                            .filter(Boolean)
                            .join(" • ")}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button type="button" onClick={() => edit(row)} className="h-10 rounded-xl border border-slate-700 px-4 text-xs font-black text-cyan-200">
                          Edit
                        </button>
                        <button type="button" onClick={() => void remove(row)} className="h-10 rounded-xl border border-rose-400/30 px-4 text-xs font-black text-rose-200">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="surface rounded-3xl p-8 text-slate-500">
              No offers yet. Add the first offer using the form.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ReviewsCms() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<Review[]>([]);
  const [form, setForm] = useState<ReviewForm>(blankReview);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState("Loading reviews…");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("review_date", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    setRows((data ?? []) as Review[]);
    setMessage("Reviews CMS ready. Publish only genuine customer feedback.");
  }, [supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setMessage("Saving review…");

    try {
      if (!form.customer_name.trim()) throw new Error("Customer display name is required.");
      if (form.review_text.trim().length < 10) throw new Error("Review must contain at least 10 characters.");
      if (form.rating < 1 || form.rating > 5) throw new Error("Rating must be between 1 and 5.");

      const previousImage = form.image_url;
      const uploaded = await uploadImage(supabase, "review-images", imageFile);
      const payload = {
        customer_name: form.customer_name.trim(),
        customer_city: form.customer_city.trim(),
        rating: Number(form.rating),
        review_text: form.review_text.trim(),
        product_or_service: form.product_or_service.trim(),
        image_url: uploaded || form.image_url,
        verified_customer: form.verified_customer,
        featured: form.featured,
        published: form.published,
        sort_order: Number(form.sort_order) || 0,
        review_date: form.review_date,
      };

      const result = form.id
        ? await supabase.from("reviews").update(payload).eq("id", form.id)
        : await supabase.from("reviews").insert(payload);

      if (result.error) throw result.error;

      if (uploaded && previousImage && uploaded !== previousImage) {
        await removeImage(supabase, "review-images", previousImage);
      }

      setForm(blankReview);
      setImageFile(null);
      setMessage("Review saved.");
      await load();
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save review.");
    } finally {
      setSaving(false);
    }
  }

  function edit(row: Review) {
    setForm({
      id: row.id,
      customer_name: row.customer_name,
      customer_city: row.customer_city,
      rating: row.rating,
      review_text: row.review_text,
      product_or_service: row.product_or_service,
      image_url: row.image_url,
      verified_customer: row.verified_customer,
      featured: row.featured,
      published: row.published,
      sort_order: row.sort_order,
      review_date: row.review_date,
    });
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(row: Review) {
    if (!window.confirm(`Delete review from "${row.customer_name}"?`)) return;

    const { error } = await supabase.from("reviews").delete().eq("id", row.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    await removeImage(supabase, "review-images", row.image_url);
    setMessage("Review deleted.");
    await load();
    router.refresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[430px_1fr]">
      <form onSubmit={save} className="surface h-fit rounded-3xl p-6 xl:sticky xl:top-28">
        <h2 className="text-2xl font-black text-white">
          {form.id ? "Edit review" : "Add review"}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Add genuine feedback, ratings and an optional customer image.
        </p>

        <div className="mt-6 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <Field label="Customer display name">
              <input
                required
                value={form.customer_name}
                onChange={(event) => setForm((current) => ({ ...current, customer_name: event.target.value }))}
                className={inputClass}
              />
            </Field>
            <Field label="City">
              <input
                value={form.customer_city}
                onChange={(event) => setForm((current) => ({ ...current, customer_city: event.target.value }))}
                className={inputClass}
              />
            </Field>
            <Field label="Rating">
              <select
                value={form.rating}
                onChange={(event) => setForm((current) => ({ ...current, rating: Number(event.target.value) }))}
                className={inputClass}
              >
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>{rating} star{rating === 1 ? "" : "s"}</option>
                ))}
              </select>
            </Field>
            <Field label="Product or service">
              <input
                value={form.product_or_service}
                onChange={(event) => setForm((current) => ({ ...current, product_or_service: event.target.value }))}
                className={inputClass}
              />
            </Field>
            <Field label="Review date">
              <input
                type="date"
                value={form.review_date}
                onChange={(event) => setForm((current) => ({ ...current, review_date: event.target.value }))}
                className={inputClass}
              />
            </Field>
            <Field label="Sort order">
              <input
                type="number"
                value={form.sort_order}
                onChange={(event) => setForm((current) => ({ ...current, sort_order: Number(event.target.value) }))}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Customer review">
            <textarea
              required
              minLength={10}
              rows={5}
              value={form.review_text}
              onChange={(event) => setForm((current) => ({ ...current, review_text: event.target.value }))}
              className={textareaClass}
            />
          </Field>

          <Field label="Customer/review image upload" hint="Optional • JPG, PNG or WebP • Maximum 5 MB • No URL required">
            {form.image_url && (
              <div className="relative mb-3 size-24 overflow-hidden rounded-2xl bg-slate-950">
                <Image src={form.image_url} alt="Current review" fill sizes="96px" className="object-cover" />
              </div>
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setImageFile(event.target.files?.[0] ?? null)
              }
              className="w-full text-xs text-slate-400"
            />
          </Field>

          <div className="flex flex-wrap gap-5 text-sm font-bold text-slate-300">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.verified_customer}
                onChange={(event) => setForm((current) => ({ ...current, verified_customer: event.target.checked }))}
                className="size-4 accent-cyan-300"
              />
              Verified customer
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))}
                className="size-4 accent-cyan-300"
              />
              Featured first
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(event) => setForm((current) => ({ ...current, published: event.target.checked }))}
                className="size-4 accent-cyan-300"
              />
              Published
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              disabled={saving}
              type="submit"
              className="focus-ring min-h-12 rounded-xl bg-cyan-300 px-4 font-black text-slate-950 disabled:opacity-50"
            >
              {saving ? "Saving…" : form.id ? "Update review" : "Add review"}
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(blankReview);
                setImageFile(null);
                setMessage("Review form cleared.");
              }}
              className="focus-ring min-h-12 rounded-xl border border-slate-700 px-4 font-black text-white"
            >
              Clear
            </button>
          </div>
        </div>
      </form>

      <section>
        <p className="rounded-xl border border-cyan-300/10 bg-cyan-300/5 p-3 text-sm text-cyan-100" aria-live="polite">
          {message}
        </p>

        <div className="mt-4 grid gap-4">
          {rows.length ? (
            rows.map((row) => (
              <article key={row.id} className="surface rounded-3xl p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="flex gap-4">
                    {row.image_url ? (
                      <Image src={row.image_url} alt={row.customer_name} width={64} height={64} className="size-16 rounded-2xl object-cover" />
                    ) : (
                      <span className="grid size-16 place-items-center rounded-2xl bg-cyan-300 font-black text-slate-950">
                        {row.customer_name.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    <div>
                      <h3 className="font-black text-white">{row.customer_name}</h3>
                      <p className="mt-1 text-amber-300">{"★".repeat(row.rating)}<span className="text-slate-700">{"★".repeat(5 - row.rating)}</span></p>
                      <p className="mt-2 max-w-2xl text-sm text-slate-400">{row.review_text}</p>
                      <p className="mt-3 text-xs font-bold text-slate-500">
                        {[row.customer_city, row.product_or_service, row.published ? "Published" : "Draft", row.verified_customer ? "Verified" : ""]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => edit(row)} className="h-10 rounded-xl border border-slate-700 px-4 text-xs font-black text-cyan-200">
                      Edit
                    </button>
                    <button type="button" onClick={() => void remove(row)} className="h-10 rounded-xl border border-rose-400/30 px-4 text-xs font-black text-rose-200">
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="surface rounded-3xl p-8 text-slate-500">
              No reviews yet. Publish genuine customer feedback from this section.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
