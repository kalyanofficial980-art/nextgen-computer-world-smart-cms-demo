"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Icon } from "@/components/icon";
import { useSiteSettings } from "@/components/site-settings-provider";
import { whatsappUrl } from "@/lib/cms-repository";

export function EnquiryForm({
  title,
  type,
}: {
  title: string;
  type: "repair" | "exchange" | "custom PC" | "general";
}) {
  const settings = useSiteSettings();
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setStatus("Saving your enquiry…");

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
      `Hello ${settings.business_name}, I would like to submit a ${type} enquiry.`,
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

      const result = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Too many requests. Please wait a few minutes and try again.");
        }

        throw new Error(result?.error || "Unable to save the enquiry.");
      }

      setStatus("Enquiry saved. Opening WhatsApp…");
      form.reset();
      window.open(whatsappUrl(settings, lines.join("\n")), "_blank", "noopener,noreferrer");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "The enquiry could not be submitted. Please contact us on WhatsApp.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="surface rounded-3xl p-6 sm:p-8">
      <h3 className="text-2xl font-black text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">
        Submit your requirement and we will contact you. You can also continue the conversation on WhatsApp.
      </p>

      <input
        name="Website"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-xs font-black text-slate-300">Name</span>
          <input
            name="Name"
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
            className="focus-ring min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-white"
          />
        </label>

        <label>
          <span className="mb-2 block text-xs font-black text-slate-300">Phone</span>
          <input
            name="Phone"
            type="tel"
            required
            minLength={7}
            maxLength={20}
            pattern="[0-9+()\s-]{7,20}"
            autoComplete="tel"
            inputMode="tel"
            className="focus-ring min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-white"
          />
        </label>

        <label>
          <span className="mb-2 block text-xs font-black text-slate-300">
            Budget or product
          </span>
          <input
            name="Budget or product"
            maxLength={150}
            className="focus-ring min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-white"
          />
        </label>

        <label>
          <span className="mb-2 block text-xs font-black text-slate-300">
            Preferred time
          </span>
          <input
            name="Preferred time"
            maxLength={100}
            className="focus-ring min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-white"
          />
        </label>

        <label className="sm:col-span-2">
          <span className="mb-2 block text-xs font-black text-slate-300">Requirement</span>
          <textarea
            name="Requirement"
            required
            minLength={5}
            maxLength={2000}
            rows={5}
            className="focus-ring w-full rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-white"
          />
        </label>
      </div>

      <label className="mt-4 flex items-start gap-3 text-sm text-slate-400">
        <input type="checkbox" required className="mt-1 size-4 accent-cyan-300" />
        <span>
          I agree that my contact details may be used to respond to this enquiry. See the{" "}
          <Link href="/privacy" className="font-bold text-cyan-300">
            privacy policy
          </Link>
          .
        </span>
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="focus-ring mt-5 inline-flex min-h-12 items-center gap-2 rounded-xl bg-emerald-400 px-5 font-black text-emerald-950 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Icon name="whatsapp" />
        {submitting ? "Submitting…" : "Submit and continue on WhatsApp"}
      </button>

      {status && (
        <p className="mt-3 text-sm text-cyan-200" aria-live="polite">
          {status}
        </p>
      )}
    </form>
  );
}