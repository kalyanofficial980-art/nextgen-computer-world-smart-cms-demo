import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default async function PrivacyPage() {
  const settings = await getSiteSettings();

  return (
    <section className="px-4 py-16">
      <article className="surface mx-auto max-w-3xl rounded-3xl p-6 sm:p-10">
        <h1 className="text-4xl font-black text-white">Privacy policy</h1>
        <div className="mt-6 grid gap-5 text-slate-400">
          <p>
            {settings.business_name} collects the name, phone number and enquiry details that you submit through this website.
          </p>
          <p>
            This information is used only to respond to product, service, repair, exchange or custom-computer enquiries.
          </p>
          <p>
            Enquiry records are stored in the protected owner dashboard. They are not sold to advertisers.
          </p>
          <p>
            You may request correction or deletion of your enquiry information by emailing{" "}
            <a href={`mailto:${settings.email}`} className="font-bold text-cyan-300">
              {settings.email}
            </a>
            .
          </p>
          <p>
            WhatsApp and external map links are governed by the privacy practices of their respective providers.
          </p>
        </div>
      </article>
    </section>
  );
}
