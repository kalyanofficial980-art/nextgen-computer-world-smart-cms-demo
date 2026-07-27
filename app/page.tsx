import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { ProductCard } from "@/components/product-card";
import { productRepository } from "@/lib/product-repository";
import { siteConfig, whatsappUrl } from "@/lib/site";

const services = [
  ["edit", "Laptop & desktop repair", "Diagnostics, upgrades and practical repair support."],
  ["chart", "RAM & SSD upgrades", "Compatibility checks and performance-focused upgrades."],
  ["shield", "Networking setup", "Router, Wi-Fi and small-office network support."],
  ["users", "Custom PC planning", "Systems planned for gaming, work, editing and business use."],
] as const;

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await productRepository.list();
  const categories = [...new Set(products.map((product) => product.category))].sort();
  const featured = products.filter((product) => product.featured).slice(0, 6);

  return (
    <>
      <section className="grid-fade overflow-hidden px-4 py-16 sm:py-24">
        <div className="mx-auto grid max-w-[1180px] items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <span className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/7 px-3 py-2 text-xs font-black tracking-[0.13em] text-cyan-300 uppercase">
              Computers • Laptops • Upgrades • Support
            </span>
            <h1 className="mt-6 text-balance text-4xl leading-[1.02] font-black tracking-[-0.055em] text-white sm:text-6xl">
              Technology that fits your{" "}
              <span className="text-cyan-300">work, study and budget.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-400">
              Browse current products, compare key specifications and contact us for
              availability, recommendations, upgrades and technical support.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/catalogue"
                className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl bg-cyan-300 px-5 font-black text-slate-950"
              >
                Browse {products.length} products
                <Icon name="arrow" />
              </Link>
              <a
                href={whatsappUrl(
                  `Hello ${siteConfig.name}, I need help choosing a computer product.`,
                )}
                target="_blank"
                rel="noreferrer"
                className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/55 px-5 font-black text-white"
              >
                <Icon name="whatsapp" className="size-4" />
                Ask on WhatsApp
              </a>
            </div>

            <div className="mt-7 flex flex-wrap gap-5 text-sm font-bold text-slate-300">
              {["Clear product details", "Specification comparison", "Direct support"].map(
                (item) => (
                  <span key={item} className="flex items-center gap-2">
                    <Icon name="check" className="size-4 text-emerald-300" />
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="surface overflow-hidden rounded-[2rem] p-5">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Featured system</span>
              <span className="text-emerald-300">● Enquiries open</span>
            </div>
            <div className="relative mt-5 h-72 overflow-hidden rounded-3xl bg-slate-950">
              <Image
                src="/products/gaming-pc.svg"
                alt="Desktop computer system"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                [String(products.length), "Products"],
                [String(categories.length), "Categories"],
                ["Direct", "WhatsApp"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-slate-700 bg-slate-950/45 p-3"
                >
                  <strong className="block text-cyan-300">{value}</strong>
                  <span className="mt-1 block text-[10px] text-slate-500">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-800 bg-[#07111f] px-4 py-12">
        <div className="mx-auto max-w-[1180px]">
          <div className="max-w-2xl">
            <span className="text-xs font-black tracking-[0.15em] text-cyan-300 uppercase">
              Shop by category
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
              Find the right product faster.
            </h2>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category}
                href={`/catalogue?category=${encodeURIComponent(category)}`}
                className="surface focus-ring rounded-2xl p-5 transition hover:-translate-y-1 hover:border-cyan-300/40"
              >
                <h3 className="font-black text-white">{category}</h3>
                <p className="mt-2 text-sm text-slate-500">
                  View products, stock, warranty and current pricing.
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto max-w-[1180px]">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <span className="text-xs font-black tracking-[0.15em] text-cyan-300 uppercase">
                Featured products
              </span>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl">
                Popular options worth comparing.
              </h2>
            </div>
            <Link href="/catalogue" className="font-bold text-cyan-300">
              View full catalogue →
            </Link>
          </div>

          <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#07111f] px-4 py-20">
        <div className="mx-auto max-w-[1180px]">
          <div className="max-w-2xl">
            <span className="text-xs font-black tracking-[0.15em] text-cyan-300 uppercase">
              Technical services
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl">
              Product sales backed by practical support.
            </h2>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map(([icon, title, copy]) => (
              <article key={title} className="surface rounded-3xl p-6">
                <Icon
                  name={icon as "edit" | "chart" | "shield" | "users"}
                  className="size-6 text-cyan-300"
                />
                <h3 className="mt-5 text-lg font-black text-white">{title}</h3>
                <p className="mt-2 text-sm text-slate-500">{copy}</p>
              </article>
            ))}
          </div>

          <Link
            href="/services"
            className="focus-ring mt-8 inline-flex min-h-12 items-center rounded-xl border border-slate-700 px-5 font-black text-white"
          >
            View services
          </Link>
        </div>
      </section>
    </>
  );
}