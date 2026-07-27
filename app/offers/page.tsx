import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getActiveOffers } from "@/lib/cms-repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Offers",
  description: "Current product offers, bundles and limited-time promotions.",
};

export default async function OffersPage() {
  const offers = await getActiveOffers();

  return (
    <section className="px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-[1320px]">
        <div className="mx-auto max-w-3xl text-center">
          <span className="theme-text text-xs font-black tracking-[0.15em] uppercase">Offers</span>
          <h1 className="mt-4 text-balance text-4xl font-black tracking-[-0.05em] text-white sm:text-6xl">Current promotions and value bundles.</h1>
          <p className="mt-5 text-lg text-slate-400">Confirm availability, eligibility and final pricing before purchase.</p>
        </div>

        {offers.length ? (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => (
              <article key={offer.id} className="surface overflow-hidden rounded-3xl">
                {offer.image_url && (
                  <div className="relative h-56 bg-slate-950">
                    <Image src={offer.image_url} alt={offer.title} fill sizes="(max-width:768px) 100vw,33vw" className="object-cover" />
                  </div>
                )}
                <div className="p-6">
                  {offer.discount_label && <span className="theme-soft theme-text inline-flex rounded-full border px-3 py-1.5 text-xs font-black">{offer.discount_label}</span>}
                  <h2 className="mt-4 text-2xl font-black text-white">{offer.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-500">{offer.description}</p>
                  {offer.coupon_code && <p className="mt-4 text-sm text-slate-300">Coupon: <strong className="theme-text">{offer.coupon_code}</strong></p>}
                  <Link href={offer.button_link || "/catalogue"} className="theme-bg focus-ring mt-5 inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-black">{offer.button_label || "View offer"}</Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="surface mx-auto mt-12 max-w-2xl rounded-3xl p-10 text-center">
            <h2 className="text-2xl font-black text-white">No active offers right now</h2>
            <p className="mt-3 text-slate-500">Browse the catalogue or contact us for current product pricing.</p>
            <Link href="/catalogue" className="theme-bg focus-ring mt-5 inline-flex min-h-11 items-center rounded-xl px-4 font-black">Browse catalogue</Link>
          </div>
        )}
      </div>
    </section>
  );
}
