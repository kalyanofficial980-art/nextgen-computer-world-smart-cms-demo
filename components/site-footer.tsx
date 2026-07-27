"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icon";
import { useSiteSettings } from "@/components/site-settings-provider";
import { whatsappUrl } from "@/lib/cms-repository";

export function SiteFooter() {
  const pathname = usePathname();
  const settings = useSiteSettings();

  if (pathname.startsWith("/admin") || pathname.startsWith("/auth")) return null;

  const socialLinks = [
    ["YouTube", settings.youtube_url],
    ["Instagram", settings.instagram_url],
    ["Facebook", settings.facebook_url],
    ["Google", settings.google_business_url],
  ].filter(([, url]) => Boolean(url));

  return (
    <>
      <section className="theme-gradient px-4 py-16">
        <div className="mx-auto max-w-3xl text-center text-slate-950">
          <p className="text-xs font-black tracking-[0.16em] uppercase">Product Guidance</p>
          <h2 className="mt-4 text-balance text-3xl font-black tracking-[-0.04em] sm:text-5xl">
            Need help choosing the right system?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl opacity-80">
            Share your budget and intended use. We will help you shortlist suitable options.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a
              href={whatsappUrl(
                settings,
                `Hello ${settings.business_name}, please help me choose a suitable product. My budget and intended use are:`,
              )}
              target="_blank"
              rel="noreferrer"
              className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl bg-slate-950 px-5 font-black text-white"
            >
              <Icon name="whatsapp" />
              Get a recommendation
            </a>
            <Link
              href="/catalogue"
              className="focus-ring inline-flex min-h-12 items-center rounded-xl border border-slate-950/20 bg-white/85 px-5 font-black text-slate-950"
            >
              Browse catalogue
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#02070d] px-4 py-12 text-sm">
        <div className="mx-auto grid max-w-[1320px] gap-10 md:grid-cols-[1.25fr_.75fr_.75fr_.75fr]">
          <div>
            <div className="flex items-center gap-3">
              {settings.logo_dark_url || settings.logo_url ? (
                <span className="relative block size-12 overflow-hidden rounded-2xl bg-white/95">
                  <Image
                    src={settings.logo_dark_url || settings.logo_url}
                    alt={`${settings.business_name} logo`}
                    fill
                    sizes="48px"
                    className="object-contain p-1"
                  />
                </span>
              ) : (
                <span className="theme-gradient grid size-12 place-items-center rounded-2xl font-black text-slate-950">
                  {settings.short_name}
                </span>
              )}
              <div>
                <strong className="block text-white">{settings.business_name}</strong>
                <span className="text-xs text-slate-500">{settings.tagline}</span>
              </div>
            </div>
            <p className="mt-5 max-w-md text-slate-500">{settings.description}</p>
            <p className="mt-3 text-xs text-slate-600">{settings.working_hours}</p>
          </div>

          <div>
            <h3 className="font-black text-white">Explore</h3>
            <div className="mt-4 grid gap-2 text-slate-500">
              <Link href="/catalogue">Catalogue</Link>
              <Link href="/offers">Offers</Link>
              <Link href="/compare">Compare</Link>
              <Link href="/services">Services</Link>
              <Link href="/reviews">Reviews</Link>
              <Link href="/media">Videos & Reels</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>

          <div>
            <h3 className="font-black text-white">Policies</h3>
            <div className="mt-4 grid gap-2 text-slate-500">
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/policies/refund">Refunds</Link>
              <Link href="/policies/warranty">Warranty</Link>
              <Link href="/policies/delivery">Delivery</Link>
            </div>
          </div>

          <div>
            <h3 className="font-black text-white">Contact</h3>
            <div className="mt-4 grid gap-3 text-slate-500">
              <a href={`tel:${settings.phone_link}`} className="flex items-center gap-2">
                <Icon name="phone" className="size-4" />
                {settings.phone_display}
              </a>
              <a href={`mailto:${settings.contact_email}`} className="flex items-center gap-2 break-all">
                <Icon name="mail" className="size-4" />
                {settings.contact_email}
              </a>
              <a href={settings.map_url} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                <Icon name="map" className="size-4" />
                {settings.address_line}
              </a>
            </div>

            {socialLinks.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {socialLinks.map(([label, url]) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-slate-800 px-2.5 py-1.5 text-xs font-bold text-slate-400"
                  >
                    {label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-[1320px] flex-col justify-between gap-3 border-t border-slate-800 pt-6 text-xs text-slate-600 sm:flex-row">
          <span>© {new Date().getFullYear()} {settings.business_name}. All rights reserved.</span>
          <span>Product availability and prices may change. Confirm before purchase.</span>
        </div>
      </footer>
    </>
  );
}
