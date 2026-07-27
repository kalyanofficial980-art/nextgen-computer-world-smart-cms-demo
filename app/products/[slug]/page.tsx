import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icon";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { getBusinessSettings, whatsappUrl } from "@/lib/cms-repository";
import { productRepository } from "@/lib/product-repository";
import { products as fallbackProducts } from "@/lib/products";
import { activeProductPrice } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await productRepository.findBySlug(slug);

  if (!product) return { title: "Product not found" };

  return {
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.description,
    openGraph: {
      title: product.seoTitle || product.name,
      description: product.seoDescription || product.description,
      images: [{ url: product.image }],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    productRepository.findBySlug(slug),
    getBusinessSettings(),
  ]);
  if (!product) notFound();

  const allProducts = await productRepository.list();
  const related = allProducts
    .filter((candidate) => candidate.category === product.category && candidate.slug !== product.slug)
    .slice(0, 3);

  const rows = {
    SKU: product.sku || "",
    Brand: product.brand,
    Category: product.category,
    Condition: product.condition,
    Processor: product.processor,
    RAM: product.ram,
    Storage: product.storage,
    Warranty: product.warranty,
    Stock: product.stock,
    "Available quantity": product.stockQuantity === undefined ? "" : String(product.stockQuantity),
    ...product.specs,
  };

  const compareSlug = related[0]?.slug ?? fallbackProducts[0].slug;
  const currentPrice = activeProductPrice(product);
  const regularPrice = product.regularPrice ?? product.price;
  const hasOffer = currentPrice < regularPrice;
  const gallery = product.images?.length
    ? product.images
    : [{ image_url: product.image, alt_text: product.name, sort_order: 0 }];

  return (
    <>
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-[.95fr_1.05fr]">
          <div className="surface h-fit rounded-[2rem] p-5 lg:sticky lg:top-28">
            <ProductGallery name={product.name} images={gallery} />
          </div>

          <div>
            <div className="flex flex-wrap gap-2">
              <span className="theme-soft theme-text inline-flex rounded-full border px-3 py-2 text-xs font-black tracking-[0.13em] uppercase">
                {product.category}
              </span>
              {product.newArrival && <span className="theme-bg inline-flex rounded-full px-3 py-2 text-xs font-black">New arrival</span>}
              {product.bestSeller && <span className="inline-flex rounded-full bg-amber-300 px-3 py-2 text-xs font-black text-slate-950">Best seller</span>}
            </div>

            <h1 className="mt-5 text-balance text-4xl font-black tracking-[-0.055em] text-white sm:text-6xl">
              {product.name}
            </h1>
            <p className="mt-5 text-lg text-slate-400">{product.description}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {[product.condition, product.stock, product.warranty].map((value) => (
                <span key={value} className="rounded-full border border-slate-700 bg-slate-950/50 px-3 py-2 text-xs font-black text-slate-200">
                  {value}
                </span>
              ))}
            </div>

            <div className="surface mt-6 rounded-3xl p-6">
              <span className="text-xs text-slate-500 uppercase">{hasOffer ? "Current offer price" : "Starting price"}</span>
              <div className="mt-1 flex flex-wrap items-baseline gap-3">
                <strong className="text-4xl font-black text-white">₹{currentPrice.toLocaleString("en-IN")}</strong>
                {hasOffer && <span className="text-lg text-slate-500 line-through">₹{regularPrice.toLocaleString("en-IN")}</span>}
              </div>
              <p className="mt-2 text-xs text-slate-500">Confirm exact configuration, availability and final price before purchase.</p>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={whatsappUrl(settings, `Hello ${settings.business_name}, I am interested in ${product.name}. Please share the latest price, exact specifications, stock status and warranty.`)}
                target="_blank"
                rel="noreferrer"
                className="theme-accent-bg focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl px-5 font-black"
              >
                <Icon name="whatsapp" /> Ask Latest Price
              </a>
              <Link href={`/compare?ids=${product.slug},${compareSlug}`} className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl border border-slate-700 px-5 font-black text-white">
                <Icon name="compare" /> Start Comparison
              </Link>
            </div>

            <div className="mt-8 overflow-hidden rounded-3xl border border-slate-700">
              {Object.entries(rows)
                .filter(([, value]) => value && value !== "Not Applicable")
                .map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[140px_1fr] border-b border-slate-700 last:border-b-0 sm:grid-cols-[190px_1fr]">
                    <strong className="bg-slate-950/45 p-4 text-sm text-slate-400">{label}</strong>
                    <span className="p-4 text-sm text-slate-200">{value}</span>
                  </div>
                ))}
            </div>

            {product.included.length > 0 && (
              <div className="surface mt-6 rounded-3xl p-6">
                <h2 className="text-xl font-black text-white">Included</h2>
                <ul className="mt-4 grid gap-2 text-sm text-slate-400">
                  {product.included.map((item) => <li key={item}>✓ {item}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-[#07111f] px-4 py-20">
          <div className="mx-auto max-w-[1320px]">
            <h2 className="text-4xl font-black tracking-[-0.04em] text-white">Related products</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => <ProductCard key={item.slug} product={item} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
