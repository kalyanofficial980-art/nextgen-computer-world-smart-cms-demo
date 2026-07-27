"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { siteConfig, whatsappUrl } from "@/lib/site";
import type { Product } from "@/lib/types";

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
          <span
            className={`rounded-full border border-slate-600 bg-slate-950/90 px-2.5 py-1 text-[10px] font-black ${stockClass(
              product.stock,
            )}`}
          >
            {product.stock}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[10px] font-black tracking-[0.13em] text-cyan-300 uppercase">
          {product.category}
        </p>
        <h3 className="mt-2 text-xl font-black tracking-[-0.025em] text-white">
          {product.name}
        </h3>

        <div className="mt-4 flex flex-wrap gap-2">
          {product.processor !== "Not Applicable" && (
            <span className="rounded-lg border border-slate-700 bg-slate-950/45 px-2 py-1 text-[10px] font-bold text-slate-300">
              {product.processor}
            </span>
          )}
          {product.ram !== "Not Applicable" && (
            <span className="rounded-lg border border-slate-700 bg-slate-950/45 px-2 py-1 text-[10px] font-bold text-slate-300">
              {product.ram}
            </span>
          )}
          {product.storage !== "Not Applicable" && (
            <span className="rounded-lg border border-slate-700 bg-slate-950/45 px-2 py-1 text-[10px] font-bold text-slate-300">
              {product.storage}
            </span>
          )}
          <span className="rounded-lg border border-slate-700 bg-slate-950/45 px-2 py-1 text-[10px] font-bold text-slate-300">
            {product.warranty}
          </span>
        </div>

        {onCompareChange && (
          <label className="mt-4 flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-300">
            <input
              type="checkbox"
              checked={selected}
              onChange={(event) =>
                onCompareChange(product.slug, event.target.checked)
              }
              className="size-4 accent-cyan-400"
            />
            Add to comparison
          </label>
        )}

        <div className="mt-auto pt-5">
          <p className="text-[10px] text-slate-500 uppercase">Demo starting price</p>
          <strong className="mt-1 block text-2xl font-black text-white">
            ₹{product.price.toLocaleString("en-IN")}*
          </strong>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link
              href={`/products/${product.slug}`}
              className="focus-ring inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-950/55 px-3 text-xs font-black text-white"
            >
              View Details
            </Link>
            <a
              href={whatsappUrl(
                `Hello ${siteConfig.name}, I am interested in ${product.name}. Please share the latest price, exact specifications, stock status and warranty.`,
              )}
              target="_blank"
              rel="noreferrer"
              className="focus-ring inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-emerald-400 px-3 text-xs font-black text-emerald-950"
            >
              <Icon name="whatsapp" className="size-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
