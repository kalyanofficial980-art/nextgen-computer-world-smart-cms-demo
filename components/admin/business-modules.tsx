"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { fallbackSettings } from "@/lib/cms-repository";
import type {
  ActivityLog,
  BusinessSettings,
  Customer,
  Faq,
  HomepageSection,
  LegalPage,
  MediaItem,
  MediaProvider,
  Offer,
  Review,
  Sale,
} from "@/lib/cms-types";

type ModuleName =
  | "overview"
  | "activity"
  | "branding"
  | "business"
  | "offers"
  | "reviews"
  | "media"
  | "customers"
  | "sales"
  | "homepage"
  | "legal"
  | "faq"
  | "categories";

type ProductChoice = { id: string; name: string; sku: string | null; price: number; stock_quantity: number };

type DashboardCounts = {
  products: number;
  enquiries: number;
  offers: number;
  reviews: number;
  customers: number;
  sales: number;
  revenue: number;
};

const blankOffer: Omit<Offer, "id"> = {
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

const blankReview: Omit<Review, "id"> = {
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

const blankMedia: Omit<MediaItem, "id"> = {
  title: "",
  description: "",
  provider: "youtube",
  media_url: "",
  thumbnail_url: "",
  show_on_homepage: true,
  featured: false,
  published: true,
  sort_order: 0,
};

const blankCustomer: Omit<Customer, "id"> = {
  full_name: "",
  phone: "",
  email: "",
  city: "",
  address: "",
  notes: "",
  marketing_consent: false,
};

const blankSale: Omit<Sale, "id"> = {
  product_id: null,
  customer_id: null,
  product_name: "",
  sku: "",
  quantity: 1,
  unit_price: 0,
  total_amount: 0,
  cost_amount: null,
  payment_status: "Paid",
  payment_method: "",
  invoice_reference: "",
  warranty_until: null,
  customer_city: "",
  public_note: "",
  private_note: "",
  sold_at: new Date().toISOString().slice(0, 16),
};

const blankFaq: Omit<Faq, "id"> = {
  question: "",
  answer: "",
  category: "General",
  active: true,
  sort_order: 0,
};

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function toLocalInput(value: string | null | undefined) {
  return value ? new Date(value).toISOString().slice(0, 16) : "";
}

function numberValue(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function Message({ value }: { value: string }) {
  return <p className="mt-4 rounded-xl border border-cyan-300/15 bg-cyan-300/5 p-3 text-sm text-cyan-100" aria-live="polite">{value}</p>;
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="admin-label">{label}</span>
      {hint && <span className="mb-2 block text-[11px] text-slate-500">{hint}</span>}
      {children}
    </label>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm font-bold text-slate-300">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="size-4 accent-cyan-300" />
      {label}
    </label>
  );
}

async function uploadFile(
  supabase: ReturnType<typeof createClient>,
  bucket: string,
  file: File,
  allowedTypes: string[],
  maxBytes: number,
) {
  if (!allowedTypes.includes(file.type)) throw new Error(`Unsupported file type: ${file.type}`);
  if (file.size > maxBytes) throw new Error(`File is larger than ${Math.round(maxBytes / 1024 / 1024)} MB.`);

  const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

function uploadedStoragePath(url: string, bucket: string) {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = url.indexOf(marker);
  return index >= 0 ? decodeURIComponent(url.slice(index + marker.length)) : null;
}

async function removeUploadedFile(
  supabase: ReturnType<typeof createClient>,
  bucket: string,
  url: string,
) {
  const path = uploadedStoragePath(url, bucket);
  if (path) await supabase.storage.from(bucket).remove([path]);
}

function normalizeDestination(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("/")) return trimmed;

  const parsed = new URL(trimmed);
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error("Links must use http, https or an internal /path.");
  }
  return parsed.toString();
}

function validateSocialMediaUrl(provider: MediaProvider, value: string) {
  const parsed = new URL(value);
  if (parsed.protocol !== "https:") throw new Error("Media URLs must use HTTPS.");
  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  const allowed: Record<Exclude<MediaProvider, "uploaded">, string[]> = {
    youtube: ["youtube.com", "youtu.be"],
    instagram: ["instagram.com"],
    facebook: ["facebook.com", "fb.watch"],
  };
  if (provider !== "uploaded" && !allowed[provider].some((domain) => host === domain || host.endsWith(`.${domain}`))) {
    throw new Error(`Add a valid ${provider} URL.`);
  }
  return parsed.toString();
}

function validateHexColour(value: string, label: string) {
  if (!/^#[0-9a-f]{6}$/i.test(value)) throw new Error(`${label} must be a 6-digit hex colour.`);
}

function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number | null | undefined>>) {
  const escape = (value: string | number | null | undefined) => {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
  };
  const csv = [headers.map(escape).join(","), ...rows.map((row) => row.map(escape).join(","))].join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function AdvancedBusinessModule({ module }: { module: ModuleName }) {
  if (module === "overview") return <OverviewPanel />;
  if (module === "activity") return <ActivityPanel />;
  if (module === "branding" || module === "business") return <SettingsPanel focus={module} />;
  if (module === "offers") return <OffersPanel />;
  if (module === "reviews") return <ReviewsPanel />;
  if (module === "media") return <MediaPanel />;
  if (module === "customers") return <CustomersPanel />;
  if (module === "sales") return <SalesPanel />;
  if (module === "homepage") return <HomepagePanel />;
  if (module === "legal") return <LegalPanel />;
  if (module === "categories") return <CategoriesPanel />;
  return <FaqPanel />;
}

function ActivityPanel() {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<ActivityLog[]>([]);
  const [message, setMessage] = useState("Loading activity history…");

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) setMessage(error.message);
    else {
      setRows((data ?? []) as ActivityLog[]);
      setMessage("Showing the latest 100 CMS changes.");
    }
  }, [supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  return (
    <div>
      <div className="surface overflow-hidden rounded-3xl">
        <div className="border-b border-slate-700 p-6">
          <h2 className="text-2xl font-black text-white">CMS activity log</h2>
          <p className="mt-2 text-sm text-slate-500">
            Product, sales, customer, marketing and website-setting changes are recorded automatically.
          </p>
        </div>
        {rows.length ? (
          <div className="divide-y divide-slate-800">
            {rows.map((row) => {
              const label = String(row.details?.label ?? row.entity_id ?? "");
              return (
                <article key={row.id} className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center">
                  <div>
                    <strong className="text-sm text-white">
                      {row.action.toUpperCase()} • {row.entity_type}
                    </strong>
                    {label && <p className="mt-1 text-xs text-slate-500">{label}</p>}
                  </div>
                  <time className="text-xs text-slate-500" dateTime={row.created_at}>
                    {new Date(row.created_at).toLocaleString("en-IN")}
                  </time>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="p-10 text-center text-slate-500">No activity has been recorded yet.</div>
        )}
      </div>
      <Message value={message} />
    </div>
  );
}

function OverviewPanel() {
  const supabase = useMemo(() => createClient(), []);
  const [counts, setCounts] = useState<DashboardCounts>({ products: 0, enquiries: 0, offers: 0, reviews: 0, customers: 0, sales: 0, revenue: 0 });
  const [message, setMessage] = useState("Loading business summary…");

  const load = useCallback(async () => {
    const [products, enquiries, offers, reviews, customers, sales] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("enquiries").select("id", { count: "exact", head: true }),
      supabase.from("offers").select("id", { count: "exact", head: true }).eq("active", true),
      supabase.from("reviews").select("id", { count: "exact", head: true }).eq("published", true),
      supabase.from("customers").select("id", { count: "exact", head: true }),
      supabase.from("sales").select("id,total_amount,payment_status"),
    ]);

    const errors = [products.error, enquiries.error, offers.error, reviews.error, customers.error, sales.error].filter(Boolean);
    if (errors.length) {
      setMessage(errors[0]?.message || "Unable to load overview.");
      return;
    }

    const saleRows = (sales.data ?? []) as Array<{ total_amount: number | string; payment_status: string }>;
    setCounts({
      products: products.count ?? 0,
      enquiries: enquiries.count ?? 0,
      offers: offers.count ?? 0,
      reviews: reviews.count ?? 0,
      customers: customers.count ?? 0,
      sales: saleRows.length,
      revenue: saleRows.filter((row) => row.payment_status === "Paid").reduce((total, row) => total + Number(row.total_amount), 0),
    });
    setMessage("Business dashboard is live.");
  }, [supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const cards = [
    ["Products", counts.products],
    ["Enquiries", counts.enquiries],
    ["Active offers", counts.offers],
    ["Reviews", counts.reviews],
    ["Customers", counts.customers],
    ["Sales records", counts.sales],
  ];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value]) => (
          <div key={label} className="surface rounded-3xl p-6">
            <span className="text-xs font-black tracking-[0.12em] text-slate-500 uppercase">{label}</span>
            <strong className="mt-3 block text-4xl font-black text-white">{value}</strong>
          </div>
        ))}
      </div>
      <div className="surface mt-5 rounded-3xl p-6">
        <span className="text-xs font-black tracking-[0.12em] text-slate-500 uppercase">Paid sales value</span>
        <strong className="mt-3 block text-4xl font-black text-emerald-300">₹{counts.revenue.toLocaleString("en-IN")}</strong>
        <p className="mt-2 text-sm text-slate-500">Calculated from records marked Paid. This is an operational summary, not accounting software.</p>
      </div>
      <Message value={message} />
    </div>
  );
}

