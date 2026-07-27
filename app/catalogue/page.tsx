import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductExplorer } from "@/components/product-explorer";
import { productRepository } from "@/lib/product-repository";

export const metadata: Metadata = {
  title: "Product Catalogue",
  description:
    "Search, filter, compare and enquire about laptops, desktops, custom PCs, printers, networking products and accessories.",
};

export const dynamic = "force-dynamic";

export default async function CataloguePage() {
  const products = await productRepository.list();

  return (
    <section className="px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-[1180px]">
        <div className="max-w-3xl">
          <span className="text-xs font-black tracking-[0.15em] text-cyan-300 uppercase">
            {products.length} products available
          </span>
          <h1 className="mt-4 text-balance text-4xl font-black tracking-[-0.05em] text-white sm:text-6xl">
            Search, filter and compare with confidence.
          </h1>
          <p className="mt-5 text-lg text-slate-400">
            Check specifications, current stock and warranty, then send a product-specific enquiry.
          </p>
        </div>

        <div className="mt-10">
          <Suspense
            fallback={
              <div className="surface rounded-3xl p-10 text-slate-400">
                Loading catalogue…
              </div>
            }
          >
            <ProductExplorer products={products} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}