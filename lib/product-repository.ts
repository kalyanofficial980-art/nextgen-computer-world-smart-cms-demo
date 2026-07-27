import { getProduct, products } from "@/lib/products";
import type { Product } from "@/lib/types";

/**
 * Phase 1 repository:
 * Uses local typed data so the public website is fully functional before Supabase.
 *
 * Phase 2:
 * Replace this implementation with a Supabase-backed repository while keeping
 * the page and component contracts unchanged.
 */
export const productRepository = {
  async list(): Promise<Product[]> {
    return products;
  },

  async findBySlug(slug: string): Promise<Product | undefined> {
    return getProduct(slug);
  },
};
