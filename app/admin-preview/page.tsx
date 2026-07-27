import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icon";

export const metadata: Metadata = {
  title: "Owner CMS Features",
  description: "Preview the owner-managed Supabase catalogue features.",
};

const features = [
  ["shield", "Secure owner login", "Supabase Auth protects the product and enquiry dashboard."],
  ["box", "Product CRUD", "Add, edit, delete, publish and feature catalogue products."],
  ["upload", "Image uploads", "Upload product images into the protected Supabase Storage workflow."],
  ["chart", "Stock and price updates", "Change prices, warranty, condition and stock status."],
  ["users", "Enquiry management", "View customer requirements and update lead status."],
  ["database", "Postgres + RLS", "Database access is controlled by grants and Row Level Security."],
] as const;

export default function AdminFeaturesPage() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-[1180px]">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-black tracking-[0.15em] text-cyan-300 uppercase">
            Owner-managed CMS
          </span>
          <h1 className="mt-4 text-balance text-5xl font-black tracking-[-0.055em] text-white sm:text-7xl">
            Catalogue control without calling the developer.
          </h1>
          <p className="mt-5 text-lg text-slate-400">
            The protected dashboard manages products, images, stock and enquiries
            through Supabase.
          </p>
          <Link href="/admin" className="focus-ring mt-7 inline-flex min-h-12 items-center rounded-xl bg-cyan-300 px-5 font-black text-slate-950">
            Open Owner Login
          </Link>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map(([icon, title, copy]) => (
            <article key={title} className="surface rounded-3xl p-7">
              <Icon name={icon} className="size-6 text-cyan-300" />
              <h2 className="mt-5 text-xl font-black text-white">{title}</h2>
              <p className="mt-2 text-sm text-slate-500">{copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
