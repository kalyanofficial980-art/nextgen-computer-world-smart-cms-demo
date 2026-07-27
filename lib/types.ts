export type StockStatus = "In Stock" | "Out of Stock" | "Coming Soon" | "Sold";
export type ProductCondition = "New" | "Like New" | "Excellent" | "Good";

export type Product = {
  slug: string;
  name: string;
  category: string;
  brand: string;
  processor: string;
  ram: string;
  storage: string;
  price: number;
  condition: ProductCondition;
  stock: StockStatus;
  warranty: string;
  image: string;
  featured: boolean;
  description: string;
  specs: Record<string, string>;
  included: string[];
};
