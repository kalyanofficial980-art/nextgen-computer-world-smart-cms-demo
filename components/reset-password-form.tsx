"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmation") ?? "");

    if (password.length < 10) {
      setMessage("Use at least 10 characters.");
      return;
    }

    if (password !== confirmation) {
      setMessage("The passwords do not match.");
      return;
    }

    setSaving(true);
    setMessage("Updating password…");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      await supabase.auth.signOut();
      router.replace("/admin/login?message=password-updated");
      router.refresh();
    } catch {
      setMessage("Unable to update the password. Open the latest recovery email and try again.");
      setSaving(false);
    }
  }

  return (
    <div className="surface mx-auto max-w-md rounded-3xl p-6 sm:p-8">
      <h1 className="text-3xl font-black text-white">Set a new password</h1>
      <p className="mt-2 text-sm text-slate-400">
        Use a unique password with at least 10 characters.
      </p>

      <form onSubmit={submit} className="mt-6 grid gap-4">
        <label>
          <span className="mb-2 block text-xs font-black text-slate-300">New password</span>
          <input
            name="password"
            type="password"
            minLength={10}
            autoComplete="new-password"
            required
            className="focus-ring min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-white"
          />
        </label>

        <label>
          <span className="mb-2 block text-xs font-black text-slate-300">
            Confirm password
          </span>
          <input
            name="confirmation"
            type="password"
            minLength={10}
            autoComplete="new-password"
            required
            className="focus-ring min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-white"
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          className="focus-ring min-h-12 rounded-xl bg-cyan-300 px-5 font-black text-slate-950 disabled:opacity-50"
        >
          {saving ? "Updating…" : "Update password"}
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