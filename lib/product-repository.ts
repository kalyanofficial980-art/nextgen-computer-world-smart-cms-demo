import { getProduct, products as fallbackProducts } from "@/lib/products";
import { createPublicClient } from "@/lib/supabase/public";
import type { Product } from "@/lib/types";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  brand: string;
  processor: string;
  ram: string;
  storage: string;
  price: number | string;
  condition: Product["condition"];
  stock: Product["stock"];
  warranty: string;
  image_url: string;
  featured: boolean;
  active: boolean;
  description: string;
  specs: Record<string, string> | null;
  included: string[] | null;
};

function mapRow(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    brand: row.brand,
    processor: row.processor,
    ram: row.ram,
    storage: row.storage,
    price: Number(row.price),
    condition: row.condition,
    stock: row.stock,
    warranty: row.warranty,
    image: row.image_url,
    featured: row.featured,
    description: row.description,
    specs: row.specs ?? {},
    included: row.included ?? [],
  };
}

export const productRepository = {
  async list(): Promise<Product[]> {
    const supabase = createPublicClient();

    if (!supabase) return fallbackProducts;

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (error || !data?.length) {
      console.error("Supabase product list fallback:", error?.message);
      return fallbackProducts;
    }

    return (data as ProductRow[]).map(mapRow);
  },

  async findBySlug(slug: string): Promise<Product | undefined> {
    const supabase = createPublicClient();

    if (!supabase) return getProduct(slug);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("active", true)
      .maybeSingle();

    if (error || !data) {
      if (error) console.error("Supabase product fallback:", error.message);
      return getProduct(slug);
    }

    return mapRow(data as ProductRow);
  },
};
