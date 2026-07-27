import type { Metadata } from "next";
import { Suspense } from "react";
import { CompareClient } from "@/components/compare-client";

export const metadata: Metadata = {
  title: "Compare Products",
  description: "Compare product specifications side by side.",
};

export default function ComparePage() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-[1180px]">
        <div className="max-w-3xl">
          <span className="text-xs font-black tracking-[0.15em] text-cyan-300 uppercase">
            Product Comparison
          </span>
          <h1 className="mt-4 text-balance text-5xl font-black tracking-[-0.055em] text-white sm:text-7xl">
            Compare key specifications side by side.
          </h1>
          <p className="mt-5 text-lg text-slate-400">
            A clear customer-facing comparison designed to support faster shortlisting
            and direct enquiries.
          </p>
        </div>

        <div className="mt-12">
          <Suspense
            fallback={
              <div className="surface rounded-3xl p-10 text-slate-400">
                Loading comparison…
              </div>
            }
          >
            <CompareClient />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
