import Image from "next/image";
import Link from "next/link";
import type { Offer } from "@/lib/marketing-types";

function isInternalLink(value: string) {
  return value.startsWith("/");
}

export function OfferCard({ offer }: { offer: Offer }) {
  const content = (
    <article className="surface group h-full overflow-hidden rounded-3xl">
      <div className="relative h-48 overflow-hidden bg-[radial-gradient(circle_at_70%_20%,rgba(34,211,238,.28),transparent_38%),linear-gradient(135deg,#07111f,#0b1728)]">
        {offer.image_url ? (
          <Image
            src={offer.image_url}
            alt={offer.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full place-items-center px-8 text-center">
            <span className="text-4xl font-black tracking-[-0.05em] text-cyan-200">
              {offer.discount_label || "Current offer"}
            </span>
          </div>
        )}
        {offer.discount_label && (
          <span className="absolute left-4 top-4 rounded-full bg-cyan-300 px-3 py-2 text-xs font-black text-slate-950">
            {offer.discount_label}
          </span>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-2xl font-black tracking-[-0.035em] text-white">
          {offer.title}
        </h3>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          {offer.description}
        </p>

        {offer.coupon_code && (
          <p className="mt-4 inline-flex rounded-xl border border-dashed border-cyan-300/40 bg-cyan-300/5 px-3 py-2 text-xs font-black tracking-[0.08em] text-cyan-200">
            CODE: {offer.coupon_code}
          </p>
        )}

        <span className="mt-5 block text-sm font-black text-cyan-300">
          {offer.button_label || "View offer"} →
        </span>
      </div>
    </article>
  );

  if (isInternalLink(offer.button_link)) {
    return (
      <Link href={offer.button_link || "/catalogue"} className="focus-ring block h-full rounded-3xl">
        {content}
      </Link>
    );
  }

  return (
    <a
      href={offer.button_link || "/catalogue"}
      target="_blank"
      rel="noreferrer"
      className="focus-ring block h-full rounded-3xl"
    >
      {content}
    </a>
  );
}
