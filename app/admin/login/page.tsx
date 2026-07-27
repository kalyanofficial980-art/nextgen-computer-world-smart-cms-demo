import type { Metadata } from "next";
import { AdminLogin } from "@/components/admin-login";

export const metadata: Metadata = {
  title: "Owner CMS Login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <section className="px-4 py-20">
      <AdminLogin />
    </section>
  );
}
