import type { Metadata } from "next";
import Image from "next/image";
import { getPublishedReviews } from "@/lib/cms-repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Customer Reviews",
  description: "Published customer reviews for products and technical services.",
};

export default async function ReviewsPage() {
  const reviews = await getPublishedReviews(100);

  return (
    <section className="px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-[1200px]">
        <div className="mx-auto max-w-3xl text-center">
          <span className="theme-text text-xs font-black tracking-[0.15em] uppercase">Customer Reviews</span>
          <h1 className="mt-4 text-balance text-4xl font-black tracking-[-0.05em] text-white sm:text-6xl">Feedback from customers we have served.</h1>
          <p className="mt-5 text-lg text-slate-400">Only reviews approved by the owner are published.</p>
        </div>

        {reviews.length ? (
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <article key={review.id} className="surface rounded-3xl p-6">
                <div className="flex items-center gap-4">
                  {review.image_url ? (
                    <span className="relative block size-14 shrink-0 overflow-hidden rounded-full border border-slate-700 bg-slate-950">
                      <Image src={review.image_url} alt={`${review.customer_name} review`} fill sizes="56px" className="object-cover" />
                    </span>
                  ) : (
                    <span className="theme-soft theme-text grid size-14 shrink-0 place-items-center rounded-full border font-black">
                      {review.customer_name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <div className="theme-text text-xl tracking-wider">{"★".repeat(review.rating)}<span className="text-slate-700">{"★".repeat(5 - review.rating)}</span></div>
                </div>
                <p className="mt-4 leading-7 text-slate-300">“{review.review_text}”</p>
                <div className="mt-6 border-t border-slate-700 pt-4">
                  <strong className="text-white">{review.customer_name}</strong>
                  <p className="mt-1 text-xs text-slate-500">{[review.customer_city, review.product_or_service, review.verified_customer ? "Verified customer" : ""].filter(Boolean).join(" • ")}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="surface mx-auto mt-12 max-w-xl rounded-3xl p-10 text-center text-slate-400">Reviews will appear here after they are approved in the CMS.</div>
        )}
      </div>
    </section>
  );
}
