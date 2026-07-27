"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { useSiteSettings } from "@/components/site-settings-provider";
import { whatsappUrl } from "@/lib/cms-repository";
import { activeProductPrice, type Product } from "@/lib/types";

function stockClass(stock: Product["stock"]) {
  if (stock === "In Stock") return "text-emerald-300";
  if (stock === "Sold") return "text-rose-300";
  return "text-amber-300";
}

export function ProductCard({
  product,
  selected = false,
  onCompareChange,
}: {
  product: Product;
  selected?: boolean;
  onCompareChange?: (slug: string, checked: boolean) => void;
}) {
  const settings = useSiteSettings();
  const currentPrice = activeProductPrice(product);
  const regularPrice = product.regularPrice ?? product.price;
  const hasOffer = currentPrice < regularPrice;

  return (
    <article className="surface flex h-full flex-col overflow-hidden rounded-3xl">
      <div className="relative h-56 overflow-hidden bg-[#07111f]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-300 hover:scale-[1.03]"
        />
        <div className="absolute inset-x-3 top-3 flex justify-between gap-2">
          <span className="rounded-full border border-slate-600 bg-slate-950/90 px-2.5 py-1 text-[10px] font-black">
            {product.condition}
          </span>
          <span className={`rounded-full border border-slate-600 bg-slate-950/90 px-2.5 py-1 text-[10px] font-black ${stockClass(product.stock)}`}>
            {product.stock}
          </span>
        </div>
        <div className="absolute right-3 bottom-3 flex flex-wrap justify-end gap-2">
          {product.newArrival && <span className="theme-bg rounded-full px-2.5 py-1 text-[10px] font-black">New</span>}
          {product.bestSeller && <span className="rounded-full bg-amber-300 px-2.5 py-1 text-[10px] font-black text-slate-950">Best seller</span>}
          {hasOffer && <span className="rounded-full bg-rose-400 px-2.5 py-1 text-[10px] font-black text-slate-950">Offer</span>}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="theme-text text-[10px] font-black tracking-[0.13em] uppercase">{product.category}</p>
        <h3 className="mt-2 text-xl font-black tracking-[-0.025em] text-white">{product.name}</h3>
        {product.sku && <p className="mt-1 text-[10px] text-slate-600">SKU: {product.sku}</p>}

        <div className="mt-4 flex flex-wrap gap-2">
          {product.processor !== "Not Applicable" && <span className="rounded-lg border border-slate-700 bg-slate-950/45 px-2 py-1 text-[10px] font-bold text-slate-300">{product.processor}</span>}
          {product.ram !== "Not Applicable" && <span className="rounded-lg border border-slate-700 bg-slate-950/45 px-2 py-1 text-[10px] font-bold text-slate-300">{product.ram}</span>}
          {product.storage !== "Not Applicable" && <span className="rounded-lg border border-slate-700 bg-slate-950/45 px-2 py-1 text-[10px] font-bold text-slate-300">{product.storage}</span>}
          <span className="rounded-lg border border-slate-700 bg-slate-950/45 px-2 py-1 text-[10px] font-bold text-slate-300">{product.warranty}</span>
        </div>

        {onCompareChange && (
          <label className="mt-4 flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-300">
            <input type="checkbox" checked={selected} onChange={(event) => onCompareChange(product.slug, event.target.checked)} className="size-4 accent-cyan-400" />
            Add to comparison
          </label>
        )}

        <div className="mt-auto pt-5">
          <p className="text-[10px] text-slate-500 uppercase">{hasOffer ? "Offer price" : "Starting price"}</p>
          <div className="mt-1 flex items-baseline gap-2">
            <strong className="block text-2xl font-black text-white">₹{currentPrice.toLocaleString("en-IN")}</strong>
            {hasOffer && <span className="text-sm text-slate-500 line-through">₹{regularPrice.toLocaleString("en-IN")}</span>}
          </div>
          {typeof product.stockQuantity === "number" && product.stock === "In Stock" && (
            <p className="mt-1 text-[10px] text-slate-500">{product.stockQuantity} unit{product.stockQuantity === 1 ? "" : "s"} available</p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link href={`/products/${product.slug}`} className="focus-ring inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-950/55 px-3 text-xs font-black text-white">View Details</Link>
            <a
              href={whatsappUrl(settings, `Hello ${settings.business_name}, I am interested in ${product.name}. Please share the latest price, exact specifications, stock status and warranty.`)}
              target="_blank"
              rel="noreferrer"
              className="theme-accent-bg focus-ring inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-black"
            >
              <Icon name="whatsapp" className="size-4" /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
