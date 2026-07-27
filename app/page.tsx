import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { MediaShowcase } from "@/components/home/media-showcase";
import { ProductCard } from "@/components/product-card";
import {
  getActiveOffers,
  getBusinessSettings,
  getFaqs,
  getHomepageSections,
  getPublishedMedia,
  getPublishedReviews,
  getPublicBusinessStats,
  getRecentPublicSales,
  whatsappUrl,
} from "@/lib/cms-repository";
import { productRepository } from "@/lib/product-repository";

const services = [
  ["edit", "Laptop & desktop repair", "Diagnostics, upgrades and practical repair support."],
  ["chart", "RAM & SSD upgrades", "Compatibility checks and performance-focused upgrades."],
  ["shield", "Networking setup", "Router, Wi-Fi and small-office network support."],
  ["users", "Custom PC planning", "Systems planned for gaming, work, editing and business use."],
] as const;

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [
    products,
    settings,
    sections,
    offers,
    reviews,
    media,
    stats,
    recentSales,
    faqs,
  ] = await Promise.all([
    productRepository.list(),
    getBusinessSettings(),
    getHomepageSections(),
    getActiveOffers(8),
    getPublishedReviews(12),
    getPublishedMedia({ homepageOnly: true, limit: 8 }),
    getPublicBusinessStats(),
    getRecentPublicSales(),
    getFaqs(),
  ]);

  const categories = [...new Set(products.map((product) => product.category))].sort();
  const featured = products.filter((product) => product.featured).slice(0, 6);
  const newArrivals = products.filter((product) => product.newArrival).slice(0, 6);
  const bestSellers = products.filter((product) => product.bestSeller).slice(0, 6);
  const enabledSections = sections.filter((section) => section.enabled).sort((a, b) => a.sort_order - b.sort_order);
  const sectionMap = new Map(sections.map((section) => [section.section_key, section]));

  function heading(key: string, fallbackTitle: string, fallbackSubtitle = "") {
    const section = sectionMap.get(key);
    return {
      title: section?.title || fallbackTitle,
      subtitle: section?.subtitle || fallbackSubtitle,
    };
  }

  const renderSection = (key: string) => {
    if (key === "hero") {
      return (
        <section key={key} className="grid-fade overflow-hidden px-4 py-16 sm:py-24">
          <div className="mx-auto grid max-w-[1320px] items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
            <div>
              <span className="theme-soft theme-text inline-flex rounded-full border px-3 py-2 text-xs font-black tracking-[0.13em] uppercase">
                {settings.hero_badge}
              </span>
              <h1 className="mt-6 text-balance text-4xl leading-[1.02] font-black tracking-[-0.055em] text-white sm:text-6xl">
                {settings.hero_title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-slate-400">{settings.hero_description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/catalogue" className="theme-bg focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl px-5 font-black">
                  Browse {products.length} products
                  <Icon name="arrow" />
                </Link>
                <a
                  href={whatsappUrl(settings, `Hello ${settings.business_name}, I need help choosing a computer product.`)}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/55 px-5 font-black text-white"
                >
                  <Icon name="whatsapp" className="size-4" />
                  Ask on WhatsApp
                </a>
              </div>
              <div className="mt-7 flex flex-wrap gap-5 text-sm font-bold text-slate-300">
                {["Clear product details", "Specification comparison", "Direct support"].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <Icon name="check" className="size-4" style={{ color: "var(--accent)" }} />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="surface overflow-hidden rounded-[2rem] p-5">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Featured system</span>
                <span style={{ color: "var(--accent)" }}>● Enquiries open</span>
              </div>
              <div className="relative mt-5 h-72 overflow-hidden rounded-3xl bg-slate-950">
                <Image
                  src={settings.hero_image_url || "/products/gaming-pc.svg"}
                  alt={`${settings.business_name} featured products`}
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
                  [String(stats.total_units_sold), "Units sold"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl border border-slate-700 bg-slate-950/45 p-3">
                    <strong className="theme-text block">{value}</strong>
                    <span className="mt-1 block text-[10px] text-slate-500">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      );
    }

    if (key === "offers") {
      if (!offers.length) return null;
      const copy = heading(key, "Current offers", "Limited-time promotions and value bundles.");
      return (
        <section key={key} className="px-4 py-20">
          <div className="mx-auto max-w-[1320px]">
            <SectionHeading title={copy.title} subtitle={copy.subtitle} link="/offers" />
            <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {offers.slice(0, 6).map((offer) => (
                <article key={offer.id} className="surface overflow-hidden rounded-3xl">
                  {offer.image_url && (
                    <div className="relative h-52 bg-slate-950">
                      <Image src={offer.image_url} alt={offer.title} fill sizes="(max-width:768px) 100vw,33vw" className="object-cover" />
                    </div>
                  )}
                  <div className="p-6">
                    {offer.discount_label && <span className="theme-soft theme-text inline-flex rounded-full border px-3 py-1.5 text-xs font-black">{offer.discount_label}</span>}
                    <h3 className="mt-4 text-2xl font-black text-white">{offer.title}</h3>
                    <p className="mt-2 text-sm text-slate-500">{offer.description}</p>
                    {offer.coupon_code && <p className="mt-4 text-xs font-black text-slate-300">Code: <span className="theme-text">{offer.coupon_code}</span></p>}
                    <Link href={offer.button_link || "/catalogue"} className="theme-bg focus-ring mt-5 inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-black">
                      {offer.button_label || "View offer"}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (key === "categories") {
      const copy = heading(key, "Shop by category", "Find the right product faster.");
      return (
        <section key={key} className="border-y border-slate-800 bg-[#07111f] px-4 py-16">
          <div className="mx-auto max-w-[1320px]">
            <SectionHeading title={copy.title} subtitle={copy.subtitle} />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => (
                <Link key={category} href={`/catalogue?category=${encodeURIComponent(category)}`} className="surface focus-ring rounded-2xl p-5 transition hover:-translate-y-1 theme-border">
                  <h3 className="font-black text-white">{category}</h3>
                  <p className="mt-2 text-sm text-slate-500">View products, stock, warranty and current pricing.</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      );
    }

    const productGroups: Record<string, { products: typeof products; title: string; subtitle: string }> = {
      featured_products: { products: featured, title: "Featured products", subtitle: "Popular options worth comparing." },
      new_arrivals: { products: newArrivals, title: "New arrivals", subtitle: "Recently added products and configurations." },
      best_sellers: { products: bestSellers, title: "Best sellers", subtitle: "Frequently selected products." },
    };

    if (key in productGroups) {
      const group = productGroups[key];
      if (!group.products.length) return null;
      const copy = heading(key, group.title, group.subtitle);
      return (
        <section key={key} className="px-4 py-20">
          <div className="mx-auto max-w-[1320px]">
            <SectionHeading title={copy.title} subtitle={copy.subtitle} link="/catalogue" />
            <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {group.products.map((product) => <ProductCard key={product.slug} product={product} />)}
            </div>
          </div>
        </section>
      );
    }

    if (key === "media") {
      if (!media.length) return null;
      const copy = heading(key, "Videos and reels", "Product showcases, setup tips and updates.");
      return (
        <section key={key} className="bg-[#07111f] px-4 py-20">
          <div className="mx-auto max-w-[1320px]">
            <SectionHeading title={copy.title} subtitle={copy.subtitle} />
            <div className="mt-9"><MediaShowcase items={media.slice(0, 6)} /></div>
          </div>
        </section>
      );
    }

    if (key === "reviews") {
      if (!reviews.length) return null;
      const copy = heading(key, "Customer reviews", "Feedback from customers we have served.");
      return (
        <section key={key} className="px-4 py-20">
          <div className="mx-auto max-w-[1320px]">
            <SectionHeading title={copy.title} subtitle={copy.subtitle} link="/reviews" />
            <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {reviews.slice(0, 6).map((review) => (
                <article key={review.id} className="surface rounded-3xl p-6">
                  <div className="flex items-center gap-3">
                    {review.image_url ? (
                      <span className="relative block size-12 shrink-0 overflow-hidden rounded-full border border-slate-700 bg-slate-950">
                        <Image src={review.image_url} alt={`${review.customer_name} review`} fill sizes="48px" className="object-cover" />
                      </span>
                    ) : (
                      <span className="theme-soft theme-text grid size-12 shrink-0 place-items-center rounded-full border text-sm font-black">
                        {review.customer_name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    <div className="theme-text text-lg tracking-wider">{"★".repeat(review.rating)}<span className="text-slate-700">{"★".repeat(5 - review.rating)}</span></div>
                  </div>
                  <p className="mt-4 text-slate-300">“{review.review_text}”</p>
                  <div className="mt-5 border-t border-slate-700 pt-4">
                    <strong className="text-white">{review.customer_name}</strong>
                    <p className="mt-1 text-xs text-slate-500">{[review.customer_city, review.product_or_service, review.verified_customer ? "Verified customer" : ""].filter(Boolean).join(" • ")}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (key === "sales_stats") {
      if (!settings.show_public_sales_stats) return null;
      const copy = heading(key, "Business activity", "Products and customers served.");
      const statCards = [
        [String(products.length), "Current products"],
        [String(stats.total_units_sold), "Units sold"],
        [String(stats.total_reviews), "Published reviews"],
        [stats.average_rating ? `${stats.average_rating}/5` : "New", "Average rating"],
      ];
      return (
        <section key={key} className="px-4 py-16">
          <div className="mx-auto max-w-[1320px]">
            <SectionHeading title={copy.title} subtitle={copy.subtitle} />
            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {statCards.map(([value, label]) => (
                <div key={label} className="surface rounded-3xl p-6 text-center">
                  <strong className="theme-text text-3xl font-black sm:text-4xl">{value}</strong>
                  <span className="mt-2 block text-xs font-bold text-slate-500">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (key === "recent_sales") {
      if (!settings.show_recent_sales || !recentSales.length) return null;
      const copy = heading(key, "Recently sold", "Recent anonymised sales activity.");
      return (
        <section key={key} className="bg-[#07111f] px-4 py-16">
          <div className="mx-auto max-w-[1320px]">
            <SectionHeading title={copy.title} subtitle={copy.subtitle} />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentSales.map((sale, index) => (
                <article key={`${sale.product_name}-${sale.sold_at}-${index}`} className="surface rounded-2xl p-5">
                  <span className="theme-text text-xs font-black uppercase">Sold</span>
                  <h3 className="mt-2 font-black text-white">{sale.product_name}</h3>
                  <p className="mt-2 text-sm text-slate-500">{sale.quantity} unit{sale.quantity === 1 ? "" : "s"}{sale.customer_city ? ` • ${sale.customer_city}` : ""}</p>
                  {sale.public_note && <p className="mt-3 text-xs text-slate-400">{sale.public_note}</p>}
                </article>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (key === "services") {
      const copy = heading(key, "Technical services", "Product sales backed by practical support.");
      return (
        <section key={key} className="px-4 py-20">
          <div className="mx-auto max-w-[1320px]">
            <SectionHeading title={copy.title} subtitle={copy.subtitle} link="/services" />
            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {services.map(([icon, title, description]) => (
                <article key={title} className="surface rounded-3xl p-6">
                  <Icon name={icon} className="theme-text size-6" />
                  <h3 className="mt-5 text-lg font-black text-white">{title}</h3>
                  <p className="mt-2 text-sm text-slate-500">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (key === "faq") {
      if (!faqs.length) return null;
      const copy = heading(key, "Frequently asked questions", "Helpful answers before you contact us.");
      return (
        <section key={key} className="bg-[#07111f] px-4 py-20">
          <div className="mx-auto max-w-4xl">
            <SectionHeading title={copy.title} subtitle={copy.subtitle} />
            <div className="mt-8 grid gap-3">
              {faqs.map((faq) => (
                <details key={faq.id} className="surface rounded-2xl p-5">
                  <summary className="cursor-pointer font-black text-white">{faq.question}</summary>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (key === "contact_cta") {
      const copy = heading(key, "Need help choosing?", "Share your budget and intended use.");
      return (
        <section key={key} className="px-4 py-20">
          <div className="theme-gradient mx-auto max-w-[1100px] rounded-[2rem] p-8 text-center text-slate-950 sm:p-12">
            <h2 className="text-3xl font-black tracking-[-0.04em] sm:text-5xl">{copy.title}</h2>
            <p className="mx-auto mt-4 max-w-2xl opacity-80">{copy.subtitle}</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <a href={whatsappUrl(settings, `Hello ${settings.business_name}, please recommend a product for my budget and requirement.`)} target="_blank" rel="noreferrer" className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl bg-slate-950 px-5 font-black text-white"><Icon name="whatsapp" /> WhatsApp</a>
              <Link href="/contact" className="focus-ring inline-flex min-h-12 items-center rounded-xl border border-slate-950/20 bg-white/80 px-5 font-black">Send enquiry</Link>
            </div>
          </div>
        </section>
      );
    }

    return null;
  };

  return <>{enabledSections.map((section) => renderSection(section.section_key))}</>;
}

function SectionHeading({ title, subtitle, link }: { title: string; subtitle: string; link?: string }) {
  return (
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div className="max-w-3xl">
        <h2 className="text-3xl font-black tracking-[-0.04em] text-white sm:text-5xl">{title}</h2>
        {subtitle && <p className="mt-3 text-slate-500">{subtitle}</p>}
      </div>
      {link && <Link href={link} className="theme-text font-bold">View all →</Link>}
    </div>
  );
}
