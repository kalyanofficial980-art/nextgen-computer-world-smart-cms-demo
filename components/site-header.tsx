"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icon";
import { useSiteSettings } from "@/components/site-settings-provider";
import { whatsappUrl } from "@/lib/cms-repository";

const links = [
  ["Home", "/"],
  ["Catalogue", "/catalogue"],
  ["Offers", "/offers"],
  ["Compare", "/compare"],
  ["Services", "/services"],
  ["Reviews", "/reviews"],
  ["Videos", "/media"],
  ["Contact", "/contact"],
] as const;

function Brand() {
  const settings = useSiteSettings();

  return (
    <Link href="/" className="focus-ring flex min-w-0 items-center gap-3 rounded-xl">
      {settings.logo_url ? (
        <span className="relative block size-12 shrink-0 overflow-hidden rounded-2xl border border-slate-700 bg-white/95">
          <Image
            src={settings.logo_url}
            alt={`${settings.business_name} logo`}
            fill
            sizes="48px"
            className="object-contain p-1"
          />
        </span>
      ) : (
        <span className="theme-gradient grid size-12 shrink-0 place-items-center rounded-2xl font-black text-slate-950">
          {settings.short_name || "NG"}
        </span>
      )}
      <span className="min-w-0">
        <strong className="block truncate text-sm leading-tight text-white">
          {settings.business_name}
        </strong>
        <span className="mt-1 block truncate text-[10px] text-slate-400">
          {settings.tagline}
        </span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const settings = useSiteSettings();
  const [open, setOpen] = useState(false);
  const adminArea = pathname.startsWith("/admin") || pathname.startsWith("/auth");

  if (adminArea) {
    return (
      <header className="glass sticky top-0 z-50 border-x-0 border-t-0">
        <div className="mx-auto flex min-h-16 w-[min(calc(100%-2rem),1320px)] items-center justify-between gap-4">
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
    <>
      {settings.announcement_active && settings.announcement_text && (
        <div className="theme-gradient px-4 py-2 text-center text-xs font-black text-slate-950">
          {settings.announcement_link ? (
            <Link href={settings.announcement_link}>{settings.announcement_text} →</Link>
          ) : (
            settings.announcement_text
          )}
        </div>
      )}

      <header className="glass sticky top-0 z-50 border-x-0 border-t-0">
        <div className="mx-auto flex min-h-20 w-[min(calc(100%-2rem),1320px)] items-center justify-between gap-5">
          <Brand />

          <nav className="hidden items-center gap-5 xl:flex" aria-label="Primary navigation">
            {links.map(([label, href]) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={`focus-ring rounded-md text-sm font-bold transition ${
                    active ? "theme-text" : "text-slate-300 hover:text-white"
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
                settings,
                `Hello ${settings.business_name}, I would like to know more about your products and services.`,
              )}
              target="_blank"
              rel="noreferrer"
              className="theme-accent-bg focus-ring hidden min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-black sm:inline-flex"
            >
              <Icon name="whatsapp" className="size-4" />
              WhatsApp
            </a>

            <button
              type="button"
              className="focus-ring grid size-11 place-items-center rounded-xl border border-slate-700 bg-slate-900 text-white xl:hidden"
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
            className="mx-auto mb-4 grid w-[min(calc(100%-2rem),1320px)] gap-1 rounded-2xl border border-slate-700 bg-[#07111f] p-3"
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
