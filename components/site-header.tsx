"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { DemoRibbon } from "@/components/demo-ribbon";
import { Icon } from "@/components/icon";
import { siteConfig, whatsappUrl } from "@/lib/site";

const links = [
  ["Home", "/"],
  ["Catalogue", "/catalogue"],
  ["Compare", "/compare"],
  ["Services", "/services"],
  ["Owner CMS", "/admin"],
  ["Contact", "/contact"],
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <DemoRibbon />
      <header className="glass sticky top-0 z-50 border-x-0 border-t-0">
        <div className="mx-auto flex min-h-20 w-[min(calc(100%-2rem),1180px)] items-center justify-between gap-5">
          <Link href="/" className="focus-ring flex items-center gap-3 rounded-xl">
            <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 via-sky-400 to-blue-600 font-black text-slate-950 shadow-lg shadow-cyan-500/15">
              NG
            </span>
            <span>
              <strong className="block text-sm leading-tight text-white">
                {siteConfig.name}
              </strong>
              <span className="mt-1 block text-[10px] text-slate-400">
                Smart Catalogue • Owner CMS
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary navigation">
            {links.map(([label, href]) => {
              const active =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`focus-ring rounded-md text-sm font-bold transition ${
                    active ? "text-cyan-300" : "text-slate-300 hover:text-white"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={whatsappUrl(
                `Hello ${siteConfig.name}, I would like to know more about your products and services.`,
              )}
              target="_blank"
              rel="noreferrer"
              className="focus-ring hidden min-h-11 items-center gap-2 rounded-xl bg-emerald-400 px-4 text-sm font-black text-emerald-950 transition hover:-translate-y-0.5 sm:inline-flex"
            >
              <Icon name="whatsapp" className="size-4" />
              WhatsApp
            </a>
            <button
              type="button"
              className="focus-ring grid size-11 place-items-center rounded-xl border border-slate-700 bg-slate-900 text-white lg:hidden"
              aria-label={open ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
            >
              <Icon name={open ? "close" : "menu"} />
            </button>
          </div>
        </div>

        {open && (
          <nav
            className="mx-auto mb-4 grid w-[min(calc(100%-2rem),1180px)] gap-1 rounded-2xl border border-slate-700 bg-[#07111f] p-3 shadow-2xl lg:hidden"
            aria-label="Mobile navigation"
          >
            {links.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="focus-ring rounded-xl px-4 py-3 text-sm font-bold text-slate-200 hover:bg-slate-800"
              >
                {label}
              </Link>
            ))}
          </nav>
        )}
      </header>
    </>
  );
}
