import type { Metadata } from "next";
import { EnquiryForm } from "@/components/enquiry-form";
import { Icon } from "@/components/icon";
import { getBusinessSettings, whatsappUrl } from "@/lib/cms-repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact us for products, upgrades, repairs and technical support.",
};

export default async function ContactPage() {
  const settings = await getBusinessSettings();

  return (
    <>
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-[1320px]">
          <div className="mx-auto max-w-3xl text-center">
            <span className="theme-text text-xs font-black tracking-[0.15em] uppercase">Contact & Enquiries</span>
            <h1 className="mt-4 text-balance text-4xl font-black tracking-[-0.05em] text-white sm:text-6xl">Talk to us about products, upgrades or support.</h1>
            <p className="mt-5 text-lg text-slate-400">Contact us directly or submit your requirement below. We will respond with the next suitable step.</p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
            <div className="surface rounded-3xl p-7">
              <h2 className="text-2xl font-black text-white">Business information</h2>
              <div className="mt-6 grid gap-3">
                <a href={`tel:${settings.phone_link}`} className="focus-ring flex items-start gap-3 rounded-2xl border border-slate-700 bg-slate-950/45 p-4"><Icon name="phone" className="mt-0.5 size-5 theme-text" /><span><strong className="block text-sm text-white">Phone & WhatsApp</strong><span className="mt-1 block text-sm text-slate-500">{settings.phone_display}</span></span></a>
                <a href={`mailto:${settings.contact_email}`} className="focus-ring flex items-start gap-3 rounded-2xl border border-slate-700 bg-slate-950/45 p-4"><Icon name="mail" className="mt-0.5 size-5 theme-text" /><span className="min-w-0"><strong className="block text-sm text-white">Email</strong><span className="mt-1 block break-all text-sm text-slate-500">{settings.contact_email}</span></span></a>
                <a href={settings.map_url} target="_blank" rel="noreferrer" className="focus-ring flex items-start gap-3 rounded-2xl border border-slate-700 bg-slate-950/45 p-4"><Icon name="map" className="mt-0.5 size-5 theme-text" /><span><strong className="block text-sm text-white">Address & service area</strong><span className="mt-1 block text-sm text-slate-500">{settings.address_line}</span></span></a>
                <div className="flex items-start gap-3 rounded-2xl border border-slate-700 bg-slate-950/45 p-4"><Icon name="chart" className="mt-0.5 size-5 theme-text" /><span><strong className="block text-sm text-white">Working hours</strong><span className="mt-1 block text-sm text-slate-500">{settings.working_hours}</span></span></div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <a href={whatsappUrl(settings, `Hello ${settings.business_name}, I would like to enquire about your products or services.`)} target="_blank" rel="noreferrer" className="theme-accent-bg focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl px-5 font-black"><Icon name="whatsapp" />WhatsApp</a>
                <a href={`tel:${settings.phone_link}`} className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl border border-slate-700 px-5 font-black text-white"><Icon name="phone" />Call now</a>
              </div>
            </div>

            <div className="surface rounded-3xl bg-[radial-gradient(circle_at_80%_15%,color-mix(in_srgb,var(--primary)_16%,transparent),transparent_35%)] p-8">
              <span className="theme-soft theme-text inline-flex rounded-full border px-3 py-2 text-xs font-black tracking-[0.13em] uppercase">Service Area</span>
              <h2 className="mt-5 text-balance text-4xl font-black tracking-[-0.045em] text-white sm:text-5xl">Product guidance and technical support in {settings.address_line}.</h2>
              <p className="mt-4 text-slate-400">Contact us before visiting so we can confirm product availability, service requirements and the appropriate next step.</p>
              <p className="mt-4 text-sm text-slate-500">Service areas: {settings.service_areas.join(", ")}</p>
              <a href={settings.map_url} target="_blank" rel="noreferrer" className="theme-bg focus-ring mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl px-5 font-black"><Icon name="map" />View location</a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#07111f] px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-[860px]"><EnquiryForm title="General enquiry" type="general" /></div>
      </section>
    </>
  );
}
