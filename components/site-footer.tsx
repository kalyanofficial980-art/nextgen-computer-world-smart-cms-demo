import Link from "next/link";
import { Icon } from "@/components/icon";
import { siteConfig, whatsappUrl } from "@/lib/site";

export function SiteFooter() {
  return (
    <>
      <section className="bg-gradient-to-r from-cyan-700 via-blue-600 to-indigo-700 px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-black tracking-[0.16em] text-cyan-100 uppercase">
            Product Guidance
          </p>
          <h2 className="mt-4 text-balance text-4xl font-black tracking-[-0.045em] text-white sm:text-6xl">
            Find the right product without the confusion.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-blue-100">
            Share your budget, intended use and preferred specifications. Receive a
            clear shortlist through WhatsApp.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={whatsappUrl(
                `Hello ${siteConfig.name}, please help me choose a suitable product. My budget and intended use are:`,
              )}
              target="_blank"
              rel="noreferrer"
              className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl bg-emerald-400 px-5 font-black text-emerald-950"
            >
              <Icon name="whatsapp" />
              Get a Recommendation
            </a>
            <Link
              href="/catalogue"
              className="focus-ring inline-flex min-h-12 items-center rounded-xl bg-slate-950 px-5 font-black text-white"
            >
              Browse Catalogue
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#02070d] px-4 py-14 text-sm">
        <div className="mx-auto grid max-w-[1180px] gap-10 md:grid-cols-[1.25fr_.75fr_.75fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-600 font-black text-slate-950">
                NG
              </span>
              <div>
                <strong className="block text-white">{siteConfig.name}</strong>
                <span className="text-xs text-slate-500">
                  Smart catalogue and CMS demo
                </span>
              </div>
            </div>
            <p className="mt-5 max-w-md text-slate-500">
              A fictional portfolio demonstration created by Kalyan Web Studio.
              Products, prices, warranties and business details are sample content.
            </p>
          </div>

          <div>
            <h3 className="font-black text-white">Explore</h3>
            <div className="mt-4 grid gap-2 text-slate-500">
              <Link href="/catalogue">Catalogue</Link>
              <Link href="/compare">Compare</Link>
              <Link href="/services">Services</Link>
              <Link href="/admin-preview">CMS Preview</Link>
            </div>
          </div>

          <div>
            <h3 className="font-black text-white">Contact</h3>
            <div className="mt-4 grid gap-3 text-slate-500">
              <a href={`tel:${siteConfig.phoneLink}`} className="flex items-center gap-2">
                <Icon name="phone" className="size-4" />
                {siteConfig.phoneDisplay}
              </a>
              <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-2 break-all">
                <Icon name="mail" className="size-4" />
                {siteConfig.email}
              </a>
              <a
                href={siteConfig.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2"
              >
                <Icon name="map" className="size-4" />
                {siteConfig.location}
              </a>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-[1180px] flex-col justify-between gap-3 border-t border-slate-800 pt-6 text-xs text-slate-600 sm:flex-row">
          <span>© 2026 {siteConfig.name}. Demo content.</span>
          <span>Website concept by Kalyan Web Studio</span>
        </div>
      </footer>
    </>
  );
}
