"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/icon";
import { useSiteSettings } from "@/components/site-settings-provider";
import { whatsappUrl } from "@/lib/site";
import type { Product } from "@/lib/types";

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

export function CompareClient({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const settings = useSiteSettings();
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

  function enquiryUrl(product: Product) {
    return whatsappUrl(
      `Hello ${settings.business_name}, I compared ${selected
        .map((item) => item.name)
        .join(", ")}. I am interested in ${product.name}. Please confirm current price, stock and warranty.`,
      settings,
    );
  }

  return (
    <>
      <div className="grid gap-4 md:hidden">
        {selected.map((product) => (
          <article key={product.slug} className="surface overflow-hidden rounded-3xl">
            <div className="relative h-52 bg-slate-950">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
            <div className="p-5">
              <h2 className="text-xl font-black text-white">{product.name}</h2>
              <dl className="mt-4 grid gap-3">
                {fields.map(([label, key]) => (
                  <div
                    key={key}
                    className="flex items-start justify-between gap-4 border-b border-slate-700 pb-3 text-sm"
                  >
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="text-right font-bold text-slate-200">{product[key]}</dd>
                  </div>
                ))}
              </dl>
              <strong className="mt-5 block text-2xl font-black text-white">
                ₹{product.price.toLocaleString("en-IN")}
              </strong>
              <a
                href={enquiryUrl(product)}
                target="_blank"
                rel="noreferrer"
                className="focus-ring mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-black text-slate-950"
                style={{ backgroundColor: settings.accent_color }}
              >
                <Icon name="whatsapp" className="size-4" />
                Ask about this product
              </a>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-3xl border border-slate-700 md:block">
        <table className="w-full min-w-[760px] border-collapse text-left">
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
                Starting price
              </th>
              {selected.map((product) => (
                <td
                  key={product.slug}
                  className="border-r border-slate-700 p-4 text-xl font-black text-white last:border-r-0"
                >
                  ₹{product.price.toLocaleString("en-IN")}
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
                    href={enquiryUrl(product)}
                    target="_blank"
                    rel="noreferrer"
                    className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-black text-slate-950"
                    style={{ backgroundColor: settings.accent_color }}
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
    </>
  );
}
