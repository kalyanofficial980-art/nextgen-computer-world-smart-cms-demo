import type { Metadata } from "next";
import Link from "next/link";
import { OfferCard } from "@/components/offer-card";
import { getActiveOffers } from "@/lib/marketing-repository";

export const metadata: Metadata = {
  title: "Offers",
  description: "Current product, upgrade and service offers from NextGen Computer World.",
};

export const dynamic = "force-dynamic";

export default async function OffersPage() {
  const offers = await getActiveOffers();

  return (
    <section className="px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-[1180px]">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-black tracking-[0.15em] text-cyan-300 uppercase">
            Current offers
          </span>
          <h1 className="mt-4 text-balance text-4xl font-black tracking-[-0.05em] text-white sm:text-6xl">
            Useful deals without unclear conditions.
          </h1>
          <p className="mt-5 text-lg text-slate-400">
            Check active offers, coupon codes and available service benefits. Confirm stock and eligibility before purchase.
          </p>
        </div>

        {offers.length ? (
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        ) : (
          <div className="surface mx-auto mt-12 max-w-2xl rounded-3xl p-8 text-center">
            <h2 className="text-2xl font-black text-white">No public offers right now</h2>
            <p className="mt-3 text-slate-400">
              Contact us for current product availability and pricing.
            </p>
            <Link href="/contact" className="focus-ring mt-6 inline-flex min-h-12 items-center rounded-xl bg-cyan-300 px-5 font-black text-slate-950">
              Contact us
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
