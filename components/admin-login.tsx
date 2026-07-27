"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { siteConfig } from "@/lib/site";

export function AdminLogin() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Signing in…");

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");

    if (email !== siteConfig.email.toLowerCase()) {
      setMessage(`Owner access is restricted to ${siteConfig.email}.`);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      router.replace("/admin");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed.");
    }
  }

  return (
    <div className="surface mx-auto max-w-md rounded-3xl p-7 sm:p-9">
      <span className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/7 px-3 py-2 text-xs font-black tracking-[0.13em] text-cyan-300 uppercase">
        Protected Owner Access
      </span>
      <h1 className="mt-6 text-3xl font-black tracking-[-0.04em] text-white">
        Sign in to the CMS
      </h1>
      <p className="mt-2 text-sm text-slate-400">
        Product, image, stock and enquiry management are restricted to the verified owner.
      </p>

      <form onSubmit={submit} className="mt-6 grid gap-4">
        <label>
          <span className="mb-2 block text-xs font-black text-slate-300">Owner email</span>
          <input
            name="email"
            type="email"
            defaultValue={siteConfig.email}
            required
            className="focus-ring min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-white"
          />
        </label>
        <label>
          <span className="mb-2 block text-xs font-black text-slate-300">Password</span>
          <input
            name="password"
            type="password"
            minLength={10}
            required
            className="focus-ring min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-white"
          />
        </label>
        <button
          type="submit"
          className="focus-ring min-h-12 rounded-xl bg-cyan-300 px-5 font-black text-slate-950"
        >
          Sign In
        </button>
      </form>
      {message && (
        <p className="mt-4 text-sm text-cyan-200" aria-live="polite">
          {message}
        </p>
      )}
    </div>
  );
}
