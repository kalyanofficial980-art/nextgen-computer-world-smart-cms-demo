import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icon";
import { ProductCard } from "@/components/product-card";
import { productRepository } from "@/lib/product-repository";
import { products as fallbackProducts } from "@/lib/products";
import { siteConfig, whatsappUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await productRepository.findBySlug(slug);

  if (!product) return { title: "Product not found" };

  return { title: product.name, description: product.description };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await productRepository.findBySlug(slug);
  if (!product) notFound();

  const allProducts = await productRepository.list();
  const related = allProducts
    .filter((candidate) => candidate.category === product.category && candidate.slug !== product.slug)
    .slice(0, 3);

  const rows = {
    Brand: product.brand,
    Category: product.category,
    Condition: product.condition,
    Processor: product.processor,
    RAM: product.ram,
    Storage: product.storage,
    Warranty: product.warranty,
    Stock: product.stock,
    ...product.specs,
  };

  const compareSlug = related[0]?.slug ?? fallbackProducts[0].slug;

  return (
    <>
      <section className="px-4 py-20">
        <div className="mx-auto grid max-w-[1180px] gap-12 lg:grid-cols-[.95fr_1.05fr]">
          <div className="surface h-fit rounded-[2rem] p-5 lg:sticky lg:top-28">
            <div className="relative h-[420px] overflow-hidden rounded-3xl bg-slate-950">
              <Image src={product.image} alt={product.name} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            </div>
          </div>
          <div>
            <span className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/7 px-3 py-2 text-xs font-black tracking-[0.13em] text-cyan-300 uppercase">
              {product.category}
            </span>
            <h1 className="mt-5 text-balance text-5xl font-black tracking-[-0.055em] text-white sm:text-7xl">{product.name}</h1>
            <p className="mt-5 text-lg text-slate-400">{product.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[product.condition, product.stock, product.warranty].map((value) => (
                <span key={value} className="rounded-full border border-slate-700 bg-slate-950/50 px-3 py-2 text-xs font-black text-slate-200">{value}</span>
              ))}
            </div>
            <div className="surface mt-6 rounded-3xl p-6">
              <span className="text-xs text-slate-500 uppercase">Starting price</span>
              <strong className="mt-1 block text-4xl font-black text-white">₹{product.price.toLocaleString("en-IN")}</strong>
              <p className="mt-2 text-xs text-slate-500">Confirm exact configuration, availability and final price with the store.</p>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href={whatsappUrl(`Hello ${siteConfig.name}, I am interested in ${product.name}. Please share the latest price, exact specifications, stock status and warranty.`)} target="_blank" rel="noreferrer" className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl bg-emerald-400 px-5 font-black text-emerald-950">
                <Icon name="whatsapp" /> Ask Latest Price
              </a>
              <Link href={`/compare?ids=${product.slug},${compareSlug}`} className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl border border-slate-700 px-5 font-black text-white">
                <Icon name="compare" /> Start Comparison
              </Link>
            </div>
            <div className="mt-8 overflow-hidden rounded-3xl border border-slate-700">
              {Object.entries(rows).filter(([, value]) => value && value !== "Not Applicable").map(([label, value]) => (
                <div key={label} className="grid grid-cols-[140px_1fr] border-b border-slate-700 last:border-b-0 sm:grid-cols-[190px_1fr]">
                  <strong className="bg-slate-950/45 p-4 text-sm text-slate-400">{label}</strong>
                  <span className="p-4 text-sm text-slate-200">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="bg-[#07111f] px-4 py-20">
        <div className="mx-auto max-w-[1180px]">
          <h2 className="text-4xl font-black tracking-[-0.04em] text-white">Related products</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => <ProductCard key={item.slug} product={item} />)}
          </div>
        </div>
      </section>
    </>
  );
}