function SettingsPanel({ focus }: { focus: "branding" | "business" }) {
  const supabase = useMemo(() => createClient(), []);
  const [settings, setSettings] = useState<BusinessSettings>(fallbackSettings);
  const [message, setMessage] = useState("Loading website settings…");
  const [saving, setSaving] = useState(false);
  const [logo, setLogo] = useState<File | null>(null);
  const [darkLogo, setDarkLogo] = useState<File | null>(null);
  const [favicon, setFavicon] = useState<File | null>(null);
  const [hero, setHero] = useState<File | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
    if (error) setMessage(error.message);
    else {
      setSettings({ ...fallbackSettings, ...(data as BusinessSettings | null) });
      setMessage("Website settings loaded.");
    }
  }, [supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  function update<K extends keyof BusinessSettings>(key: K, value: BusinessSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setMessage("Uploading assets and saving settings…");

    try {
      validateHexColour(settings.primary_color, "Primary colour");
      validateHexColour(settings.secondary_color, "Secondary colour");
      validateHexColour(settings.accent_color, "Action colour");
      validateHexColour(settings.background_color, "Background colour");
      validateHexColour(settings.panel_color, "Panel colour");
      validateHexColour(settings.text_color, "Text colour");

      const previous = {
        logo: settings.logo_url,
        darkLogo: settings.logo_dark_url,
        favicon: settings.favicon_url,
        hero: settings.hero_image_url,
      };
      const imageTypes = ["image/jpeg", "image/png", "image/webp"];
      const logoUrl = logo ? await uploadFile(supabase, "brand-assets", logo, imageTypes, 5 * 1024 * 1024) : settings.logo_url;
      const darkLogoUrl = darkLogo ? await uploadFile(supabase, "brand-assets", darkLogo, imageTypes, 5 * 1024 * 1024) : settings.logo_dark_url;
      const faviconUrl = favicon ? await uploadFile(supabase, "brand-assets", favicon, [...imageTypes, "image/x-icon"], 2 * 1024 * 1024) : settings.favicon_url;
      const heroUrl = hero ? await uploadFile(supabase, "brand-assets", hero, imageTypes, 8 * 1024 * 1024) : settings.hero_image_url;
      const payload = {
        ...settings,
        id: 1,
        owner_email: process.env.NEXT_PUBLIC_OWNER_EMAIL || settings.owner_email,
        map_url: normalizeDestination(settings.map_url),
        announcement_link: normalizeDestination(settings.announcement_link),
        youtube_url: normalizeDestination(settings.youtube_url),
        instagram_url: normalizeDestination(settings.instagram_url),
        facebook_url: normalizeDestination(settings.facebook_url),
        google_business_url: normalizeDestination(settings.google_business_url),
        logo_url: logoUrl,
        logo_dark_url: darkLogoUrl,
        favicon_url: faviconUrl,
        hero_image_url: heroUrl,
      };
      delete payload.updated_at;
      const { error } = await supabase.from("site_settings").upsert(payload, { onConflict: "id" });
      if (error) throw error;

      if (logo && previous.logo !== logoUrl) await removeUploadedFile(supabase, "brand-assets", previous.logo);
      if (darkLogo && previous.darkLogo !== darkLogoUrl) await removeUploadedFile(supabase, "brand-assets", previous.darkLogo);
      if (favicon && previous.favicon !== faviconUrl) await removeUploadedFile(supabase, "brand-assets", previous.favicon);
      if (hero && previous.hero !== heroUrl) await removeUploadedFile(supabase, "brand-assets", previous.hero);

      setSettings(payload);
      setLogo(null); setDarkLogo(null); setFavicon(null); setHero(null);
      setMessage("Website settings saved. Refresh the public website to see changes.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="surface rounded-3xl p-6 sm:p-8">
      <h2 className="text-2xl font-black text-white">{focus === "branding" ? "Branding and website colours" : "Business and contact details"}</h2>
      <p className="mt-2 text-sm text-slate-500">All values are stored in Supabase and used by the public website.</p>

      {focus === "branding" ? (
        <div className="mt-7 grid gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Business name"><input className="admin-input" value={settings.business_name} onChange={(event) => update("business_name", event.target.value)} /></Field>
            <Field label="Short logo text"><input className="admin-input" maxLength={6} value={settings.short_name} onChange={(event) => update("short_name", event.target.value)} /></Field>
            <Field label="Tagline"><input className="admin-input" value={settings.tagline} onChange={(event) => update("tagline", event.target.value)} /></Field>
            <Field label="Website description"><textarea className="admin-textarea" rows={3} value={settings.description} onChange={(event) => update("description", event.target.value)} /></Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {([
              ["primary_color", "Primary colour"],
              ["secondary_color", "Secondary colour"],
              ["accent_color", "Action colour"],
              ["background_color", "Background colour"],
              ["panel_color", "Panel colour"],
              ["text_color", "Text colour"],
            ] as const).map(([key, label]) => (
              <Field key={key} label={label}>
                <div className="flex gap-2">
                  <input type="color" value={settings[key]} onChange={(event) => update(key, event.target.value)} className="h-11 w-14 rounded-lg border border-slate-700 bg-slate-950 p-1" />
                  <input value={settings[key]} onChange={(event) => update(key, event.target.value)} className="admin-input min-w-0" />
                </div>
              </Field>
            ))}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <FileField label="Main logo upload" accept="image/png,image/jpeg,image/webp" current={settings.logo_url} onChange={setLogo} />
            <FileField label="Dark-footer logo upload" accept="image/png,image/jpeg,image/webp" current={settings.logo_dark_url} onChange={setDarkLogo} />
            <FileField label="Favicon upload" accept="image/png,image/jpeg,image/webp,image/x-icon" current={settings.favicon_url} onChange={setFavicon} />
            <FileField label="Homepage hero image" accept="image/png,image/jpeg,image/webp" current={settings.hero_image_url} onChange={setHero} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Hero badge"><input className="admin-input" value={settings.hero_badge} onChange={(event) => update("hero_badge", event.target.value)} /></Field>
            <Field label="Hero heading"><input className="admin-input" value={settings.hero_title} onChange={(event) => update("hero_title", event.target.value)} /></Field>
            <Field label="Hero description"><textarea className="admin-textarea" rows={4} value={settings.hero_description} onChange={(event) => update("hero_description", event.target.value)} /></Field>
          </div>
        </div>
      ) : (
        <div className="mt-7 grid gap-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Field label="Phone display"><input className="admin-input" value={settings.phone_display} onChange={(event) => update("phone_display", event.target.value)} /></Field>
            <Field label="Phone link"><input className="admin-input" value={settings.phone_link} onChange={(event) => update("phone_link", event.target.value)} /></Field>
            <Field label="WhatsApp number"><input className="admin-input" value={settings.whatsapp_number} onChange={(event) => update("whatsapp_number", event.target.value)} /></Field>
            <Field label="Contact email"><input type="email" className="admin-input" value={settings.contact_email} onChange={(event) => update("contact_email", event.target.value)} /></Field>
            <Field label="Owner email" hint="Authentication owner email is controlled by NEXT_PUBLIC_OWNER_EMAIL and cannot be changed here."><input type="email" className="admin-input opacity-70" value={process.env.NEXT_PUBLIC_OWNER_EMAIL || settings.owner_email} readOnly /></Field>
            <Field label="Working hours"><input className="admin-input" value={settings.working_hours} onChange={(event) => update("working_hours", event.target.value)} /></Field>
            <Field label="Address"><textarea className="admin-textarea" rows={3} value={settings.address_line} onChange={(event) => update("address_line", event.target.value)} /></Field>
            <Field label="Google Maps URL"><input className="admin-input" value={settings.map_url} onChange={(event) => update("map_url", event.target.value)} /></Field>
            <Field label="Service areas" hint="Comma-separated"><input className="admin-input" value={settings.service_areas.join(", ")} onChange={(event) => update("service_areas", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))} /></Field>
            <Field label="GST number"><input className="admin-input" value={settings.gst_number} onChange={(event) => update("gst_number", event.target.value)} /></Field>
            <Field label="Registration number"><input className="admin-input" value={settings.registration_number} onChange={(event) => update("registration_number", event.target.value)} /></Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="YouTube channel URL"><input className="admin-input" value={settings.youtube_url} onChange={(event) => update("youtube_url", event.target.value)} /></Field>
            <Field label="Instagram URL"><input className="admin-input" value={settings.instagram_url} onChange={(event) => update("instagram_url", event.target.value)} /></Field>
            <Field label="Facebook URL"><input className="admin-input" value={settings.facebook_url} onChange={(event) => update("facebook_url", event.target.value)} /></Field>
            <Field label="Google Business URL"><input className="admin-input" value={settings.google_business_url} onChange={(event) => update("google_business_url", event.target.value)} /></Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Announcement text"><input className="admin-input" value={settings.announcement_text} onChange={(event) => update("announcement_text", event.target.value)} /></Field>
            <Field label="Announcement link"><input className="admin-input" value={settings.announcement_link} onChange={(event) => update("announcement_link", event.target.value)} /></Field>
          </div>
          <div className="flex flex-wrap gap-5">
            <Check label="Show announcement" checked={settings.announcement_active} onChange={(value) => update("announcement_active", value)} />
            <Check label="Show public sold statistics" checked={settings.show_public_sales_stats} onChange={(value) => update("show_public_sales_stats", value)} />
            <Check label="Show recent sold history" checked={settings.show_recent_sales} onChange={(value) => update("show_recent_sales", value)} />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Google Analytics ID"><input className="admin-input" value={settings.google_analytics_id} onChange={(event) => update("google_analytics_id", event.target.value)} /></Field>
            <Field label="Meta Pixel ID"><input className="admin-input" value={settings.meta_pixel_id} onChange={(event) => update("meta_pixel_id", event.target.value)} /></Field>
            <Field label="Search Console verification"><input className="admin-input" value={settings.search_console_verification} onChange={(event) => update("search_console_verification", event.target.value)} /></Field>
          </div>
        </div>
      )}

      <button disabled={saving} className="mt-7 min-h-12 rounded-xl bg-cyan-300 px-6 font-black text-slate-950 disabled:opacity-50">{saving ? "Saving…" : "Save settings"}</button>
      <Message value={message} />
    </form>
  );
}

function FileField({ label, accept, current, onChange }: { label: string; accept: string; current: string; onChange: (file: File | null) => void }) {
  return (
    <Field label={label} hint={current ? `Current: ${current}` : "No uploaded asset"}>
      <input type="file" accept={accept} onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.files?.[0] ?? null)} className="w-full rounded-xl border border-dashed border-slate-700 p-4 text-xs text-slate-400" />
    </Field>
  );
}

