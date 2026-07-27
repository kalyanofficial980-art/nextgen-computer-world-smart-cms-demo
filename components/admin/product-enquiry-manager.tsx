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
import { Icon } from "@/components/icon";
import { createClient } from "@/lib/supabase/client";

type ProductImageRow = {
  id: string;
  image_url: string;
  alt_text: string;
  sort_order: number;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  sku: string | null;
  category: string;
  brand: string;
  processor: string;
  ram: string;
  storage: string;
  price: number;
  stock_quantity: number;
  cost_price: number | null;
  regular_price: number | null;
  offer_price: number | null;
  offer_starts_at: string | null;
  offer_ends_at: string | null;
  condition: string;
  stock: string;
  warranty: string;
  image_url: string;
  featured: boolean;
  best_seller: boolean;
  new_arrival: boolean;
  active: boolean;
  description: string;
  seo_title: string;
  seo_description: string;
  tags: string[] | null;
  specs: Record<string, string> | null;
  included: string[] | null;
  created_at: string;
  deleted_at: string | null;
  product_images: ProductImageRow[] | null;
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
  sku: string;
  category: string;
  brand: string;
  processor: string;
  ram: string;
  storage: string;
  price: string;
  stock_quantity: string;
  cost_price: string;
  regular_price: string;
  offer_price: string;
  offer_starts_at: string;
  offer_ends_at: string;
  condition: string;
  stock: string;
  warranty: string;
  image_url: string;
  featured: boolean;
  best_seller: boolean;
  new_arrival: boolean;
  active: boolean;
  description: string;
  seo_title: string;
  seo_description: string;
  tagsText: string;
  specsText: string;
  includedText: string;
};

