import type { Metadata } from "next";
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
    <section className="px-4 py-20">
      <div className="mx-auto max-w-[1180px]">
        <div className="max-w-3xl">
          <span className="text-xs font-black tracking-[0.15em] text-cyan-300 uppercase">
            30 Product Catalogue
          </span>
          <h1 className="mt-4 text-balance text-5xl font-black tracking-[-0.055em] text-white sm:text-7xl">
            Search, filter and shortlist with confidence.
          </h1>
          <p className="mt-5 text-lg text-slate-400">
            Use multiple filters, compare up to three products and send a
            product-specific WhatsApp enquiry.
          </p>
        </div>

        <div className="mt-12">
          <ProductExplorer products={products} />
        </div>
      </div>
    </section>
  );
}
