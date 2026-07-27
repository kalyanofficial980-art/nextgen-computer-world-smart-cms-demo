import type { Metadata } from "next";
import { EnquiryForm } from "@/components/enquiry-form";
import { Icon } from "@/components/icon";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Laptop repair, desktop support, upgrades, networking and custom PC planning in Nellore.",
};

const services = [
  ["edit", "Laptop Repair", "Diagnostics, software issues, upgrades and common hardware support."],
  ["box", "Desktop Support", "Component checks, performance upgrades and system setup."],
  ["chart", "RAM & SSD Upgrades", "Compatibility guidance and performance-focused upgrades."],
  ["database", "Data Recovery Assessment", "Initial evaluation for storage and deleted-data recovery requirements."],
  ["shield", "Networking Setup", "Router setup, Wi-Fi improvement and small-office networking."],
  ["users", "Custom PC Planning", "Configurations for gaming, editing, business and professional workloads."],
] as const;

export default function ServicesPage() {
  return (
    <>
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-[1180px]">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-black tracking-[0.15em] text-cyan-300 uppercase">
              Technology Services
            </span>
            <h1 className="mt-4 text-balance text-4xl font-black tracking-[-0.05em] text-white sm:text-6xl">
              Practical support for computers and networks.
            </h1>
            <p className="mt-5 text-lg text-slate-400">
              Tell us what you need. We will review the requirement and contact you with the next step.
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

      <section className="bg-[#07111f] px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <EnquiryForm title="Service or product enquiry" type="general" />
        </div>
      </section>
    </>
  );
}