"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/icon";
import { siteConfig, whatsappUrl } from "@/lib/site";
import type { Product } from "@/lib/types";

export function CompareClient({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const requested = (searchParams.get("ids") ?? "")
    .split(",")
    .filter(Boolean)
    .slice(0, 3);

  const selected =
    requested.length >= 2
      ? requested
          .map((slug) => products.find((product) => product.slug === slug))
          .filter((product): product is Product => Boolean(product))
      : products.slice(0, 3);

  const fields = [
    ["Category", "category"],
    ["Brand", "brand"],
    ["Condition", "condition"],
    ["Processor", "processor"],
    ["RAM", "ram"],
    ["Storage", "storage"],
    ["Warranty", "warranty"],
    ["Stock", "stock"],
  ] as const;

  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-700">
      <table className="w-full min-w-[820px] border-collapse text-left">
        <thead>
          <tr className="bg-slate-950/60">
            <th className="border-r border-slate-700 p-4 text-sm text-slate-400">
              Specification
            </th>
            {selected.map((product) => (
              <th key={product.slug} className="border-r border-slate-700 p-4 last:border-r-0">
                <div className="relative h-40 overflow-hidden rounded-2xl bg-slate-950">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="260px"
                    className="object-cover"
                  />
                </div>
                <strong className="mt-3 block text-white">{product.name}</strong>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fields.map(([label, key]) => (
            <tr key={key} className="border-t border-slate-700">
              <th className="border-r border-slate-700 bg-slate-950/40 p-4 text-sm text-slate-400">
                {label}
              </th>
              {selected.map((product) => (
                <td
                  key={product.slug}
                  className="border-r border-slate-700 p-4 text-sm text-slate-200 last:border-r-0"
                >
                  {product[key]}
                </td>
              ))}
            </tr>
          ))}
          <tr className="border-t border-slate-700">
            <th className="border-r border-slate-700 bg-slate-950/40 p-4 text-sm text-slate-400">
              Starting Price
            </th>
            {selected.map((product) => (
              <td
                key={product.slug}
                className="border-r border-slate-700 p-4 text-xl font-black text-white last:border-r-0"
              >
                ₹{product.price.toLocaleString("en-IN")}*
              </td>
            ))}
          </tr>
          <tr className="border-t border-slate-700">
            <th className="border-r border-slate-700 bg-slate-950/40 p-4 text-sm text-slate-400">
              Enquiry
            </th>
            {selected.map((product) => (
              <td key={product.slug} className="border-r border-slate-700 p-4 last:border-r-0">
                <a
                  href={whatsappUrl(
                    `Hello ${siteConfig.name}, I compared ${selected
                      .map((item) => item.name)
                      .join(", ")}. I am particularly interested in ${product.name}. Please help me choose.`,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-400 px-4 text-sm font-black text-emerald-950"
                >
                  <Icon name="whatsapp" className="size-4" />
                  WhatsApp
                </a>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
