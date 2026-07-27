"use client";

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { BrandingCms } from "@/components/branding-cms";
import { MarketingCms } from "@/components/marketing-cms";
import { Icon } from "@/components/icon";
import { createClient } from "@/lib/supabase/client";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  brand: string;
  processor: string;
  ram: string;
  storage: string;
  price: number;
  condition: string;
  stock: string;
  warranty: string;
  image_url: string;
  featured: boolean;
  active: boolean;
  description: string;
  specs: Record<string, string> | null;
  included: string[] | null;
  created_at: string;
};

type EnquiryRow = {
  id: string;
  enquiry_type: string;
  customer_name: string;
  phone: string;
  budget_or_product: string;
  preferred_time: string;
  message: string;
  status: string;
  created_at: string;
};

type ProductForm = {
  id: string;
  name: string;
  slug: string;
  category: string;
  brand: string;
  processor: string;
  ram: string;
  storage: string;
  price: string;
  condition: string;
  stock: string;
  warranty: string;
  image_url: string;
  featured: boolean;
  active: boolean;
  description: string;
  specsText: string;
  includedText: string;
};

const blankProduct: ProductForm = {
  id: "",
  name: "",
  slug: "",
  category: "Refurbished Laptops",
  brand: "",
  processor: "Not Applicable",
  ram: "Not Applicable",
  storage: "Not Applicable",
  price: "0",
  condition: "New",
  stock: "In Stock",
  warranty: "1 Year",
  image_url: "/products/business-laptop.svg",
  featured: false,
  active: true,
  description: "",
  specsText: "",
  includedText:
    "Product or device\nApplicable accessories\nBasic setup guidance",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function specsToText(specs: Record<string, string> | null) {
  return Object.entries(specs ?? {})
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
}

function parseSpecs(value: string) {
  const result: Record<string, string> = {};

  for (const rawLine of value.split(/\r?\n/)) {
    const line = rawLine.trim();
    const separator = line.indexOf(":");

    if (!line || separator < 1) continue;

    const key = line.slice(0, separator).trim();
    const itemValue = line.slice(separator + 1).trim();

    if (key && itemValue) {
      result[key] = itemValue;
    }
  }

  return result;
}

function parseIncluded(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function storagePathFromUrl(url: string) {
  const marker = "/storage/v1/object/public/product-images/";
  const index = url.indexOf(marker);

  if (index < 0) return null;

  return decodeURIComponent(url.slice(index + marker.length));
}

export function AdminDashboard({ ownerEmail }: { ownerEmail: string }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [tab, setTab] = useState<"products" | "enquiries" | "branding" | "offers" | "reviews">("products");
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);
  const [form, setForm] = useState<ProductForm>(blankProduct);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState("Loading CMS data…");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [
      { data: productData, error: productError },
      { data: enquiryData, error: enquiryError },
    ] = await Promise.all([
      supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    if (productError || enquiryError) {
      setMessage(
        productError?.message ??
          enquiryError?.message ??
          "Unable to load CMS data.",
      );
      return;
    }

    setProducts((productData ?? []) as ProductRow[]);
    setEnquiries((enquiryData ?? []) as EnquiryRow[]);
    setMessage("CMS connected and ready.");
  }, [supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  const categories = useMemo(
    () =>
      [...new Set(products.map((product) => product.category))]
        .filter(Boolean)
        .sort(),
    [products],
  );

  async function uploadImage() {
    if (!imageFile) return form.image_url;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(imageFile.type)) {
      throw new Error("Upload a JPG, PNG or WebP image.");
    }

    if (imageFile.size > 5 * 1024 * 1024) {
      throw new Error("The image must be smaller than 5 MB.");
    }

    const extension =
      imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, imageFile, {
        cacheControl: "3600",
        contentType: imageFile.type,
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(path);

    return data.publicUrl;
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setMessage("Saving product…");

    try {
      const previousImageUrl = form.image_url;
      const imageUrl = await uploadImage();
      const price = Number(form.price);

      if (!Number.isFinite(price) || price < 0) {
        throw new Error("Enter a valid non-negative product price.");
      }

      const payload = {
        name: form.name.trim(),
        slug: slugify(form.slug || form.name),
        category: form.category.trim(),
        brand: form.brand.trim(),
        processor: form.processor.trim() || "Not Applicable",
        ram: form.ram.trim() || "Not Applicable",
        storage: form.storage.trim() || "Not Applicable",
        price,
        condition: form.condition,
        stock: form.stock,
        warranty: form.warranty.trim(),
        image_url: imageUrl,
        featured: form.featured,
        active: form.active,
        description: form.description.trim(),
        specs: parseSpecs(form.specsText),
        included: parseIncluded(form.includedText),
      };

      if (!payload.name || !payload.slug || !payload.category || !payload.brand) {
        throw new Error("Complete the required product fields.");
      }

      const query = form.id
        ? supabase.from("products").update(payload).eq("id", form.id)
        : supabase.from("products").insert(payload);

      const { error } = await query;

      if (error) throw error;

      if (form.id && imageFile && previousImageUrl !== imageUrl) {
        const previousPath = storagePathFromUrl(previousImageUrl);

        if (previousPath) {
          await supabase.storage
            .from("product-images")
            .remove([previousPath]);
        }
      }

      setForm(blankProduct);
      setImageFile(null);
      setMessage("Product saved successfully.");
      await load();
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Product save failed.",
      );
    } finally {
      setSaving(false);
    }
  }

  function editProduct(product: ProductRow) {
    setForm({
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category,
      brand: product.brand,
      processor: product.processor,
      ram: product.ram,
      storage: product.storage,
      price: String(product.price),
      condition: product.condition,
      stock: product.stock,
      warranty: product.warranty,
      image_url: product.image_url,
      featured: product.featured,
      active: product.active,
      description: product.description,
      specsText: specsToText(product.specs),
      includedText: (product.included ?? []).join("\n"),
    });

    setImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteProduct(product: ProductRow) {
    if (!window.confirm(`Delete ${product.name}? This cannot be undone.`)) {
      return;
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    const storagePath = storagePathFromUrl(product.image_url);

    if (storagePath) {
      await supabase.storage
        .from("product-images")
        .remove([storagePath]);
    }

    setMessage("Product deleted.");
    await load();
    router.refresh();
  }

  async function updateEnquiry(id: string, status: string) {
    const { error } = await supabase
      .from("enquiries")
      .update({ status })
      .eq("id", id);

    setMessage(error ? error.message : "Enquiry status updated.");

    if (!error) {
      await load();
    }
  }

  async function deleteEnquiry(enquiry: EnquiryRow) {
    if (!window.confirm(`Delete enquiry from ${enquiry.customer_name}?`)) {
      return;
    }

    const { error } = await supabase
      .from("enquiries")
      .delete()
      .eq("id", enquiry.id);

    setMessage(error ? error.message : "Enquiry deleted.");

    if (!error) {
      await load();
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  const stats = {
    products: products.length,
    inStock: products.filter((product) => product.stock === "In Stock").length,
    featured: products.filter((product) => product.featured).length,
    newEnquiries: enquiries.filter((enquiry) => enquiry.status === "New")
      .length,
  };

  return (
    <div className="mx-auto max-w-[1280px]">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <span className="text-xs font-black tracking-[0.15em] text-cyan-300 uppercase">
            Protected owner dashboard
          </span>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] text-white sm:text-6xl">
            Catalogue Management
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Signed in as {ownerEmail}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void logout()}
          className="focus-ring min-h-11 rounded-xl border border-slate-700 px-4 text-sm font-black text-white"
        >
          Sign out
        </button>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [stats.products, "Total products", "box"],
          [stats.inStock, "In stock", "chart"],
          [stats.featured, "Featured", "edit"],
          [stats.newEnquiries, "New enquiries", "users"],
        ].map(([value, label, icon]) => (
          <div key={String(label)} className="surface rounded-3xl p-5">
            <Icon
              name={icon as "box" | "chart" | "edit" | "users"}
              className="size-6 text-cyan-300"
            />
            <strong className="mt-5 block text-3xl font-black text-white">
              {value}
            </strong>
            <span className="mt-1 block text-xs text-slate-500">
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-2 rounded-2xl border border-slate-700 bg-slate-950/45 p-1 sm:grid-cols-2 xl:grid-cols-5">
        {([
          ["products", "Products"],
          ["enquiries", "Enquiries"],
          ["branding", "Branding & homepage"],
          ["offers", "Offers"],
          ["reviews", "Reviews"],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`min-h-11 rounded-xl text-sm font-black ${
              tab === value
                ? "bg-cyan-300 text-slate-950"
                : "text-slate-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <p
        className="mt-4 rounded-xl border border-cyan-300/10 bg-cyan-300/5 p-3 text-sm text-cyan-100"
        aria-live="polite"
      >
        {message}
      </p>

      {tab === "products" ? (
        <div className="mt-5 grid gap-6 xl:grid-cols-[420px_1fr]">
          <form
            onSubmit={saveProduct}
            className="surface h-fit rounded-3xl p-6 xl:sticky xl:top-28"
          >
            <h2 className="text-2xl font-black text-white">
              {form.id ? "Edit product" : "Add product"}
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <label>
                <span className="mb-1.5 block text-xs font-black text-slate-300">
                  Product name
                </span>
                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className="focus-ring min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm text-white"
                />
              </label>

              <label>
                <span className="mb-1.5 block text-xs font-black text-slate-300">
                  Slug
                </span>
                <input
                  value={form.slug}
                  placeholder="Generated from product name"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      slug: event.target.value,
                    }))
                  }
                  className="focus-ring min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm text-white"
                />
              </label>

              <label>
                <span className="mb-1.5 block text-xs font-black text-slate-300">
                  Category
                </span>
                <input
                  required
                  list="category-options"
                  value={form.category}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                  className="focus-ring min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm text-white"
                />
                <datalist id="category-options">
                  {categories.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </label>

              <label>
                <span className="mb-1.5 block text-xs font-black text-slate-300">
                  Brand
                </span>
                <input
                  required
                  value={form.brand}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      brand: event.target.value,
                    }))
                  }
                  className="focus-ring min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm text-white"
                />
              </label>

              {(
                [
                  ["processor", "Processor"],
                  ["ram", "RAM"],
                  ["storage", "Storage"],
                  ["warranty", "Warranty"],
                  ["image_url", "Image URL"],
                ] as const
              ).map(([key, label]) => (
                <label key={key}>
                  <span className="mb-1.5 block text-xs font-black text-slate-300">
                    {label}
                  </span>
                  <input
                    value={form[key]}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        [key]: event.target.value,
                      }))
                    }
                    className="focus-ring min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm text-white"
                  />
                </label>
              ))}

              <label>
                <span className="mb-1.5 block text-xs font-black text-slate-300">
                  Price
                </span>
                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  value={form.price}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      price: event.target.value,
                    }))
                  }
                  className="focus-ring min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm text-white"
                />
              </label>

              <label>
                <span className="mb-1.5 block text-xs font-black text-slate-300">
                  Condition
                </span>
                <select
                  value={form.condition}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      condition: event.target.value,
                    }))
                  }
                  className="focus-ring min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm text-white"
                >
                  {["New", "Like New", "Excellent", "Good"].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>

              <label>
                <span className="mb-1.5 block text-xs font-black text-slate-300">
                  Stock
                </span>
                <select
                  value={form.stock}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      stock: event.target.value,
                    }))
                  }
                  className="focus-ring min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm text-white"
                >
                  {["In Stock", "Out of Stock", "Coming Soon", "Sold"].map(
                    (value) => (
                      <option key={value}>{value}</option>
                    ),
                  )}
                </select>
              </label>
            </div>

            <label className="mt-3 block">
              <span className="mb-1.5 block text-xs font-black text-slate-300">
                Description
              </span>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className="focus-ring w-full rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-sm text-white"
              />
            </label>

            <label className="mt-3 block">
              <span className="mb-1.5 block text-xs font-black text-slate-300">
                Specifications
              </span>
              <span className="mb-2 block text-[11px] text-slate-500">
                One per line, for example: Display: 14-inch Full HD
              </span>
              <textarea
                rows={6}
                value={form.specsText}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    specsText: event.target.value,
                  }))
                }
                className="focus-ring w-full rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-sm text-white"
              />
            </label>

            <label className="mt-3 block">
              <span className="mb-1.5 block text-xs font-black text-slate-300">
                Included items
              </span>
              <span className="mb-2 block text-[11px] text-slate-500">
                One item per line
              </span>
              <textarea
                rows={4}
                value={form.includedText}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    includedText: event.target.value,
                  }))
                }
                className="focus-ring w-full rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-sm text-white"
              />
            </label>

            <label className="mt-3 block">
              <span className="mb-1.5 block text-xs font-black text-slate-300">
                Upload new image
              </span>
              <span className="mb-2 block text-[11px] text-slate-500">
                JPG, PNG or WebP • Maximum 5 MB
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setImageFile(event.target.files?.[0] ?? null)
                }
                className="w-full text-xs text-slate-400"
              />
            </label>

            <div className="mt-4 flex flex-wrap gap-5 text-sm text-slate-300">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      featured: event.target.checked,
                    }))
                  }
                  className="size-4 accent-cyan-300"
                />
                Featured
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      active: event.target.checked,
                    }))
                  }
                  className="size-4 accent-cyan-300"
                />
                Public
              </label>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                disabled={saving}
                type="submit"
                className="focus-ring min-h-12 rounded-xl bg-cyan-300 px-4 font-black text-slate-950 disabled:opacity-50"
              >
                {saving
                  ? "Saving…"
                  : form.id
                    ? "Update product"
                    : "Add product"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setForm(blankProduct);
                  setImageFile(null);
                  setMessage("Form cleared.");
                }}
                className="focus-ring min-h-12 rounded-xl border border-slate-700 px-4 font-black text-white"
              >
                Clear
              </button>
            </div>
          </form>

          <div>
            <div className="grid gap-4 md:hidden">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="surface rounded-3xl p-5"
                >
                  <div className="flex justify-between gap-4">
                    <div>
                      <strong className="text-white">{product.name}</strong>
                      <p className="mt-1 text-sm text-slate-500">
                        {product.category} • {product.brand}
                      </p>
                    </div>
                    <span className="text-sm font-black text-cyan-300">
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full border border-slate-700 px-3 py-1 text-slate-300">
                      {product.stock}
                    </span>
                    <span className="rounded-full border border-slate-700 px-3 py-1 text-slate-300">
                      {product.active ? "Public" : "Draft"}
                    </span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => editProduct(product)}
                      className="min-h-10 flex-1 rounded-xl border border-slate-700 text-xs font-black text-cyan-200"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteProduct(product)}
                      className="min-h-10 flex-1 rounded-xl border border-rose-400/30 text-xs font-black text-rose-200"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="surface hidden overflow-hidden rounded-3xl md:block">
              <div className="border-b border-slate-700 p-5">
                <h2 className="text-xl font-black text-white">Products</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Add, edit, publish, feature and update stock.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-left">
                  <thead className="bg-slate-950/45 text-xs text-slate-500">
                    <tr>
                      <th className="p-4">Product</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4">Public</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className="border-t border-slate-700"
                      >
                        <td className="p-4 text-sm font-bold text-white">
                          {product.name}
                        </td>
                        <td className="p-4 text-sm text-slate-400">
                          {product.category}
                        </td>
                        <td className="p-4 text-sm text-slate-300">
                          ₹{Number(product.price).toLocaleString("en-IN")}
                        </td>
                        <td className="p-4 text-sm text-slate-300">
                          {product.stock}
                        </td>
                        <td className="p-4 text-sm text-slate-300">
                          {product.active ? "Yes" : "Draft"}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => editProduct(product)}
                              className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-black text-cyan-200"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void deleteProduct(product)}
                              className="rounded-lg border border-rose-400/30 px-3 py-2 text-xs font-black text-rose-200"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : tab === "enquiries" ? (
        <div className="mt-5">
          <div className="grid gap-4">
            {enquiries.length ? (
              enquiries.map((enquiry) => (
                <article
                  key={enquiry.id}
                  className="surface rounded-3xl p-5"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <strong className="text-white">
                        {enquiry.customer_name}
                      </strong>
                      <p className="mt-1 text-sm text-slate-400">
                        {enquiry.phone} • {enquiry.enquiry_type}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <select
                        value={enquiry.status}
                        onChange={(event) =>
                          void updateEnquiry(
                            enquiry.id,
                            event.target.value,
                          )
                        }
                        className="focus-ring min-h-10 rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-white"
                      >
                        {[
                          "New",
                          "Contacted",
                          "Interested",
                          "Closed",
                          "Not Interested",
                        ].map((value) => (
                          <option key={value}>{value}</option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => void deleteEnquiry(enquiry)}
                        className="min-h-10 rounded-xl border border-rose-400/30 px-3 text-xs font-black text-rose-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {enquiry.budget_or_product && (
                    <p className="mt-3 text-sm text-slate-300">
                      <strong>Budget/Product:</strong>{" "}
                      {enquiry.budget_or_product}
                    </p>
                  )}

                  {enquiry.preferred_time && (
                    <p className="mt-2 text-sm text-slate-300">
                      <strong>Preferred time:</strong>{" "}
                      {enquiry.preferred_time}
                    </p>
                  )}

                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">
                    {enquiry.message}
                  </p>

                  <p className="mt-3 text-xs text-slate-600">
                    {new Date(enquiry.created_at).toLocaleString()}
                  </p>
                </article>
              ))
            ) : (
              <div className="surface rounded-3xl p-8 text-slate-500">
                No enquiries yet.
              </div>
            )}
          </div>
        </div>
      ) : tab === "branding" ? (
        <div className="mt-5">
          <BrandingCms />
        </div>
      ) : tab === "offers" ? (
        <div className="mt-5">
          <MarketingCms section="offers" />
        </div>
      ) : (
        <div className="mt-5">
          <MarketingCms section="reviews" />
        </div>
      )}
    </div>
  );
}
