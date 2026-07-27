import type { Metadata } from "next";
import { EnquiryForm } from "@/components/enquiry-form";
import { Icon } from "@/components/icon";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Laptop repair, desktop support, custom PC, networking, exchange and structured WhatsApp enquiry services.",
};

const services = [
  ["edit", "Laptop Repair", "Diagnostics, software issues, upgrades and common hardware support."],
  ["box", "Desktop Support", "Component checks, performance upgrades and system setup."],
  ["chart", "RAM & SSD Upgrades", "Compatibility guidance and performance-focused upgrades."],
  ["database", "Data Recovery Assessment", "Initial evaluation for storage and deleted-data recovery requirements."],
  ["shield", "Networking Setup", "Router setup, Wi-Fi improvement and small-office networking."],
  ["users", "Custom PC Planning", "Configurations for gaming, editing, business and professional workloads."],
];

export default function ServicesPage() {
  return (
    <>
      <section className="px-4 py-20">
        <div className="mx-auto max-w-[1180px]">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-black tracking-[0.15em] text-cyan-300 uppercase">
              Technology Services
            </span>
            <h1 className="mt-4 text-balance text-5xl font-black tracking-[-0.055em] text-white sm:text-7xl">
              Product sales supported by practical technical services.
            </h1>
            <p className="mt-5 text-lg text-slate-400">
              Structured enquiry experiences help customers explain the requirement
              before the store follows up.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map(([icon, title, copy]) => (
              <article key={title} className="surface rounded-3xl p-7">
                <span className="grid size-12 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-300">
                  <Icon
                    name={icon as "edit" | "box" | "chart" | "database" | "shield" | "users"}
                  />
                </span>
                <h2 className="mt-5 text-xl font-black text-white">{title}</h2>
                <p className="mt-2 text-sm text-slate-500">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#07111f] px-4 py-20">
        <div className="mx-auto grid max-w-[1180px] gap-6 lg:grid-cols-2">
          <EnquiryForm title="Repair Booking" type="repair" />
          <EnquiryForm title="Custom PC Requirement" type="custom PC" />
          <EnquiryForm title="Laptop Exchange Enquiry" type="exchange" />
          <EnquiryForm title="General Product Enquiry" type="general" />
        </div>
      </section>
    </>
  );
}