function OffersPanel() {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<Offer[]>([]);
  const [form, setForm] = useState<Omit<Offer, "id"> & { id?: string }>({ ...blankOffer });
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("Loading offers…");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("offers")
      .select("*")
      .order("sort_order")
      .order("created_at", { ascending: false });

    if (error) setMessage(error.message);
    else {
      setRows((data ?? []) as Offer[]);
      setMessage("Offers loaded.");
    }
  }, [supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setMessage("Saving offer…");

    try {
      const previousImage = form.image_url;
      const imageUrl = file
        ? await uploadFile(
            supabase,
            "offer-images",
            file,
            ["image/jpeg", "image/png", "image/webp"],
            5 * 1024 * 1024,
          )
        : form.image_url;
      const { id, ...values } = form;
      const startsAt = values.starts_at
        ? new Date(values.starts_at).toISOString()
        : null;
      const endsAt = values.ends_at ? new Date(values.ends_at).toISOString() : null;

      if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) {
        throw new Error("Offer end date must be after the start date.");
      }

      const payload = {
        ...values,
        slug: slugify(values.slug || values.title),
        image_url: imageUrl,
        button_link: normalizeDestination(values.button_link || "/catalogue"),
        starts_at: startsAt,
        ends_at: endsAt,
      };

      const result = id
        ? await supabase.from("offers").update(payload).eq("id", id)
        : await supabase.from("offers").insert(payload);

      if (result.error) throw result.error;
      if (file && previousImage !== imageUrl) {
        await removeUploadedFile(supabase, "offer-images", previousImage);
      }

      setForm({ ...blankOffer });
      setFile(null);
      setMessage("Offer saved.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Offer save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: Offer) {
    if (!window.confirm("Delete this offer?")) return;
    const { error } = await supabase.from("offers").delete().eq("id", row.id);
    if (!error) await removeUploadedFile(supabase, "offer-images", row.image_url);
    setMessage(error ? error.message : "Offer deleted.");
    if (!error) await load();
  }

  return (
    <CrudLayout
      title="Offers"
      message={message}
      form={
        <form onSubmit={save} className="grid gap-4">
          <Field label="Offer title">
            <input required className="admin-input" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          </Field>
          <Field label="Slug">
            <input className="admin-input" value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} />
          </Field>
          <Field label="Description">
            <textarea required className="admin-textarea" rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Discount label"><input className="admin-input" placeholder="Save 15%" value={form.discount_label} onChange={(event) => setForm({ ...form, discount_label: event.target.value })} /></Field>
            <Field label="Coupon code"><input className="admin-input" value={form.coupon_code} onChange={(event) => setForm({ ...form, coupon_code: event.target.value })} /></Field>
            <Field label="Button label"><input className="admin-input" value={form.button_label} onChange={(event) => setForm({ ...form, button_label: event.target.value })} /></Field>
            <Field label="Button link" hint="Use /catalogue, /contact or a full HTTPS URL"><input className="admin-input" value={form.button_link} onChange={(event) => setForm({ ...form, button_link: event.target.value })} /></Field>
            <Field label="Start date"><input type="datetime-local" className="admin-input" value={toLocalInput(form.starts_at)} onChange={(event) => setForm({ ...form, starts_at: event.target.value || null })} /></Field>
            <Field label="End date"><input type="datetime-local" className="admin-input" value={toLocalInput(form.ends_at)} onChange={(event) => setForm({ ...form, ends_at: event.target.value || null })} /></Field>
            <Field label="Sort order"><input type="number" className="admin-input" value={form.sort_order} onChange={(event) => setForm({ ...form, sort_order: numberValue(event.target.value) })} /></Field>
          </div>
          <FileField label="Offer banner image" accept="image/png,image/jpeg,image/webp" current={form.image_url} onChange={setFile} />
          <div className="flex gap-5">
            <Check label="Featured" checked={form.featured} onChange={(value) => setForm({ ...form, featured: value })} />
            <Check label="Active" checked={form.active} onChange={(value) => setForm({ ...form, active: value })} />
          </div>
          <FormButtons editing={Boolean(form.id)} clear={() => { setForm({ ...blankOffer }); setFile(null); }} saving={saving} />
        </form>
      }
      list={
        <CardList
          rows={rows}
          render={(row) => ({
            title: row.title,
            meta: [row.discount_label, row.active ? "Active" : "Draft", row.featured ? "Featured" : ""].filter(Boolean).join(" • "),
            edit: () => setForm({ ...row, starts_at: row.starts_at, ends_at: row.ends_at }),
            remove: () => void remove(row),
          })}
        />
      }
    />
  );
}

