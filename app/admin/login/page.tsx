import type { Metadata } from "next";
import { AdminLogin } from "@/components/admin-login";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Owner CMS Login",
  robots: { index: false, follow: false },
};

const messages: Record<string, string> = {
  "not-authorized": "This account is not authorised for the owner dashboard.",
  "auth-callback": "The authentication link is invalid or has expired.",
  "recovery-required": "Open the latest password recovery email and try again.",
  "password-updated": "Password updated. Sign in with the new password.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const initialMessage =
    (params.error && messages[params.error]) ||
    (params.message && messages[params.message]) ||
    "";

  return (
    <section className="px-4 py-10 sm:py-14">
      <AdminLogin initialMessage={initialMessage} />
    </section>
  );
}