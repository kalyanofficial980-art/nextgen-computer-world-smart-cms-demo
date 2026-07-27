import type { Metadata } from "next";
import { Icon } from "@/components/icon";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "CMS Interface Preview",
  description:
    "Frontend preview of the planned Supabase product-management dashboard.",
};

const stats = [
  ["30", "Total Products", "box"],
  [String(products.filter((p) => p.stock === "In Stock").length), "In Stock", "chart"],
  [String(products.filter((p) => p.stock !== "In Stock").length), "Needs Attention", "shield"],
  [String(products.filter((p) => p.featured).length), "Featured", "edit"],
] as const;

export default function AdminPreviewPage() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-[1180px]">
        <div className="rounded-3xl border border-amber-300/25 bg-amber-300/7 p-5 text-sm text-amber-100">
          <strong>Frontend preview only:</strong> this dashboard UI is intentionally
          not connected to a database yet. Supabase Auth, Postgres, Storage and Row
          Level Security will be implemented in Phase 2.
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="surface h-fit rounded-3xl p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-cyan-300 font-black text-slate-950">
                NG
              </span>
              <div>
                <strong className="block text-sm text-white">Admin Console</strong>
                <span className="text-[10px] text-slate-500">UI Preview</span>
              </div>
            </div>

            <nav className="mt-6 grid gap-2">
              {[
                ["chart", "Dashboard"],
                ["box", "Products"],
                ["upload", "Images"],
                ["edit", "Offers"],
                ["users", "Enquiries"],
                ["database", "Backups"],
              ].map(([icon, label], index) => (
                <span
                  key={label}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold ${
                    index === 0
                      ? "bg-cyan-300 text-slate-950"
                      : "text-slate-400"
                  }`}
                >
                  <Icon
                    name={icon as "chart" | "box" | "upload" | "edit" | "users" | "database"}
                    className="size-4"
                  />
                  {label}
                </span>
              ))}
            </nav>
          </aside>

          <div>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <span className="text-xs font-black tracking-[0.15em] text-cyan-300 uppercase">
                  Smart Catalogue CMS
                </span>
                <h1 className="mt-3 text-4xl font-black tracking-[-0.045em] text-white sm:text-6xl">
                  Dashboard Overview
                </h1>
              </div>
              <button
                type="button"
                disabled
                className="inline-flex min-h-11 cursor-not-allowed items-center gap-2 rounded-xl bg-slate-700 px-4 text-sm font-black text-slate-300"
              >
                <Icon name="box" className="size-4" />
                Add Product — Phase 2
              </button>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map(([value, label, icon]) => (
                <div key={label} className="surface rounded-3xl p-5">
                  <span className="grid size-10 place-items-center rounded-xl bg-cyan-300/10 text-cyan-300">
                    <Icon
                      name={icon as "box" | "chart" | "shield" | "edit"}
                      className="size-5"
                    />
                  </span>
                  <strong className="mt-5 block text-3xl font-black text-white">
                    {value}
                  </strong>
                  <span className="mt-1 block text-xs text-slate-500">{label}</span>
                </div>
              ))}
            </div>

            <div className="surface mt-6 overflow-hidden rounded-3xl">
              <div className="flex items-center justify-between border-b border-slate-700 p-5">
                <div>
                  <h2 className="font-black text-white">Recent Products</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Static preview using current demo data
                  </p>
                </div>
                <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400">
                  Read-only
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-[760px] w-full border-collapse text-left">
                  <thead className="bg-slate-950/45 text-xs text-slate-500">
                    <tr>
                      <th className="p-4">Product</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.slice(0, 8).map((product) => (
                      <tr key={product.slug} className="border-t border-slate-700">
                        <td className="p-4 text-sm font-bold text-white">
                          {product.name}
                        </td>
                        <td className="p-4 text-sm text-slate-400">
                          {product.category}
                        </td>
                        <td className="p-4 text-sm text-slate-300">
                          ₹{product.price.toLocaleString("en-IN")}
                        </td>
                        <td className="p-4 text-sm text-slate-300">
                          {product.stock}
                        </td>
                        <td className="p-4">
                          <button
                            type="button"
                            disabled
                            className="cursor-not-allowed rounded-lg border border-slate-700 px-3 py-2 text-xs font-black text-slate-500"
                          >
                            Edit in Phase 2
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                ["shield", "Authentication", "Supabase email/password owner login with protected admin routes."],
                ["database", "Database & RLS", "Postgres tables with Row Level Security for safe catalogue operations."],
                ["upload", "Product Storage", "Structured image uploads through Supabase Storage buckets."],
              ].map(([icon, title, copy]) => (
                <div key={title} className="surface rounded-3xl p-6">
                  <Icon
                    name={icon as "shield" | "database" | "upload"}
                    className="size-6 text-cyan-300"
                  />
                  <h3 className="mt-4 font-black text-white">{title}</h3>
                  <p className="mt-2 text-sm text-slate-500">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