function ReviewsPanel() {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<Review[]>([]);
  const [form, setForm] = useState<Omit<Review, "id"> & { id?: string }>({ ...blankReview });
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("Loading reviews…");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("reviews").select("*").order("review_date", { ascending: false });
    if (error) setMessage(error.message);
    else {
      setRows((data ?? []) as Review[]);
      setMessage("Reviews loaded.");
    }
  }, [supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setMessage("Saving review…");

    try {
      const previousImage = form.image_url;
      const imageUrl = file
        ? await uploadFile(supabase, "review-images", file, ["image/jpeg", "image/png", "image/webp"], 5 * 1024 * 1024)
        : form.image_url;
      const { id, ...values } = form;
      const payload = { ...values, image_url: imageUrl };
      const result = id
        ? await supabase.from("reviews").update(payload).eq("id", id)
        : await supabase.from("reviews").insert(payload);

      if (result.error) throw result.error;
      if (file && previousImage !== imageUrl) {
        await removeUploadedFile(supabase, "review-images", previousImage);
      }

      setForm({ ...blankReview });
      setFile(null);
      setMessage("Review saved.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Review save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: Review) {
    if (!window.confirm("Delete this review?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", row.id);
    if (!error) await removeUploadedFile(supabase, "review-images", row.image_url);
    setMessage(error ? error.message : "Review deleted.");
    if (!error) await load();
  }

  return (
    <CrudLayout
      title="Customer reviews"
      message={message}
      form={
        <form onSubmit={save} className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Customer name"><input required className="admin-input" value={form.customer_name} onChange={(event) => setForm({ ...form, customer_name: event.target.value })} /></Field>
            <Field label="City"><input className="admin-input" value={form.customer_city} onChange={(event) => setForm({ ...form, customer_city: event.target.value })} /></Field>
            <Field label="Rating"><select className="admin-input" value={form.rating} onChange={(event) => setForm({ ...form, rating: numberValue(event.target.value) })}>{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}</select></Field>
            <Field label="Product or service"><input className="admin-input" value={form.product_or_service} onChange={(event) => setForm({ ...form, product_or_service: event.target.value })} /></Field>
            <Field label="Review date"><input type="date" className="admin-input" value={form.review_date} onChange={(event) => setForm({ ...form, review_date: event.target.value })} /></Field>
            <Field label="Sort order"><input type="number" className="admin-input" value={form.sort_order} onChange={(event) => setForm({ ...form, sort_order: numberValue(event.target.value) })} /></Field>
          </div>
          <Field label="Review"><textarea required minLength={10} className="admin-textarea" rows={5} value={form.review_text} onChange={(event) => setForm({ ...form, review_text: event.target.value })} /></Field>
          <FileField label="Customer/review image" accept="image/png,image/jpeg,image/webp" current={form.image_url} onChange={setFile} />
          <div className="flex flex-wrap gap-5">
            <Check label="Verified customer" checked={form.verified_customer} onChange={(value) => setForm({ ...form, verified_customer: value })} />
            <Check label="Featured" checked={form.featured} onChange={(value) => setForm({ ...form, featured: value })} />
            <Check label="Published" checked={form.published} onChange={(value) => setForm({ ...form, published: value })} />
          </div>
          <FormButtons editing={Boolean(form.id)} clear={() => { setForm({ ...blankReview }); setFile(null); }} saving={saving} />
        </form>
      }
      list={<CardList rows={rows} render={(row) => ({ title: `${row.customer_name} — ${"★".repeat(row.rating)}`, meta: [row.customer_city, row.product_or_service, row.published ? "Published" : "Draft"].filter(Boolean).join(" • "), edit: () => setForm({ ...row }), remove: () => void remove(row) })} />}
    />
  );
}

function MediaPanel() {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<MediaItem[]>([]);
  const [form, setForm] = useState<Omit<MediaItem, "id"> & { id?: string }>({ ...blankMedia });
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [message, setMessage] = useState("Loading media…");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("media_items").select("*").order("sort_order");
    if (error) setMessage(error.message);
    else {
      setRows((data ?? []) as MediaItem[]);
      setMessage("Media loaded.");
    }
  }, [supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setMessage("Saving media…");

    try {
      const previousThumbnail = form.thumbnail_url;
      const previousMedia = form.media_url;
      const thumbnailUrl = thumbnail
        ? await uploadFile(supabase, "media-assets", thumbnail, ["image/jpeg", "image/png", "image/webp"], 5 * 1024 * 1024)
        : form.thumbnail_url;
      const uploadedMediaUrl = mediaFile
        ? await uploadFile(supabase, "media-assets", mediaFile, ["video/mp4", "video/webm"], 50 * 1024 * 1024)
        : "";
      const provider: MediaProvider = mediaFile ? "uploaded" : form.provider;
      const mediaUrl = provider === "uploaded"
        ? uploadedMediaUrl || form.media_url
        : validateSocialMediaUrl(provider, form.media_url);

      if (!mediaUrl) {
        throw new Error("Add a YouTube, Instagram or Facebook URL, or upload an MP4/WebM video.");
      }

      const { id, ...values } = form;
      const payload = {
        ...values,
        provider,
        media_url: mediaUrl,
        thumbnail_url: thumbnailUrl,
      };
      const result = id
        ? await supabase.from("media_items").update(payload).eq("id", id)
        : await supabase.from("media_items").insert(payload);

      if (result.error) throw result.error;
      if (thumbnail && previousThumbnail !== thumbnailUrl) {
        await removeUploadedFile(supabase, "media-assets", previousThumbnail);
      }
      if (mediaFile && previousMedia !== mediaUrl) {
        await removeUploadedFile(supabase, "media-assets", previousMedia);
      }

      setForm({ ...blankMedia });
      setThumbnail(null);
      setMediaFile(null);
      setMessage("Media saved.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Media save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: MediaItem) {
    if (!window.confirm("Delete this media item?")) return;
    const { error } = await supabase.from("media_items").delete().eq("id", row.id);
    if (!error) {
      await Promise.all([
        removeUploadedFile(supabase, "media-assets", row.thumbnail_url),
        removeUploadedFile(supabase, "media-assets", row.media_url),
      ]);
    }
    setMessage(error ? error.message : "Media deleted.");
    if (!error) await load();
  }

  return (
    <CrudLayout
      title="YouTube, Instagram, Facebook and uploaded videos"
      message={message}
      form={
        <form onSubmit={save} className="grid gap-4">
          <Field label="Title"><input required className="admin-input" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></Field>
          <Field label="Description"><textarea className="admin-textarea" rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Provider"><select className="admin-input" value={form.provider} onChange={(event) => setForm({ ...form, provider: event.target.value as MediaProvider })}>{["youtube", "instagram", "facebook", "uploaded"].map((provider) => <option key={provider}>{provider}</option>)}</select></Field>
            <Field label="Social/video URL" hint="Required for YouTube, Instagram or Facebook"><input className="admin-input" value={form.media_url} onChange={(event) => setForm({ ...form, media_url: event.target.value })} /></Field>
            <Field label="Sort order"><input type="number" className="admin-input" value={form.sort_order} onChange={(event) => setForm({ ...form, sort_order: numberValue(event.target.value) })} /></Field>
          </div>
          <FileField label="Thumbnail upload" accept="image/png,image/jpeg,image/webp" current={form.thumbnail_url} onChange={setThumbnail} />
          <FileField label="Optional MP4/WebM upload (maximum 50 MB)" accept="video/mp4,video/webm" current={form.provider === "uploaded" ? form.media_url : ""} onChange={setMediaFile} />
          <div className="flex flex-wrap gap-5">
            <Check label="Show on homepage" checked={form.show_on_homepage} onChange={(value) => setForm({ ...form, show_on_homepage: value })} />
            <Check label="Featured" checked={form.featured} onChange={(value) => setForm({ ...form, featured: value })} />
            <Check label="Published" checked={form.published} onChange={(value) => setForm({ ...form, published: value })} />
          </div>
          <FormButtons editing={Boolean(form.id)} clear={() => { setForm({ ...blankMedia }); setThumbnail(null); setMediaFile(null); }} saving={saving} />
        </form>
      }
      list={<CardList rows={rows} render={(row) => ({ title: row.title, meta: `${row.provider} • ${row.published ? "Published" : "Draft"} • ${row.show_on_homepage ? "Homepage" : "Hidden from homepage"}`, edit: () => setForm({ ...row }), remove: () => void remove(row) })} />}
    />
  );
}

function CustomersPanel() {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<Customer[]>([]);
  const [form, setForm] = useState<Omit<Customer, "id"> & { id?: string }>({ ...blankCustomer });
  const [message, setMessage] = useState("Loading customers…");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setMessage(error.message);
    else {
      setRows((data ?? []) as Customer[]);
      setMessage("Customer records loaded. These details are private and never shown publicly.");
    }
  }, [supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    const { id, ...payload } = form;
    const result = id
      ? await supabase.from("customers").update(payload).eq("id", id)
      : await supabase.from("customers").insert(payload);
    setMessage(result.error ? result.error.message : "Customer saved.");
    if (!result.error) {
      setForm({ ...blankCustomer });
      await load();
    }
    setSaving(false);
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this customer record? Sales will keep anonymised references.")) return;
    const { error } = await supabase.from("customers").delete().eq("id", id);
    setMessage(error ? error.message : "Customer deleted.");
    if (!error) await load();
  }

  function exportRows() {
    downloadCsv(
      `nextgen-customers-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Name", "Phone", "Email", "City", "Address", "Marketing consent", "Notes", "Created"],
      rows.map((row) => [row.full_name, row.phone, row.email, row.city, row.address, row.marketing_consent ? "Yes" : "No", row.notes, row.created_at]),
    );
  }

  return (
    <CrudLayout
      title="Private customer records"
      message={message}
      form={
        <form onSubmit={save} className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Full name"><input required className="admin-input" value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} /></Field>
            <Field label="Phone"><input className="admin-input" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></Field>
            <Field label="Email"><input type="email" className="admin-input" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></Field>
            <Field label="City"><input className="admin-input" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} /></Field>
          </div>
          <Field label="Address"><textarea className="admin-textarea" rows={3} value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></Field>
          <Field label="Private notes"><textarea className="admin-textarea" rows={4} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></Field>
          <Check label="Customer agreed to marketing communication" checked={form.marketing_consent} onChange={(value) => setForm({ ...form, marketing_consent: value })} />
          <FormButtons editing={Boolean(form.id)} clear={() => setForm({ ...blankCustomer })} saving={saving} />
        </form>
      }
      list={
        <div>
          <div className="mb-4 flex justify-end">
            <button type="button" onClick={exportRows} disabled={!rows.length} className="min-h-11 rounded-xl border border-slate-700 px-4 text-sm font-black text-cyan-200 disabled:opacity-40">
              Export customer CSV
            </button>
          </div>
          <CardList rows={rows} render={(row) => ({ title: row.full_name, meta: [row.phone, row.email, row.city].filter(Boolean).join(" • "), edit: () => setForm({ ...row }), remove: () => void remove(row.id) })} />
        </div>
      }
    />
  );
}

function SalesPanel() {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<ProductChoice[]>([]);
  const [form, setForm] = useState<Omit<Sale, "id"> & { id?: string }>({ ...blankSale });
  const [message, setMessage] = useState("Loading sales history…");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [sales, customerRows, productRows] = await Promise.all([
      supabase.from("sales").select("*").order("sold_at", { ascending: false }),
      supabase.from("customers").select("*").order("full_name"),
      supabase.from("products").select("id,name,sku,price,stock_quantity").is("deleted_at", null).order("name"),
    ]);
    const error = sales.error || customerRows.error || productRows.error;
    if (error) setMessage(error.message);
    else {
      setRows((sales.data ?? []) as Sale[]);
      setCustomers((customerRows.data ?? []) as Customer[]);
      setProducts((productRows.data ?? []) as ProductChoice[]);
      setMessage("Sales history loaded. Inventory changes are handled automatically by the database.");
    }
  }, [supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  function chooseProduct(id: string) {
    const product = products.find((row) => row.id === id);
    setForm((current) => product
      ? { ...current, product_id: id, product_name: product.name, sku: product.sku ?? "", unit_price: Number(product.price), total_amount: Number(product.price) * current.quantity }
      : { ...current, product_id: null });
  }

  function chooseCustomer(id: string) {
    const customer = customers.find((row) => row.id === id);
    setForm((current) => customer
      ? { ...current, customer_id: id, customer_city: customer.city }
      : { ...current, customer_id: null });
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setMessage("Saving sale…");

    try {
      const { id, ...values } = form;
      if (!values.product_name.trim()) throw new Error("Product name is required.");
      if (!Number.isInteger(values.quantity) || values.quantity < 1) throw new Error("Quantity must be at least 1.");
      if (values.unit_price < 0 || values.total_amount < 0) throw new Error("Sale amounts cannot be negative.");

      const payload = {
        ...values,
        sold_at: new Date(values.sold_at).toISOString(),
        warranty_until: values.warranty_until || null,
        total_amount: Number(values.total_amount),
        unit_price: Number(values.unit_price),
        cost_amount: values.cost_amount === null ? null : Number(values.cost_amount),
      };
      const result = id
        ? await supabase.from("sales").update(payload).eq("id", id)
        : await supabase.from("sales").insert(payload);
      if (result.error) throw result.error;

      setForm({ ...blankSale });
      setMessage("Sale saved. Inventory was adjusted automatically by the database.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sale save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this sales record? Inventory will be restored when applicable.")) return;
    const { error } = await supabase.from("sales").delete().eq("id", id);
    setMessage(error ? error.message : "Sale deleted and inventory reconciled.");
    if (!error) await load();
  }

  function exportRows() {
    downloadCsv(
      `nextgen-sales-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Sold date", "Product", "SKU", "Quantity", "Unit price", "Total", "Cost", "Payment status", "Payment method", "Invoice", "Warranty until", "Customer city", "Public note", "Private note"],
      rows.map((row) => [row.sold_at, row.product_name, row.sku, row.quantity, row.unit_price, row.total_amount, row.cost_amount, row.payment_status, row.payment_method, row.invoice_reference, row.warranty_until, row.customer_city, row.public_note, row.private_note]),
    );
  }

  return (
    <CrudLayout
      title="Sales and sold history"
      message={message}
      form={
        <form onSubmit={save} className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Product"><select className="admin-input" value={form.product_id ?? ""} onChange={(event) => chooseProduct(event.target.value)}><option value="">Manual / other product</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.stock_quantity} in stock)</option>)}</select></Field>
            <Field label="Customer"><select className="admin-input" value={form.customer_id ?? ""} onChange={(event) => chooseCustomer(event.target.value)}><option value="">No customer selected</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.full_name}</option>)}</select></Field>
            <Field label="Product name"><input required className="admin-input" value={form.product_name} onChange={(event) => setForm({ ...form, product_name: event.target.value })} /></Field>
            <Field label="SKU"><input className="admin-input" value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} /></Field>
            <Field label="Quantity"><input type="number" min="1" className="admin-input" value={form.quantity} onChange={(event) => { const quantity = Math.max(1, numberValue(event.target.value)); setForm({ ...form, quantity, total_amount: quantity * form.unit_price }); }} /></Field>
            <Field label="Unit price"><input type="number" min="0" step="0.01" className="admin-input" value={form.unit_price} onChange={(event) => { const unit = numberValue(event.target.value); setForm({ ...form, unit_price: unit, total_amount: unit * form.quantity }); }} /></Field>
            <Field label="Total amount"><input type="number" min="0" step="0.01" className="admin-input" value={form.total_amount} onChange={(event) => setForm({ ...form, total_amount: numberValue(event.target.value) })} /></Field>
            <Field label="Cost amount (private)"><input type="number" min="0" step="0.01" className="admin-input" value={form.cost_amount ?? ""} onChange={(event) => setForm({ ...form, cost_amount: event.target.value ? numberValue(event.target.value) : null })} /></Field>
            <Field label="Payment status"><select className="admin-input" value={form.payment_status} onChange={(event) => setForm({ ...form, payment_status: event.target.value as Sale["payment_status"] })}>{["Pending", "Part Paid", "Paid", "Refunded", "Cancelled"].map((value) => <option key={value}>{value}</option>)}</select></Field>
            <Field label="Payment method"><input className="admin-input" value={form.payment_method} onChange={(event) => setForm({ ...form, payment_method: event.target.value })} /></Field>
            <Field label="Invoice/reference"><input className="admin-input" value={form.invoice_reference} onChange={(event) => setForm({ ...form, invoice_reference: event.target.value })} /></Field>
            <Field label="Sold date"><input type="datetime-local" className="admin-input" value={toLocalInput(form.sold_at)} onChange={(event) => setForm({ ...form, sold_at: event.target.value })} /></Field>
            <Field label="Warranty until"><input type="date" className="admin-input" value={form.warranty_until ?? ""} onChange={(event) => setForm({ ...form, warranty_until: event.target.value || null })} /></Field>
            <Field label="Customer city (public-safe)"><input className="admin-input" value={form.customer_city} onChange={(event) => setForm({ ...form, customer_city: event.target.value })} /></Field>
          </div>
          <Field label="Public sold note" hint="May appear on homepage; never enter phone or private customer data"><textarea className="admin-textarea" rows={3} value={form.public_note} onChange={(event) => setForm({ ...form, public_note: event.target.value })} /></Field>
          <Field label="Private sale note"><textarea className="admin-textarea" rows={3} value={form.private_note} onChange={(event) => setForm({ ...form, private_note: event.target.value })} /></Field>
          <FormButtons editing={Boolean(form.id)} clear={() => setForm({ ...blankSale })} saving={saving} />
        </form>
      }
      list={
        <div>
          <div className="mb-4 flex justify-end">
            <button type="button" onClick={exportRows} disabled={!rows.length} className="min-h-11 rounded-xl border border-slate-700 px-4 text-sm font-black text-cyan-200 disabled:opacity-40">
              Export sales CSV
            </button>
          </div>
          <CardList rows={rows} render={(row) => ({ title: `${row.product_name} — ₹${Number(row.total_amount).toLocaleString("en-IN")}`, meta: `${row.quantity} unit(s) • ${row.payment_status} • ${new Date(row.sold_at).toLocaleDateString("en-IN")}`, edit: () => setForm({ ...row, sold_at: toLocalInput(row.sold_at) }), remove: () => void remove(row.id) })} />
        </div>
      }
    />
  );
}

