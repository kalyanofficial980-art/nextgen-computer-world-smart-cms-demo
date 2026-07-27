"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
  specs: Record<string, string>;
  included: string[];
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

const blankProduct = {
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
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function AdminDashboard({ ownerEmail }: { ownerEmail: string }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [tab, setTab] = useState<"products" | "enquiries">("products");
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);
  const [form, setForm] = useState(blankProduct);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState("Loading CMS data…");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [{ data: productData, error: productError }, { data: enquiryData, error: enquiryError }] =
      await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("enquiries").select("*").order("created_at", { ascending: false }),
      ]);

    if (productError || enquiryError) {
      setMessage(productError?.message ?? enquiryError?.message ?? "Unable to load data.");
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

  async function uploadImage() {
    if (!imageFile) return form.image_url;

    const extension = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, imageFile, {
        cacheControl: "3600",
        contentType: imageFile.type,
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("Saving product…");

    try {
      const imageUrl = await uploadImage();
      const payload = {
        name: form.name.trim(),
        slug: slugify(form.slug || form.name),
        category: form.category,
        brand: form.brand.trim(),
        processor: form.processor.trim() || "Not Applicable",
        ram: form.ram.trim() || "Not Applicable",
        storage: form.storage.trim() || "Not Applicable",
        price: Number(form.price),
        condition: form.condition,
        stock: form.stock,
        warranty: form.warranty.trim(),
        image_url: imageUrl,
        featured: form.featured,
        active: form.active,
        description: form.description.trim(),
        specs: {},
        included: ["Product or device", "Applicable accessories", "Basic setup guidance"],
      };

      const query = form.id
        ? supabase.from("products").update(payload).eq("id", form.id)
        : supabase.from("products").insert(payload);

      const { error } = await query;
      if (error) throw error;

      setForm(blankProduct);
      setImageFile(null);
      setMessage("Product saved successfully.");
      await load();
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Product save failed.");
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
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteProduct(product: ProductRow) {
    if (!window.confirm(`Delete ${product.name}?`)) return;

    const { error } = await supabase.from("products").delete().eq("id", product.id);
    setMessage(error ? error.message : "Product deleted.");
    if (!error) {
      await load();
      router.refresh();
    }
  }

  async function updateEnquiry(id: string, status: string) {
    const { error } = await supabase.from("enquiries").update({ status }).eq("id", id);
    setMessage(error ? error.message : "Enquiry status updated.");
    if (!error) await load();
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
    newEnquiries: enquiries.filter((enquiry) => enquiry.status === "New").length,
  };

  return (
    <div className="mx-auto max-w-[1280px]">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <span className="text-xs font-black tracking-[0.15em] text-cyan-300 uppercase">
            Owner-managed Supabase CMS
          </span>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] text-white sm:text-6xl">
            Smart Catalogue Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-400">Signed in as {ownerEmail}</p>
        </div>
        <button onClick={logout} className="focus-ring min-h-11 rounded-xl border border-slate-700 px-4 text-sm font-black text-white">
          Sign Out
        </button>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [stats.products, "Total Products", "box"],
          [stats.inStock, "In Stock", "chart"],
          [stats.featured, "Featured", "edit"],
          [stats.newEnquiries, "New Enquiries", "users"],
        ].map(([value, label, icon]) => (
          <div key={String(label)} className="surface rounded-3xl p-5">
            <Icon name={icon as "box" | "chart" | "edit" | "users"} className="size-6 text-cyan-300" />
            <strong className="mt-5 block text-3xl font-black text-white">{value}</strong>
            <span className="mt-1 block text-xs text-slate-500">{label}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex rounded-2xl border border-slate-700 bg-slate-950/45 p-1">
        {(["products", "enquiries"] as const).map((value) => (
          <button key={value} onClick={() => setTab(value)} className={`min-h-11 flex-1 rounded-xl text-sm font-black ${tab === value ? "bg-cyan-300 text-slate-950" : "text-slate-400"}`}>
            {value === "products" ? "Product Management" : "Enquiry Management"}
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm text-cyan-200" aria-live="polite">{message}</p>

      {tab === "products" ? (
        <div className="mt-5 grid gap-6 xl:grid-cols-[410px_1fr]">
          <form onSubmit={saveProduct} className="surface h-fit rounded-3xl p-6 xl:sticky xl:top-28">
            <h2 className="text-2xl font-black text-white">{form.id ? "Edit Product" : "Add Product"}</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {[
                ["name", "Product name"],
                ["slug", "Slug (optional)"],
                ["category", "Category"],
                ["brand", "Brand"],
                ["processor", "Processor"],
                ["ram", "RAM"],
                ["storage", "Storage"],
                ["price", "Price"],
                ["warranty", "Warranty"],
                ["image_url", "Image URL"],
              ].map(([key, label]) => (
                <label key={key}>
                  <span className="mb-1.5 block text-xs font-black text-slate-300">{label}</span>
                  <input
                    required={["name", "category", "brand", "price", "warranty"].includes(key)}
                    type={key === "price" ? "number" : "text"}
                    value={String(form[key as keyof typeof form])}
                    onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                    className="focus-ring min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm text-white"
                  />
                </label>
              ))}

              <label>
                <span className="mb-1.5 block text-xs font-black text-slate-300">Condition</span>
                <select value={form.condition} onChange={(event) => setForm((current) => ({ ...current, condition: event.target.value }))} className="focus-ring min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm text-white">
                  {["New", "Like New", "Excellent", "Good"].map((value) => <option key={value}>{value}</option>)}
                </select>
              </label>

              <label>
                <span className="mb-1.5 block text-xs font-black text-slate-300">Stock</span>
                <select value={form.stock} onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))} className="focus-ring min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm text-white">
                  {["In Stock", "Out of Stock", "Coming Soon", "Sold"].map((value) => <option key={value}>{value}</option>)}
                </select>
              </label>
            </div>

            <label className="mt-3 block">
              <span className="mb-1.5 block text-xs font-black text-slate-300">Description</span>
              <textarea required rows={4} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="focus-ring w-full rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-sm text-white" />
            </label>

            <label className="mt-3 block">
              <span className="mb-1.5 block text-xs font-black text-slate-300">Upload new image</span>
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event: ChangeEvent<HTMLInputElement>) => setImageFile(event.target.files?.[0] ?? null)} className="w-full text-xs text-slate-400" />
            </label>

            <div className="mt-4 flex gap-5 text-sm text-slate-300">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.featured} onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} className="size-4 accent-cyan-300" /> Featured</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.active} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} className="size-4 accent-cyan-300" /> Public</label>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button disabled={saving} type="submit" className="focus-ring min-h-12 rounded-xl bg-cyan-300 px-4 font-black text-slate-950 disabled:opacity-50">
                {saving ? "Saving…" : form.id ? "Update Product" : "Add Product"}
              </button>
              <button type="button" onClick={() => { setForm(blankProduct); setImageFile(null); }} className="focus-ring min-h-12 rounded-xl border border-slate-700 px-4 font-black text-white">
                Clear
              </button>
            </div>
          </form>

          <div className="surface overflow-hidden rounded-3xl">
            <div className="border-b border-slate-700 p-5">
              <h2 className="text-xl font-black text-white">Products</h2>
              <p className="mt-1 text-xs text-slate-500">Add, edit, publish, feature and update stock.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-left">
                <thead className="bg-slate-950/45 text-xs text-slate-500">
                  <tr><th className="p-4">Product</th><th className="p-4">Category</th><th className="p-4">Price</th><th className="p-4">Stock</th><th className="p-4">Public</th><th className="p-4">Actions</th></tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-t border-slate-700">
                      <td className="p-4 text-sm font-bold text-white">{product.name}</td>
                      <td className="p-4 text-sm text-slate-400">{product.category}</td>
                      <td className="p-4 text-sm text-slate-300">₹{Number(product.price).toLocaleString("en-IN")}</td>
                      <td className="p-4 text-sm text-slate-300">{product.stock}</td>
                      <td className="p-4 text-sm text-slate-300">{product.active ? "Yes" : "Draft"}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button onClick={() => editProduct(product)} className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-black text-cyan-200">Edit</button>
                          <button onClick={() => void deleteProduct(product)} className="rounded-lg border border-rose-400/30 px-3 py-2 text-xs font-black text-rose-200">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="surface mt-5 overflow-hidden rounded-3xl">
          <div className="border-b border-slate-700 p-5">
            <h2 className="text-xl font-black text-white">Customer Enquiries</h2>
            <p className="mt-1 text-xs text-slate-500">Requirements submitted from public website forms.</p>
          </div>
          <div className="grid gap-4 p-5">
            {enquiries.length ? enquiries.map((enquiry) => (
              <article key={enquiry.id} className="rounded-2xl border border-slate-700 bg-slate-950/35 p-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                  <div>
                    <strong className="text-white">{enquiry.customer_name}</strong>
                    <p className="mt-1 text-sm text-slate-400">{enquiry.phone} • {enquiry.enquiry_type}</p>
                  </div>
                  <select value={enquiry.status} onChange={(event) => void updateEnquiry(enquiry.id, event.target.value)} className="focus-ring min-h-10 rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-white">
                    {["New", "Contacted", "Interested", "Closed", "Not Interested"].map((value) => <option key={value}>{value}</option>)}
                  </select>
                </div>
                {enquiry.budget_or_product && <p className="mt-3 text-sm text-slate-300"><strong>Budget/Product:</strong> {enquiry.budget_or_product}</p>}
                <p className="mt-2 text-sm text-slate-300">{enquiry.message}</p>
                <p className="mt-3 text-xs text-slate-600">{new Date(enquiry.created_at).toLocaleString()}</p>
              </article>
            )) : <p className="p-6 text-slate-500">No enquiries yet.</p>}
          </div>
        </div>
      )}
    </div>
  );
}


