"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useSiteSettings } from "@/components/site-settings-provider";

function friendlyAuthError(message: string) {
  const value = message.toLowerCase();

  if (value.includes("invalid login credentials")) {
    return "The email or password is incorrect.";
  }

  if (value.includes("email not confirmed")) {
    return "Confirm the owner email before signing in.";
  }

  if (value.includes("rate limit")) {
    return "Too many attempts. Wait a few minutes and try again.";
  }

  return "Unable to sign in. Please try again.";
}

export function AdminLogin({
  initialMessage = "",
}: {
  initialMessage?: string;
}) {
  const router = useRouter();
  const settings = useSiteSettings();
  const ownerEmail = process.env.NEXT_PUBLIC_OWNER_EMAIL || settings.owner_email;
  const [message, setMessage] = useState(initialMessage);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setMessage("Signing in…");

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");

    if (email !== ownerEmail.toLowerCase()) {
      setSubmitting(false);
      setMessage("This account is not authorised for the owner dashboard.");
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      router.replace("/admin");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? friendlyAuthError(error.message)
          : "Unable to sign in.",
      );
      setSubmitting(false);
    }
  }

  async function sendPasswordReset() {
    if (sendingReset) return;

    setSendingReset(true);
    setMessage("Sending password reset email…");

    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=/admin/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(
        ownerEmail,
        { redirectTo },
      );

      if (error) throw error;

      setMessage(`Password reset instructions were sent to ${ownerEmail}.`);
    } catch {
      setMessage("Unable to send the reset email. Please try again later.");
    } finally {
      setSendingReset(false);
    }
  }

  return (
    <div className="surface mx-auto max-w-md rounded-3xl p-6 sm:p-8">
      <span className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/7 px-3 py-2 text-xs font-black tracking-[0.13em] text-cyan-300 uppercase">
        Protected owner access
      </span>

      <h1 className="mt-5 text-3xl font-black tracking-[-0.04em] text-white">
        Sign in to the CMS
      </h1>

      <p className="mt-2 text-sm text-slate-400">
        Products, stock, images and enquiries are restricted to the verified owner.
      </p>

      <form onSubmit={submit} className="mt-6 grid gap-4">
        <label>
          <span className="mb-2 block text-xs font-black text-slate-300">Owner email</span>
          <input
            name="email"
            type="email"
            defaultValue={ownerEmail}
            readOnly
            autoComplete="username"
            required
            className="focus-ring min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-white"
          />
        </label>

        <label>
          <span className="mb-2 block text-xs font-black text-slate-300">Password</span>
          <div className="flex overflow-hidden rounded-xl border border-slate-700 bg-slate-950/60">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              minLength={10}
              autoComplete="current-password"
              required
              className="focus-ring min-h-12 min-w-0 flex-1 bg-transparent px-3 text-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="px-4 text-xs font-black text-cyan-300"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="focus-ring min-h-12 rounded-xl bg-cyan-300 px-5 font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <button
        type="button"
        disabled={sendingReset}
        onClick={() => void sendPasswordReset()}
        className="focus-ring mt-4 text-sm font-bold text-cyan-300 disabled:opacity-50"
      >
        {sendingReset ? "Sending reset email…" : "Forgot password?"}
      </button>

      {message && (
        <p className="mt-4 rounded-xl border border-cyan-300/15 bg-cyan-300/5 p-3 text-sm text-cyan-100" aria-live="polite">
          {message}
        </p>
      )}
    </div>
  );
}