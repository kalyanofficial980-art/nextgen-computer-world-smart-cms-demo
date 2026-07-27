"use client";

import { FormEvent, useState } from "react";
import { Icon } from "@/components/icon";
import { siteConfig, whatsappUrl } from "@/lib/site";

export function EnquiryForm({
  title,
  type,
}: {
  title: string;
  type: "repair" | "exchange" | "custom PC" | "general";
}) {
  const [status, setStatus] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Saving enquiry…");

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      enquiryType: type,
      customerName: String(data.get("Name") ?? ""),
      phone: String(data.get("Phone") ?? ""),
      budgetOrProduct: String(data.get("Budget or product") ?? ""),
      preferredTime: String(data.get("Preferred time") ?? ""),
      message: String(data.get("Requirement") ?? ""),
      website: String(data.get("Website") ?? ""),
    };

    const lines = [
      `Hello ${siteConfig.name}, I would like to submit a ${type} enquiry.`,
      `Name: ${payload.customerName}`,
      `Phone: ${payload.phone}`,
      `Budget or product: ${payload.budgetOrProduct}`,
      `Preferred time: ${payload.preferredTime}`,
      `Requirement: ${payload.message}`,
    ];

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Database enquiry could not be saved.");
      }

      setStatus("Saved. Opening WhatsApp…");
      form.reset();
    } catch {
      setStatus("Opening WhatsApp. The store can still receive your message.");
    }

    window.open(whatsappUrl(lines.join("\n")), "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={submit} className="surface rounded-3xl p-6 sm:p-8">
      <h3 className="text-2xl font-black text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">
        The enquiry is recorded for the owner dashboard and also prepared for WhatsApp.
      </p>

      <input name="Website" className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-xs font-black text-slate-300">Name</span>
          <input name="Name" required maxLength={100} className="focus-ring min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-white" />
        </label>
        <label>
          <span className="mb-2 block text-xs font-black text-slate-300">Phone</span>
          <input name="Phone" required maxLength={30} className="focus-ring min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-white" />
        </label>
        <label>
          <span className="mb-2 block text-xs font-black text-slate-300">Budget or product</span>
          <input name="Budget or product" maxLength={150} className="focus-ring min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-white" />
        </label>
        <label>
          <span className="mb-2 block text-xs font-black text-slate-300">Preferred time</span>
          <input name="Preferred time" maxLength={100} className="focus-ring min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-white" />
        </label>
        <label className="sm:col-span-2">
          <span className="mb-2 block text-xs font-black text-slate-300">Requirement</span>
          <textarea name="Requirement" required minLength={5} maxLength={2000} rows={5} className="focus-ring w-full rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-white" />
        </label>
      </div>

      <button type="submit" className="focus-ring mt-5 inline-flex min-h-12 items-center gap-2 rounded-xl bg-emerald-400 px-5 font-black text-emerald-950">
        <Icon name="whatsapp" /> Continue on WhatsApp
      </button>
      {status && <p className="mt-3 text-xs text-cyan-200" aria-live="polite">{status}</p>}
    </form>
  );
}
