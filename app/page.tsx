import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { ProductCard } from "@/components/product-card";
import { productRepository } from "@/lib/product-repository";
import { siteConfig, whatsappUrl } from "@/lib/site";

const capabilities = [
  ["30", "Initial catalogue products"],
  ["8", "Product categories"],
  ["3", "Products compared together"],
  ["CMS", "Secure owner catalogue management"],
];

const cmsFeatures = [
  ["database", "Supabase data layer", "Postgres catalogue data connected through a typed repository."],
  ["shield", "Secure owner access", "Supabase Auth, protected admin routes and Row Level Security protect management actions."],
  ["edit", "Product management", "Add, edit, delete, publish, feature and update products from the owner dashboard."],
  ["upload", "Image workflow", "Supabase Storage handles organised product-image uploads and replacement."],
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await productRepository.list();
  const categories = [...new Set(products.map((product) => product.category))].sort();
  const featured = products.filter((product) => product.featured).slice(0, 6);

  return (
    <>
      <section className="grid-fade overflow-hidden px-4 py-20 sm:py-28">
        <div className="mx-auto grid max-w-[1180px] items-center gap-14 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <span className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/7 px-3 py-2 text-xs font-black tracking-[0.13em] text-cyan-300 uppercase">
              Next.js Smart Catalogue
            </span>
            <h1 className="mt-6 text-balance text-5xl leading-[.98] font-black tracking-[-0.06em] text-white sm:text-7xl">
              A modern product experience{" "}
              <span className="text-cyan-300">owners can manage.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-400">
              Advanced public catalogue, product comparison, structured enquiries and
              a Secure owner dashboard for computer, laptop, printer and networking
              stores.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/catalogue"
                className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl bg-cyan-300 px-5 font-black text-slate-950"
              >
                Explore 30 Products
                <Icon name="arrow" />
              </Link>
              <Link
                href="/admin"
                className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/55 px-5 font-black text-white"
              >
                Preview CMS Interface
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-5 text-sm font-bold text-slate-300">
              <span className="flex items-center gap-2">
                <Icon name="check" className="size-4 text-emerald-300" />
                Search and filters
              </span>
              <span className="flex items-center gap-2">
                <Icon name="check" className="size-4 text-emerald-300" />
                Product comparison
              </span>
              <span className="flex items-center gap-2">
                <Icon name="check" className="size-4 text-emerald-300" />
                Secure owner dashboard
              </span>
            </div>
          </div>

          <div className="relative min-h-[500px]">
            <div className="surface absolute inset-6 overflow-hidden rounded-[2rem] p-5">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Smart Storefront</span>
                <span className="text-emerald-300">● Preview Online</span>
              </div>
              <div className="relative mt-5 h-72 overflow-hidden rounded-3xl bg-slate-950">
                <Image
                  src="/products/gaming-pc.svg"
                  alt="Custom computer system"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  ["30", "Products"],
                  ["8", "Categories"],
                  ["Live", "CMS"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-slate-700 bg-slate-950/45 p-3"
                  >
                    <strong className="block text-cyan-300">{value}</strong>
                    <span className="mt-1 block text-[10px] text-slate-500">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface absolute top-0 right-0 rounded-2xl p-4">
              <strong className="block text-sm text-white">Owner Dashboard</strong>
              <span className="mt-1 block text-xs text-slate-500">
                UI preview ready
              </span>
            </div>

            <div className="surface absolute bottom-0 left-0 rounded-2xl p-4">
              <strong className="block text-sm text-white">Supabase Backend</strong>
              <span className="mt-1 block text-xs text-slate-500">
                Auth • Database • Storage
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-800 bg-[#07111f] px-4 py-10">
        <div className="mx-auto grid max-w-[1180px] gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map(([value, label]) => (
            <div key={label} className="surface rounded-2xl p-5">
              <strong className="text-3xl font-black text-cyan-300">{value}</strong>
              <span className="mt-1 block text-xs text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-24">
        <div className="mx-auto max-w-[1180px]">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-black tracking-[0.15em] text-cyan-300 uppercase">
              Structured Catalogue
            </span>
            <h2 className="mt-4 text-balance text-4xl font-black tracking-[-0.045em] text-white sm:text-6xl">
              Every category organised for faster decisions.
            </h2>
            <p className="mt-5 text-slate-400">
              Customers find relevant products faster while the future owner CMS keeps
              catalogue management organised.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category, index) => (
              <Link
                key={category}
                href="/catalogue"
                className="surface focus-ring rounded-3xl p-6 transition hover:-translate-y-1 hover:border-cyan-300/40"
              >
                <span className="grid size-12 place-items-center rounded-2xl bg-cyan-300/10 text-xl font-black text-cyan-300">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 text-lg font-black text-white">{category}</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Searchable products with condition, stock, warranty and direct
                  enquiry actions.
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#07111f] px-4 py-24">
        <div className="mx-auto max-w-[1180px]">
          <div className="max-w-3xl">
            <span className="text-xs font-black tracking-[0.15em] text-cyan-300 uppercase">
              Featured Catalogue
            </span>
            <h2 className="mt-4 text-balance text-4xl font-black tracking-[-0.045em] text-white sm:text-6xl">
              Product cards built for enquiry and comparison.
            </h2>
            <p className="mt-5 text-slate-400">
              Sample products demonstrate the public customer experience while the
              owner dashboard manages the connected catalogue.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-24">
        <div className="mx-auto grid max-w-[1180px] gap-12 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <span className="text-xs font-black tracking-[0.15em] text-cyan-300 uppercase">
              Owner Management
            </span>
            <h2 className="mt-4 text-balance text-4xl font-black tracking-[-0.045em] text-white sm:text-6xl">
              Built around a secure Supabase CMS.
            </h2>
            <p className="mt-5 text-slate-400">
              The public catalogue and protected owner dashboard share one structured
              product system. Owners can manage products, prices, stock and images
              after signing in.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/admin-preview"
                className="focus-ring inline-flex min-h-12 items-center rounded-xl bg-cyan-300 px-5 font-black text-slate-950"
              >
                Open Owner Dashboard
              </Link>
              <a
                href={whatsappUrl(
                  `Hello ${siteConfig.name}, I would like to discuss the Smart Catalogue CMS package.`,
                )}
                target="_blank"
                rel="noreferrer"
                className="focus-ring inline-flex min-h-12 items-center rounded-xl border border-slate-700 px-5 font-black text-white"
              >
                Discuss Package
              </a>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {cmsFeatures.map(([icon, title, copy]) => (
              <div key={title} className="surface rounded-3xl p-6">
                <span className="grid size-12 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-300">
                  <Icon name={icon as "database" | "shield" | "edit" | "upload"} />
                </span>
                <h3 className="mt-5 text-xl font-black text-white">{title}</h3>
                <p className="mt-2 text-sm text-slate-500">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
