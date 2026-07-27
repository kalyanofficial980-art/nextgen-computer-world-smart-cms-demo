import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Product Information",
};

export default function TermsPage() {
  return (
    <section className="px-4 py-16">
      <article className="surface mx-auto max-w-3xl rounded-3xl p-6 sm:p-10">
        <h1 className="text-4xl font-black text-white">Terms and product information</h1>
        <div className="mt-6 grid gap-5 text-slate-400">
          <p>
            Product prices, stock, specifications, condition and warranty information may change. Confirm all details with {siteConfig.name} before purchase.
          </p>
          <p>
            Images may be representative. The exact model, accessories and physical condition should be confirmed before payment.
          </p>
          <p>
            Warranty terms depend on the product, manufacturer and condition shown in the catalogue or final invoice.
          </p>
          <p>
            Repair, upgrade, data-recovery and networking outcomes depend on inspection, compatibility and device condition.
          </p>
          <p>
            Contact us at{" "}
            <a href={`mailto:${siteConfig.email}`} className="font-bold text-cyan-300">
              {siteConfig.email}
            </a>{" "}
            for current information.
          </p>
        </div>
      </article>
    </section>
  );
}