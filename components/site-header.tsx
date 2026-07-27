"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icon";
import { useSiteSettings } from "@/components/site-settings-provider";
import { whatsappUrl } from "@/lib/site";

const links = [
  ["Home", "/"],
  ["Catalogue", "/catalogue"],
  ["Offers", "/offers"],
  ["Reviews", "/reviews"],
  ["Compare", "/compare"],
  ["Services", "/services"],
  ["Contact", "/contact"],
] as const;

function Brand() {
  const settings = useSiteSettings();

  return (
    <Link href="/" className="focus-ring flex items-center gap-3 rounded-xl">
      {settings.logo_url ? (
        <span className="grid size-12 place-items-center overflow-hidden rounded-2xl border border-slate-700 bg-white/95 p-1.5">
          <Image
            src={settings.logo_url}
            alt={`${settings.business_name} logo`}
            width={44}
            height={44}
            className="h-full w-full object-contain"
          />
        </span>
      ) : (
        <span
          className="grid size-11 place-items-center rounded-2xl font-black text-slate-950"
          style={{
            background: `linear-gradient(135deg, ${settings.primary_color}, ${settings.secondary_color})`,
          }}
        >
          {settings.business_name
            .split(/\s+/)
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "NG"}
        </span>
      )}
      <span>
        <strong className="block text-sm leading-tight text-white">
          {settings.business_name}
        </strong>
        <span className="mt-1 block text-[10px] text-slate-400">
          {settings.short_tagline}
        </span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const settings = useSiteSettings();
  const [open, setOpen] = useState(false);
  const adminArea =
    pathname.startsWith("/admin") || pathname.startsWith("/auth");

  if (adminArea) {
    return (
      <header className="glass sticky top-0 z-50 border-x-0 border-t-0">
        <div className="mx-auto flex min-h-16 w-[min(calc(100%-2rem),1180px)] items-center justify-between gap-4">
          <Brand />
          <Link
            href="/"
            className="focus-ring rounded-xl border border-slate-700 px-4 py-2 text-sm font-bold text-slate-200"
          >
            Back to website
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="glass sticky top-0 z-50 border-x-0 border-t-0">
      {settings.announcement_enabled && settings.announcement_text && (
        <div
          className="px-4 py-2 text-center text-xs font-black text-slate-950"
          style={{ backgroundColor: settings.primary_color }}
        >
          {settings.announcement_text}
        </div>
      )}
      <div className="mx-auto flex min-h-20 w-[min(calc(100%-2rem),1180px)] items-center justify-between gap-5">
        <Brand />

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
              `Hello ${settings.business_name}, I would like to know more about your products and services.`,
              settings,
            )}
            target="_blank"
            rel="noreferrer"
            className="focus-ring hidden min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-black text-slate-950 sm:inline-flex"
            style={{ backgroundColor: settings.accent_color }}
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
          className="mx-auto mb-4 grid w-[min(calc(100%-2rem),1180px)] gap-1 rounded-2xl border border-slate-700 bg-[#07111f] p-3"
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
  );
}
