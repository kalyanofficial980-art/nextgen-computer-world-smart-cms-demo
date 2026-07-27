import Image from "next/image";
import type { Review } from "@/lib/marketing-types";

export function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="surface h-full rounded-3xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {review.image_url ? (
            <Image
              src={review.image_url}
              alt={review.customer_name}
              width={52}
              height={52}
              className="size-13 rounded-2xl object-cover"
            />
          ) : (
            <span className="grid size-13 place-items-center rounded-2xl bg-cyan-300 text-lg font-black text-slate-950">
              {review.customer_name.slice(0, 1).toUpperCase()}
            </span>
          )}
          <div>
            <h3 className="font-black text-white">{review.customer_name}</h3>
            <p className="mt-1 text-xs text-slate-500">
              {[review.customer_city, review.product_or_service].filter(Boolean).join(" • ")}
            </p>
          </div>
        </div>

        {review.verified_customer && (
          <span className="rounded-full border border-emerald-300/25 bg-emerald-300/5 px-2.5 py-1 text-[10px] font-black text-emerald-300">
            Verified
          </span>
        )}
      </div>

      <div className="mt-5 text-lg tracking-[0.12em] text-amber-300" aria-label={`${review.rating} out of 5 stars`}>
        {"★".repeat(review.rating)}
        <span className="text-slate-700">{"★".repeat(5 - review.rating)}</span>
      </div>

      <blockquote className="mt-4 text-sm leading-7 text-slate-300">
        “{review.review_text}”
      </blockquote>

      <p className="mt-5 text-xs text-slate-600">
        {new Date(`${review.review_date}T00:00:00`).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </p>
    </article>
  );
}
