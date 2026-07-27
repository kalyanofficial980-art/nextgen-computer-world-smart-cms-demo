"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icon";
import { useSiteSettings } from "@/components/site-settings-provider";
import { whatsappUrl } from "@/lib/site";

export function SiteFooter() {
  const pathname = usePathname();
  const settings = useSiteSettings();

  if (pathname.startsWith("/admin") || pathname.startsWith("/auth")) {
    return null;
  }

  return (
    <>
      <section
        className="px-4 py-16"
        style={{
          background: `linear-gradient(90deg, ${settings.primary_color}, ${settings.secondary_color})`,
        }}
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-black tracking-[0.16em] text-white/80 uppercase">
            Product Guidance
          </p>
          <h2 className="mt-4 text-balance text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl">
            Need help choosing the right system?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/80">
            Share your budget and intended use. We will help you shortlist suitable options.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a
              href={whatsappUrl(
                `Hello ${settings.business_name}, please help me choose a suitable product. My budget and intended use are:`,
                settings,
              )}
              target="_blank"
              rel="noreferrer"
              className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl px-5 font-black text-slate-950"
              style={{ backgroundColor: settings.accent_color }}
            >
              <Icon name="whatsapp" />
              Get a recommendation
            </a>
            <Link
              href="/catalogue"
              className="focus-ring inline-flex min-h-12 items-center rounded-xl bg-slate-950 px-5 font-black text-white"
            >
              Browse catalogue
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#02070d] px-4 py-12 text-sm">
        <div className="mx-auto grid max-w-[1180px] gap-10 md:grid-cols-[1.25fr_.75fr_.75fr]">
          <div>
            <div className="flex items-center gap-3">
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
                  style={{ backgroundColor: settings.primary_color }}
                >
                  {settings.business_name
                    .split(/\s+/)
                    .map((word) => word[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "NG"}
                </span>
              )}
              <div>
                <strong className="block text-white">{settings.business_name}</strong>
                <span className="text-xs text-slate-500">{settings.tagline}</span>
              </div>
            </div>
            <p className="mt-5 max-w-md text-slate-500">
              Computers, laptops, upgrades, networking products and practical technical support in {settings.location}.
            </p>
            {settings.working_hours && (
              <p className="mt-3 text-xs font-bold text-slate-500">
                Working hours: {settings.working_hours}
              </p>
            )}
          </div>

          <div>
            <h3 className="font-black text-white">Explore</h3>
            <div className="mt-4 grid gap-2 text-slate-500">
              <Link href="/catalogue">Catalogue</Link>
              <Link href="/compare">Compare</Link>
              <Link href="/services">Services</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </div>
          </div>

          <div>
            <h3 className="font-black text-white">Contact</h3>
            <div className="mt-4 grid gap-3 text-slate-500">
              <a href={`tel:${settings.phone_link}`} className="flex items-center gap-2">
                <Icon name="phone" className="size-4" />
                {settings.phone_display}
              </a>
              <a href={`mailto:${settings.email}`} className="flex items-center gap-2 break-all">
                <Icon name="mail" className="size-4" />
                {settings.email}
              </a>
              <a
                href={settings.maps_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2"
              >
                <Icon name="map" className="size-4" />
                {settings.location}
              </a>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-[1180px] flex-col justify-between gap-3 border-t border-slate-800 pt-6 text-xs text-slate-600 sm:flex-row">
          <span>© {new Date().getFullYear()} {settings.business_name}. All rights reserved.</span>
          <span>Product availability and prices may change. Confirm before purchase.</span>
        </div>
      </footer>
    </>
  );
}
