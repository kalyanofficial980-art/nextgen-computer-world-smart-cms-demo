import type { Metadata } from "next";
import { EnquiryForm } from "@/components/enquiry-form";
import { Icon } from "@/components/icon";
import { getSiteSettings, whatsappUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact NextGen Computer World for products, upgrades, repairs and technical support in Nellore.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-[1180px]">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-black tracking-[0.15em] text-cyan-300 uppercase">
              Contact & Enquiries
            </span>
            <h1 className="mt-4 text-balance text-4xl font-black tracking-[-0.05em] text-white sm:text-6xl">
              Talk to us about products, upgrades or support.
            </h1>
            <p className="mt-5 text-lg text-slate-400">
              Contact us directly or submit your requirement below. We will respond with the next suitable step.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
            <div className="surface rounded-3xl p-7">
              <h2 className="text-2xl font-black text-white">Business information</h2>

              <div className="mt-6 grid gap-3">
                <a
                  href={`tel:${settings.phone_link}`}
                  className="focus-ring flex items-start gap-3 rounded-2xl border border-slate-700 bg-slate-950/45 p-4"
                >
                  <Icon name="phone" className="mt-0.5 size-5 text-cyan-300" />
                  <span>
                    <strong className="block text-sm text-white">Phone & WhatsApp</strong>
                    <span className="mt-1 block text-sm text-slate-500">
                      {settings.phone_display}
                    </span>
                  </span>
                </a>

                <a
                  href={`mailto:${settings.email}`}
                  className="focus-ring flex items-start gap-3 rounded-2xl border border-slate-700 bg-slate-950/45 p-4"
                >
                  <Icon name="mail" className="mt-0.5 size-5 text-cyan-300" />
                  <span className="min-w-0">
                    <strong className="block text-sm text-white">Email</strong>
                    <span className="mt-1 block break-all text-sm text-slate-500">
                      {settings.email}
                    </span>
                  </span>
                </a>

                <a
                  href={settings.maps_url}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring flex items-start gap-3 rounded-2xl border border-slate-700 bg-slate-950/45 p-4"
                >
                  <Icon name="map" className="mt-0.5 size-5 text-cyan-300" />
                  <span>
                    <strong className="block text-sm text-white">Service area</strong>
                    <span className="mt-1 block text-sm text-slate-500">
                      {settings.location}
                    </span>
                  </span>
                </a>

                {settings.working_hours && (
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-700 bg-slate-950/45 p-4">
                    <Icon name="chart" className="mt-0.5 size-5 text-cyan-300" />
                    <span>
                      <strong className="block text-sm text-white">Working hours</strong>
                      <span className="mt-1 block text-sm text-slate-500">
                        {settings.working_hours}
                      </span>
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={whatsappUrl(
                    `Hello ${settings.business_name}, I would like to enquire about your products or services.`,
                    settings,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl bg-emerald-400 px-5 font-black text-emerald-950"
                >
                  <Icon name="whatsapp" />
                  WhatsApp
                </a>

                <a
                  href={`tel:${settings.phone_link}`}
                  className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl border border-slate-700 px-5 font-black text-white"
                >
                  <Icon name="phone" />
                  Call now
                </a>
              </div>
            </div>

            <div className="surface rounded-3xl bg-[radial-gradient(circle_at_80%_15%,rgba(34,211,238,.16),transparent_35%)] p-8">
              <span className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/7 px-3 py-2 text-xs font-black tracking-[0.13em] text-cyan-300 uppercase">
                {settings.location}
              </span>

              <h2 className="mt-5 text-balance text-4xl font-black tracking-[-0.045em] text-white sm:text-5xl">
                Product guidance and technical support in {settings.location}.
              </h2>

              <p className="mt-4 text-slate-400">
                Contact us before visiting so we can confirm product availability, service requirements and the appropriate next step.
              </p>

              <a
                href={settings.maps_url}
                target="_blank"
                rel="noreferrer"
                className="focus-ring mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-cyan-300 px-5 font-black text-slate-950"
              >
                <Icon name="map" />
                View service area
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#07111f] px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-[860px]">
          <EnquiryForm title="General enquiry" type="general" />
        </div>
      </section>
    </>
  );
}
