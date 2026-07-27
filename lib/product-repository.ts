import { getProduct, products as fallbackProducts } from "@/lib/products";
import { createPublicClient } from "@/lib/supabase/public";
import type { Product, ProductImage } from "@/lib/types";

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
  price: number | string;
  regular_price: number | string | null;
  offer_price: number | string | null;
  offer_starts_at: string | null;
  offer_ends_at: string | null;
  stock_quantity: number;
  condition: Product["condition"];
  stock: Product["stock"];
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
  product_images?: ProductImage[] | null;
};

function mapRow(row: ProductRow): Product {
  const fallbackGallery: ProductImage[] = [
    {
      image_url: row.image_url,
      alt_text: row.name,
      sort_order: 0,
    },
  ];

  const galleryImages = [...(row.product_images ?? [])]
    .filter((image) => image.image_url && image.image_url !== row.image_url)
    .sort((a, b) => a.sort_order - b.sort_order);
  const images = [...fallbackGallery, ...galleryImages];

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    sku: row.sku ?? "",
    category: row.category,
    brand: row.brand,
    processor: row.processor,
    ram: row.ram,
    storage: row.storage,
    price: Number(row.price),
    regularPrice: row.regular_price === null ? null : Number(row.regular_price),
    offerPrice: row.offer_price === null ? null : Number(row.offer_price),
    offerStartsAt: row.offer_starts_at,
    offerEndsAt: row.offer_ends_at,
    stockQuantity: Number(row.stock_quantity ?? 0),
    condition: row.condition,
    stock: row.stock,
    warranty: row.warranty,
    image: images[0]?.image_url ?? row.image_url,
    images,
    featured: row.featured,
    bestSeller: row.best_seller,
    newArrival: row.new_arrival,
    description: row.description,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    tags: row.tags ?? [],
    specs: row.specs ?? {},
    included: row.included ?? [],
  };
}

function mapFallback(product: Product): Product {
  return {
    ...product,
    sku: product.sku ?? "",
    regularPrice: product.regularPrice ?? product.price,
    offerPrice: product.offerPrice ?? null,
    offerStartsAt: product.offerStartsAt ?? null,
    offerEndsAt: product.offerEndsAt ?? null,
    stockQuantity: product.stockQuantity ?? (product.stock === "In Stock" ? 1 : 0),
    images: product.images?.length
      ? product.images
      : [{ image_url: product.image, alt_text: product.name, sort_order: 0 }],
    bestSeller: product.bestSeller ?? false,
    newArrival: product.newArrival ?? false,
    seoTitle: product.seoTitle ?? "",
    seoDescription: product.seoDescription ?? "",
    tags: product.tags ?? [],
  };
}

export const productRepository = {
  async list(): Promise<Product[]> {
    const supabase = createPublicClient();

    if (!supabase) return fallbackProducts.map(mapFallback);

    const { data, error } = await supabase
      .from("products")
      .select("*,product_images(id,image_url,alt_text,sort_order)")
      .eq("active", true)
      .is("deleted_at", null)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (error || !data?.length) {
      console.error("Supabase product list fallback:", error?.message);
      return fallbackProducts.map(mapFallback);
    }

    return (data as ProductRow[]).map(mapRow);
  },

  async findBySlug(slug: string): Promise<Product | undefined> {
    const supabase = createPublicClient();

    if (!supabase) {
      const product = getProduct(slug);
      return product ? mapFallback(product) : undefined;
    }

    const { data, error } = await supabase
      .from("products")
      .select("*,product_images(id,image_url,alt_text,sort_order)")
      .eq("slug", slug)
      .eq("active", true)
      .is("deleted_at", null)
      .maybeSingle();

    if (error || !data) {
      if (error) console.error("Supabase product fallback:", error.message);
      const product = getProduct(slug);
      return product ? mapFallback(product) : undefined;
    }

    return mapRow(data as ProductRow);
  },
};