const blankProduct: ProductForm = {
  id: "",
  name: "",
  slug: "",
  sku: "",
  category: "Refurbished Laptops",
  brand: "",
  processor: "Not Applicable",
  ram: "Not Applicable",
  storage: "Not Applicable",
  price: "0",
  stock_quantity: "1",
  cost_price: "",
  regular_price: "0",
  offer_price: "",
  offer_starts_at: "",
  offer_ends_at: "",
  condition: "New",
  stock: "In Stock",
  warranty: "1 Year",
  image_url: "/products/business-laptop.svg",
  featured: false,
  best_seller: false,
  new_arrival: false,
  active: true,
  description: "",
  seo_title: "",
  seo_description: "",
  tagsText: "",
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

export function ProductEnquiryManager({ ownerEmail }: { ownerEmail: string }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [tab, setTab] = useState<"products" | "enquiries">("products");
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);
  const [form, setForm] = useState<ProductForm>(blankProduct);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [currentGallery, setCurrentGallery] = useState<ProductImageRow[]>([]);
  const [message, setMessage] = useState("Loading CMS data…");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [
      { data: productData, error: productError },
      { data: enquiryData, error: enquiryError },
    ] = await Promise.all([
      supabase
        .from("products")
        .select("*,product_images(id,image_url,alt_text,sort_order)")
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
      [...new Set(products.filter((product) => !product.deleted_at).map((product) => product.category))]
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

  async function uploadGalleryImages(productId: string, productName: string) {
    if (!galleryFiles.length) return;

    if (galleryFiles.length > 8) {
      throw new Error("Upload a maximum of 8 gallery images at one time.");
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const uploadedRows: Array<{
      product_id: string;
      image_url: string;
      alt_text: string;
      sort_order: number;
    }> = [];

    let nextOrder = currentGallery.length + 1;

    for (const file of galleryFiles) {
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Unsupported gallery file: ${file.name}`);
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error(`${file.name} is larger than 5 MB.`);
      }

      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `gallery/${productId}/${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

      if (error) throw error;

      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      uploadedRows.push({
        product_id: productId,
        image_url: data.publicUrl,
        alt_text: productName,
        sort_order: nextOrder,
      });
      nextOrder += 1;
    }

    const { error } = await supabase.from("product_images").insert(uploadedRows);
    if (error) throw error;
  }

  async function removeGalleryImage(image: ProductImageRow) {
    if (!window.confirm("Remove this gallery image?")) return;

    const { error } = await supabase.from("product_images").delete().eq("id", image.id);
    if (error) {
      setMessage(error.message);
      return;
    }

    const storagePath = storagePathFromUrl(image.image_url);
    if (storagePath) {
      await supabase.storage.from("product-images").remove([storagePath]);
    }

    setCurrentGallery((current) => current.filter((item) => item.id !== image.id));
    setMessage("Gallery image removed.");
    await load();
    router.refresh();
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
      const stockQuantity = Number(form.stock_quantity);
      const costPrice = form.cost_price ? Number(form.cost_price) : null;
      const regularPrice = form.regular_price ? Number(form.regular_price) : price;
      const offerPrice = form.offer_price ? Number(form.offer_price) : null;

      if (!Number.isFinite(price) || price < 0 || !Number.isInteger(stockQuantity) || stockQuantity < 0) {
        throw new Error("Enter a valid non-negative product price.");
      }

      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim() || null,
        slug: slugify(form.slug || form.name),
        category: form.category.trim(),
        brand: form.brand.trim(),
        processor: form.processor.trim() || "Not Applicable",
        ram: form.ram.trim() || "Not Applicable",
        storage: form.storage.trim() || "Not Applicable",
        price,
        stock_quantity: stockQuantity,
        cost_price: costPrice,
        regular_price: regularPrice,
        offer_price: offerPrice,
        offer_starts_at: form.offer_starts_at ? new Date(form.offer_starts_at).toISOString() : null,
        offer_ends_at: form.offer_ends_at ? new Date(form.offer_ends_at).toISOString() : null,
        condition: form.condition,
        stock: form.stock,
        warranty: form.warranty.trim(),
        image_url: imageUrl,
        featured: form.featured,
        best_seller: form.best_seller,
        new_arrival: form.new_arrival,
        active: form.active,
        description: form.description.trim(),
        seo_title: form.seo_title.trim(),
        seo_description: form.seo_description.trim(),
        tags: form.tagsText.split(",").map((item) => item.trim()).filter(Boolean),
        specs: parseSpecs(form.specsText),
        included: parseIncluded(form.includedText),
      };

      if (!payload.name || !payload.slug || !payload.category || !payload.brand) {
        throw new Error("Complete the required product fields.");
      }

      const query = form.id
        ? supabase
            .from("products")
            .update(payload)
            .eq("id", form.id)
            .select("id")
            .single()
        : supabase.from("products").insert(payload).select("id").single();

      const { data: savedProduct, error } = await query;

      if (error) throw error;
      if (!savedProduct?.id) throw new Error("Product ID was not returned after save.");

      await uploadGalleryImages(savedProduct.id, payload.name);

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
      setGalleryFiles([]);
      setCurrentGallery([]);
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
      sku: product.sku ?? "",
      category: product.category,
      brand: product.brand,
      processor: product.processor,
      ram: product.ram,
      storage: product.storage,
      price: String(product.price),
      stock_quantity: String(product.stock_quantity ?? 0),
      cost_price: product.cost_price === null ? "" : String(product.cost_price),
      regular_price: product.regular_price === null ? String(product.price) : String(product.regular_price),
      offer_price: product.offer_price === null ? "" : String(product.offer_price),
      offer_starts_at: product.offer_starts_at ? product.offer_starts_at.slice(0, 16) : "",
      offer_ends_at: product.offer_ends_at ? product.offer_ends_at.slice(0, 16) : "",
      condition: product.condition,
      stock: product.stock,
      warranty: product.warranty,
      image_url: product.image_url,
      featured: product.featured,
      best_seller: product.best_seller ?? false,
      new_arrival: product.new_arrival ?? false,
      active: product.active,
      description: product.description,
      seo_title: product.seo_title ?? "",
      seo_description: product.seo_description ?? "",
      tagsText: (product.tags ?? []).join(", "),
      specsText: specsToText(product.specs),
      includedText: (product.included ?? []).join("\n"),
    });

    setImageFile(null);
    setGalleryFiles([]);
    setCurrentGallery([...(product.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function archiveProduct(product: ProductRow) {
    if (!window.confirm(`Archive ${product.name}? It will disappear from the public catalogue but remain recoverable.`)) {
      return;
    }

    const { error } = await supabase
      .from("products")
      .update({ deleted_at: new Date().toISOString(), active: false })
      .eq("id", product.id);

    setMessage(error ? error.message : "Product archived. You can restore it later.");

    if (!error) {
      if (form.id === product.id) {
        setForm(blankProduct);
        setImageFile(null);
        setGalleryFiles([]);
        setCurrentGallery([]);
      }
      await load();
      router.refresh();
    }
  }

  async function restoreProduct(product: ProductRow) {
    const { error } = await supabase
      .from("products")
      .update({ deleted_at: null, active: true })
      .eq("id", product.id);

    setMessage(error ? error.message : "Product restored to the catalogue.");

    if (!error) {
      await load();
      router.refresh();
    }
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

      <div className="mt-6 flex rounded-2xl border border-slate-700 bg-slate-950/45 p-1">
        {(["products", "enquiries"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`min-h-11 flex-1 rounded-xl text-sm font-black ${
              tab === value
                ? "bg-cyan-300 text-slate-950"
                : "text-slate-400"
            }`}
          >
            {value === "products"
              ? "Product management"
              : "Enquiry management"}
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
                  SKU / inventory code
                </span>
                <input
                  value={form.sku}
                  onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value }))}
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
                <span className="mb-1.5 block text-xs font-black text-slate-300">Stock quantity</span>
                <input type="number" min="0" step="1" value={form.stock_quantity} onChange={(event) => setForm((current) => ({ ...current, stock_quantity: event.target.value }))} className="focus-ring min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm text-white" />
              </label>
              <label>
                <span className="mb-1.5 block text-xs font-black text-slate-300">Cost price (private)</span>
                <input type="number" min="0" step="0.01" value={form.cost_price} onChange={(event) => setForm((current) => ({ ...current, cost_price: event.target.value }))} className="focus-ring min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm text-white" />
              </label>
              <label>
                <span className="mb-1.5 block text-xs font-black text-slate-300">Regular price</span>
                <input type="number" min="0" step="0.01" value={form.regular_price} onChange={(event) => setForm((current) => ({ ...current, regular_price: event.target.value }))} className="focus-ring min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm text-white" />
              </label>
              <label>
                <span className="mb-1.5 block text-xs font-black text-slate-300">Offer price</span>
                <input type="number" min="0" step="0.01" value={form.offer_price} onChange={(event) => setForm((current) => ({ ...current, offer_price: event.target.value }))} className="focus-ring min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm text-white" />
              </label>
              <label>
                <span className="mb-1.5 block text-xs font-black text-slate-300">Offer starts</span>
                <input type="datetime-local" value={form.offer_starts_at} onChange={(event) => setForm((current) => ({ ...current, offer_starts_at: event.target.value }))} className="focus-ring min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm text-white" />
              </label>
              <label>
                <span className="mb-1.5 block text-xs font-black text-slate-300">Offer ends</span>
                <input type="datetime-local" value={form.offer_ends_at} onChange={(event) => setForm((current) => ({ ...current, offer_ends_at: event.target.value }))} className="focus-ring min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm text-white" />
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
              <span className="mb-1.5 block text-xs font-black text-slate-300">SEO title</span>
              <input value={form.seo_title} maxLength={70} onChange={(event) => setForm((current) => ({ ...current, seo_title: event.target.value }))} className="focus-ring min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm text-white" />
            </label>
            <label className="mt-3 block">
              <span className="mb-1.5 block text-xs font-black text-slate-300">SEO description</span>
              <textarea rows={3} value={form.seo_description} maxLength={170} onChange={(event) => setForm((current) => ({ ...current, seo_description: event.target.value }))} className="focus-ring w-full rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-sm text-white" />
            </label>
            <label className="mt-3 block">
              <span className="mb-1.5 block text-xs font-black text-slate-300">Tags</span>
              <input value={form.tagsText} placeholder="gaming, office, student" onChange={(event) => setForm((current) => ({ ...current, tagsText: event.target.value }))} className="focus-ring min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm text-white" />
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
                Primary product image
              </span>
              <span className="mb-2 block text-[11px] text-slate-500">
                JPG, PNG or WebP • Maximum 5 MB • Upload only, no image URL required
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

            <label className="mt-4 block">
              <span className="mb-1.5 block text-xs font-black text-slate-300">
                Additional gallery images
              </span>
              <span className="mb-2 block text-[11px] text-slate-500">
                Select multiple images • Up to 8 at once • Maximum 5 MB each
              </span>
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp"
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setGalleryFiles(Array.from(event.target.files ?? []))
                }
                className="w-full text-xs text-slate-400"
              />
              {galleryFiles.length > 0 && (
                <span className="mt-2 block text-xs text-cyan-200">
                  {galleryFiles.length} gallery image{galleryFiles.length === 1 ? "" : "s"} selected
                </span>
              )}
            </label>

            {currentGallery.length > 0 && (
              <div className="mt-4">
                <span className="mb-2 block text-xs font-black text-slate-300">
                  Existing gallery
                </span>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {currentGallery.map((image) => (
                    <div key={image.id} className="rounded-xl border border-slate-700 bg-slate-950/45 p-2">
                      <p className="truncate text-[10px] text-slate-500">Image {image.sort_order}</p>
                      <button
                        type="button"
                        onClick={() => void removeGalleryImage(image)}
                        className="mt-2 w-full rounded-lg border border-rose-400/30 px-2 py-1.5 text-[10px] font-black text-rose-200"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                <input type="checkbox" checked={form.best_seller} onChange={(event) => setForm((current) => ({ ...current, best_seller: event.target.checked }))} className="size-4 accent-cyan-300" />
                Best seller
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.new_arrival} onChange={(event) => setForm((current) => ({ ...current, new_arrival: event.target.checked }))} className="size-4 accent-cyan-300" />
                New arrival
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
                  setGalleryFiles([]);
                  setCurrentGallery([]);
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
                      {product.deleted_at ? "Archived" : product.active ? "Public" : "Draft"}
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
                    {product.deleted_at ? (
                      <button
                        type="button"
                        onClick={() => void restoreProduct(product)}
                        className="min-h-10 flex-1 rounded-xl border border-emerald-400/30 text-xs font-black text-emerald-200"
                      >
                        Restore
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void archiveProduct(product)}
                        className="min-h-10 flex-1 rounded-xl border border-amber-400/30 text-xs font-black text-amber-200"
                      >
                        Archive
                      </button>
                    )}
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
                          {product.deleted_at ? "Archived" : product.active ? "Yes" : "Draft"}
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
                            {product.deleted_at ? (
                              <button
                                type="button"
                                onClick={() => void restoreProduct(product)}
                                className="rounded-lg border border-emerald-400/30 px-3 py-2 text-xs font-black text-emerald-200"
                              >
                                Restore
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => void archiveProduct(product)}
                                className="rounded-lg border border-amber-400/30 px-3 py-2 text-xs font-black text-amber-200"
                              >
                                Archive
                              </button>
                            )}
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
      ) : (
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
      )}
    </div>
  );
}
