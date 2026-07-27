"use client";

import { FormEvent } from "react";
import { Icon } from "@/components/icon";
import { siteConfig, whatsappUrl } from "@/lib/site";

export function EnquiryForm({
  title,
  type,
}: {
  title: string;
  type: "repair" | "exchange" | "custom PC" | "general";
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const lines = [
      `Hello ${siteConfig.name}, I would like to submit a ${type} enquiry.`,
    ];

    data.forEach((value, key) => {
      if (String(value).trim()) lines.push(`${key}: ${value}`);
    });

    window.open(whatsappUrl(lines.join("\n")), "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={submit} className="surface rounded-3xl p-6 sm:p-8">
      <h3 className="text-2xl font-black text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">
        This structured form opens WhatsApp with a prepared requirement message.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-xs font-black text-slate-300">Name</span>
          <input
            name="Name"
            required
            className="focus-ring min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-white"
          />
        </label>
        <label>
          <span className="mb-2 block text-xs font-black text-slate-300">Phone</span>
          <input
            name="Phone"
            required
            className="focus-ring min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-white"
          />
        </label>
        <label>
          <span className="mb-2 block text-xs font-black text-slate-300">
            Budget or product
          </span>
          <input
            name="Budget or product"
            className="focus-ring min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-white"
          />
        </label>
        <label>
          <span className="mb-2 block text-xs font-black text-slate-300">
            Preferred time
          </span>
          <input
            name="Preferred time"
            className="focus-ring min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-white"
          />
        </label>
        <label className="sm:col-span-2">
          <span className="mb-2 block text-xs font-black text-slate-300">
            Requirement
          </span>
          <textarea
            name="Requirement"
            required
            rows={5}
            className="focus-ring w-full rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-white"
          />
        </label>
      </div>

      <button
        type="submit"
        className="focus-ring mt-5 inline-flex min-h-12 items-center gap-2 rounded-xl bg-emerald-400 px-5 font-black text-emerald-950"
      >
        <Icon name="whatsapp" />
        Continue on WhatsApp
      </button>
    </form>
  );
}