function HomepagePanel() {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<HomepageSection[]>([]);
  const [message, setMessage] = useState("Loading homepage sections…");
  const load = useCallback(async () => { const { data, error } = await supabase.from("homepage_sections").select("*").order("sort_order"); if (error) setMessage(error.message); else { setRows((data ?? []) as HomepageSection[]); setMessage("Change the order numbers and enable only the sections required on the homepage."); } }, [supabase]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  async function save() { const { error } = await supabase.from("homepage_sections").upsert(rows, { onConflict: "section_key" }); setMessage(error ? error.message : "Homepage sections saved."); }
  return <div className="surface rounded-3xl p-6"><h2 className="text-2xl font-black text-white">Homepage section controls</h2><p className="mt-2 text-sm text-slate-500">Enable, rename and reorder homepage sections.</p><div className="mt-6 grid gap-4">{rows.map((row, index) => <div key={row.section_key} className="rounded-2xl border border-slate-700 bg-slate-950/35 p-4"><div className="grid gap-3 md:grid-cols-[1fr_1.4fr_100px_auto]"><Field label="Title"><input className="admin-input" value={row.title} onChange={(event) => setRows((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item))} /></Field><Field label="Subtitle"><input className="admin-input" value={row.subtitle} onChange={(event) => setRows((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, subtitle: event.target.value } : item))} /></Field><Field label="Order"><input type="number" className="admin-input" value={row.sort_order} onChange={(event) => setRows((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, sort_order: numberValue(event.target.value) } : item))} /></Field><div className="flex items-end pb-2"><Check label="Enabled" checked={row.enabled} onChange={(value) => setRows((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, enabled: value } : item))} /></div></div><p className="mt-2 text-[10px] font-black text-slate-600 uppercase">{row.section_key}</p></div>)}</div><button type="button" onClick={() => void save()} className="mt-6 min-h-12 rounded-xl bg-cyan-300 px-6 font-black text-slate-950">Save homepage layout</button><Message value={message} /></div>;
}

