"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdvancedBusinessModule } from "@/components/admin/business-modules";
import { ProductEnquiryManager } from "@/components/admin/product-enquiry-manager";
import { createClient } from "@/lib/supabase/client";

type DashboardModule =
  | "overview"
  | "activity"
  | "catalogue"
  | "categories"
  | "offers"
  | "reviews"
  | "media"
  | "customers"
  | "sales"
  | "branding"
  | "business"
  | "homepage"
  | "faq"
  | "legal";

const groups: Array<{
  title: string;
  items: Array<[DashboardModule, string, string]>;
}> = [
  {
    title: "Business",
    items: [
      ["overview", "Overview", "OV"],
      ["activity", "Activity log", "AL"],
      ["sales", "Sales & sold history", "SL"],
      ["customers", "Customers", "CU"],
      ["catalogue", "Products & enquiries", "PR"],
      ["categories", "Categories", "CT"],
    ],
  },
  {
    title: "Marketing",
    items: [
      ["offers", "Offers", "OF"],
      ["reviews", "Reviews", "RV"],
      ["media", "Videos & reels", "VD"],
      ["homepage", "Homepage sections", "HP"],
      ["faq", "FAQs", "FQ"],
    ],
  },
  {
    title: "Website",
    items: [
      ["branding", "Logo, colours & hero", "BR"],
      ["business", "Contact & business details", "BS"],
      ["legal", "Privacy & policies", "LG"],
    ],
  },
];

export function AdminDashboard({ ownerEmail }: { ownerEmail: string }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [module, setModule] = useState<DashboardModule>("overview");
  const [menuOpen, setMenuOpen] = useState(false);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <span className="text-xs font-black tracking-[0.15em] text-cyan-300 uppercase">
            Advanced Business CMS
          </span>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] text-white sm:text-6xl">
            Owner Control Centre
          </h1>
          <p className="mt-2 text-sm text-slate-400">Signed in as {ownerEmail}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="focus-ring min-h-11 rounded-xl border border-slate-700 px-4 text-sm font-black text-white lg:hidden"
          >
            CMS menu
          </button>
          <button
            type="button"
            onClick={() => void logout()}
            className="focus-ring min-h-11 rounded-xl border border-slate-700 px-4 text-sm font-black text-white"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[270px_1fr]">
        <aside className={`${menuOpen ? "block" : "hidden"} surface h-fit rounded-3xl p-4 lg:sticky lg:top-24 lg:block`}>
          {groups.map((group) => (
            <div key={group.title} className="mb-6 last:mb-0">
              <h2 className="px-2 text-[10px] font-black tracking-[0.16em] text-slate-600 uppercase">
                {group.title}
              </h2>
              <div className="mt-2 grid gap-1">
                {group.items.map(([value, label, badge]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setModule(value);
                      setMenuOpen(false);
                    }}
                    className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-left text-sm font-bold transition ${
                      module === value
                        ? "bg-cyan-300 text-slate-950"
                        : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <span className={`grid size-8 place-items-center rounded-lg text-[10px] font-black ${module === value ? "bg-slate-950/10" : "bg-slate-900"}`}>
                      {badge}
                    </span>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </aside>

        <div className="min-w-0">
          {module === "catalogue" ? (
            <ProductEnquiryManager ownerEmail={ownerEmail} />
          ) : (
            <AdvancedBusinessModule module={module} />
          )}
        </div>
      </div>
    </div>
  );
}
