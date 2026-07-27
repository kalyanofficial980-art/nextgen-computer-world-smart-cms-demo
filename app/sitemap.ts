import type { MetadataRoute } from "next";
import { productRepository } from "@/lib/product-repository";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const products = await productRepository.list();
  const staticRoutes = [
    "",
    "/catalogue",
    "/offers",
    "/reviews",
    "/compare",
    "/services",
    "/contact",
    "/privacy",
    "/terms",
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${base}${route}`,
      lastModified: new Date(),
    })),
    ...products.map((product) => ({
      url: `${base}/products/${product.slug}`,
      lastModified: new Date(),
    })),
  ];
}