function LegalPanel() {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<LegalPage[]>([]);
  const [message, setMessage] = useState("Loading legal pages…");
  const load = useCallback(async () => { const { data, error } = await supabase.from("legal_pages").select("*").order("page_key"); if (error) setMessage(error.message); else { setRows((data ?? []) as LegalPage[]); setMessage("Legal pages loaded. Obtain professional legal review for your exact business model."); } }, [supabase]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  async function save(row: LegalPage) { const { error } = await supabase.from("legal_pages").upsert(row, { onConflict: "page_key" }); setMessage(error ? error.message : `${row.title} saved.`); }
  return <div><div className="grid gap-5">{rows.map((row, index) => <article key={row.page_key} className="surface rounded-3xl p-6"><div className="grid gap-4"><Field label="Page title"><input className="admin-input" value={row.title} onChange={(event) => setRows((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item))} /></Field><Field label="Policy content" hint="Use blank lines for paragraphs"><textarea className="admin-textarea" rows={12} value={row.content} onChange={(event) => setRows((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, content: event.target.value } : item))} /></Field><div className="flex items-center justify-between"><Check label="Published" checked={row.published} onChange={(value) => setRows((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, published: value } : item))} /><button type="button" onClick={() => void save(row)} className="min-h-11 rounded-xl bg-cyan-300 px-5 font-black text-slate-950">Save {row.page_key}</button></div></div></article>)}</div><Message value={message} /></div>;
}

