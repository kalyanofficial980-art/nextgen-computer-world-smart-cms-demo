import type { Metadata } from "next";
import Link from "next/link";
import { ReviewCard } from "@/components/review-card";
import { getPublishedReviews } from "@/lib/marketing-repository";

export const metadata: Metadata = {
  title: "Customer Reviews",
  description: "Published customer feedback for products and technical services.",
};

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const reviews = await getPublishedReviews();
  const average = reviews.length
    ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
    : 0;

  return (
    <section className="px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-[1180px]">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-black tracking-[0.15em] text-cyan-300 uppercase">
            Customer feedback
          </span>
          <h1 className="mt-4 text-balance text-4xl font-black tracking-[-0.05em] text-white sm:text-6xl">
            Reviews published with owner approval.
          </h1>
          <p className="mt-5 text-lg text-slate-400">
            Feedback about products, upgrades and technical support.
          </p>
          {reviews.length > 0 && (
            <p className="mt-5 text-sm font-black text-amber-300">
              {average.toFixed(1)} / 5 average from {reviews.length} published review{reviews.length === 1 ? "" : "s"}
            </p>
          )}
        </div>

        {reviews.length ? (
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="surface mx-auto mt-12 max-w-2xl rounded-3xl p-8 text-center">
            <h2 className="text-2xl font-black text-white">No reviews published yet</h2>
            <p className="mt-3 text-slate-400">
              Genuine customer feedback can be added and approved from the protected CMS.
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
