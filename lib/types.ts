export type StockStatus = "In Stock" | "Out of Stock" | "Coming Soon" | "Sold";
export type ProductCondition = "New" | "Like New" | "Excellent" | "Good";

export type ProductImage = {
  id?: string;
  image_url: string;
  alt_text: string;
  sort_order: number;
};

export type Product = {
  id?: string;
  slug: string;
  name: string;
  sku?: string;
  category: string;
  brand: string;
  processor: string;
  ram: string;
  storage: string;
  price: number;
  regularPrice?: number | null;
  offerPrice?: number | null;
  offerStartsAt?: string | null;
  offerEndsAt?: string | null;
  stockQuantity?: number;
  condition: ProductCondition;
  stock: StockStatus;
  warranty: string;
  image: string;
  images?: ProductImage[];
  featured: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  description: string;
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
  specs: Record<string, string>;
  included: string[];
};

export function activeProductPrice(product: Product, now = new Date()) {
  if (product.offerPrice === null || product.offerPrice === undefined) return product.price;

  const starts = product.offerStartsAt ? new Date(product.offerStartsAt) : null;
  const ends = product.offerEndsAt ? new Date(product.offerEndsAt) : null;

  if (starts && starts > now) return product.price;
  if (ends && ends < now) return product.price;

  return product.offerPrice;
}