function FaqPanel() {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<Faq[]>([]);
  const [form, setForm] = useState<Omit<Faq, "id"> & { id?: string }>({ ...blankFaq });
  const [message, setMessage] = useState("Loading FAQs…");
  const load = useCallback(async () => { const { data, error } = await supabase.from("faqs").select("*").order("sort_order"); if (error) setMessage(error.message); else { setRows((data ?? []) as Faq[]); setMessage("FAQs loaded."); } }, [supabase]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  async function save(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const { id, ...payload } = form; const result = id ? await supabase.from("faqs").update(payload).eq("id", id) : await supabase.from("faqs").insert(payload); setMessage(result.error ? result.error.message : "FAQ saved."); if (!result.error) { setForm({ ...blankFaq }); await load(); } }
  async function remove(id: string) { if (!window.confirm("Delete this FAQ?")) return; const { error } = await supabase.from("faqs").delete().eq("id", id); setMessage(error ? error.message : "FAQ deleted."); if (!error) await load(); }
  return <CrudLayout title="Frequently asked questions" message={message} form={<form onSubmit={save} className="grid gap-4"><Field label="Question"><input required className="admin-input" value={form.question} onChange={(event) => setForm({ ...form, question: event.target.value })} /></Field><Field label="Answer"><textarea required className="admin-textarea" rows={6} value={form.answer} onChange={(event) => setForm({ ...form, answer: event.target.value })} /></Field><div className="grid gap-3 sm:grid-cols-2"><Field label="Category"><input className="admin-input" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></Field><Field label="Sort order"><input type="number" className="admin-input" value={form.sort_order} onChange={(event) => setForm({ ...form, sort_order: numberValue(event.target.value) })} /></Field></div><Check label="Active" checked={form.active} onChange={(value) => setForm({ ...form, active: value })} /><FormButtons editing={Boolean(form.id)} clear={() => setForm({ ...blankFaq })} /></form>} list={<CardList rows={rows} render={(row) => ({ title: row.question, meta: `${row.category} • ${row.active ? "Active" : "Hidden"}`, edit: () => setForm({ ...row }), remove: () => void remove(row.id) })} />} />;
}


type CategoryRow = {
  id: string;
  name: string;
  active: boolean;
  sort_order: number;
};

function CategoriesPanel() {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [form, setForm] = useState<{ id?: string; name: string; active: boolean; sort_order: number }>({ name: "", active: true, sort_order: 0 });
  const [message, setMessage] = useState("Loading categories…");
  const load = useCallback(async () => {
    const { data, error } = await supabase.from("categories").select("*").order("sort_order").order("name");
    if (error) setMessage(error.message);
    else { setRows((data ?? []) as CategoryRow[]); setMessage("Categories loaded."); }
  }, [supabase]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = { name: form.name.trim(), active: form.active, sort_order: form.sort_order };
    const result = form.id ? await supabase.from("categories").update(payload).eq("id", form.id) : await supabase.from("categories").insert(payload);
    setMessage(result.error ? result.error.message : "Category saved.");
    if (!result.error) { setForm({ name: "", active: true, sort_order: 0 }); await load(); }
  }
  async function remove(id: string) {
    if (!window.confirm("Delete this category? Existing products keep their category text.")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    setMessage(error ? error.message : "Category deleted.");
    if (!error) await load();
  }
  return <CrudLayout title="Product categories" message={message} form={<form onSubmit={save} className="grid gap-4"><Field label="Category name"><input required className="admin-input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field><Field label="Sort order"><input type="number" className="admin-input" value={form.sort_order} onChange={(event) => setForm({ ...form, sort_order: numberValue(event.target.value) })} /></Field><Check label="Active" checked={form.active} onChange={(value) => setForm({ ...form, active: value })} /><FormButtons editing={Boolean(form.id)} clear={() => setForm({ name: "", active: true, sort_order: 0 })} /></form>} list={<CardList rows={rows} render={(row) => ({ title: row.name, meta: `${row.active ? "Active" : "Hidden"} • Order ${row.sort_order}`, edit: () => setForm({ ...row }), remove: () => void remove(row.id) })} />} />;
}

function CrudLayout({ title, message, form, list }: { title: string; message: string; form: React.ReactNode; list: React.ReactNode }) {
  return <div><div className="grid gap-6 xl:grid-cols-[430px_1fr]"><section className="surface h-fit rounded-3xl p-6 xl:sticky xl:top-24"><h2 className="text-2xl font-black text-white">{title}</h2><div className="mt-6">{form}</div></section><section>{list}</section></div><Message value={message} /></div>;
}

function FormButtons({ editing, clear, saving = false }: { editing: boolean; clear: () => void; saving?: boolean }) {
  return <div className="grid grid-cols-2 gap-2"><button type="submit" disabled={saving} className="min-h-12 rounded-xl bg-cyan-300 px-4 font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving…" : editing ? "Update" : "Add"}</button><button type="button" onClick={clear} disabled={saving} className="min-h-12 rounded-xl border border-slate-700 px-4 font-black text-white disabled:opacity-50">Clear</button></div>;
}

function CardList<T extends { id: string }>({ rows, render }: { rows: T[]; render: (row: T) => { title: string; meta: string; edit: () => void; remove: () => void } }) {
  if (!rows.length) return <div className="surface rounded-3xl p-10 text-center text-slate-500">No records yet.</div>;
  return <div className="grid gap-3">{rows.map((row) => { const card = render(row); return <article key={row.id} className="surface rounded-2xl p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><strong className="text-white">{card.title}</strong><p className="mt-1 text-xs text-slate-500">{card.meta}</p></div><div className="flex gap-2"><button type="button" onClick={card.edit} className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-black text-cyan-200">Edit</button><button type="button" onClick={card.remove} className="rounded-lg border border-rose-400/30 px-3 py-2 text-xs font-black text-rose-200">Delete</button></div></div></article>; })}</div>;
}
