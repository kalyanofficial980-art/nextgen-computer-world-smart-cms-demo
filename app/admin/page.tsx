import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin-dashboard";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Owner CMS",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  let supabase;

  try {
    supabase = await createClient();
  } catch {
    redirect("/admin/login");
  }

  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    await supabase.auth.signOut();
    redirect("/admin/login?error=not-authorized");
  }

  return (
    <section className="px-4 py-16">
      <AdminDashboard ownerEmail={profile.email ?? authData.user.email ?? ""} />
    </section>
  );
}
