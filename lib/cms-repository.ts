import { createPublicClient } from "@/lib/supabase/public";
import type {
  BusinessSettings,
  Faq,
  HomepageSection,
  LegalPage,
  MediaItem,
  Offer,
  PublicBusinessStats,
  PublicSale,
  Review,
} from "@/lib/cms-types";

export const fallbackSettings: BusinessSettings = {
  id: 1,
  business_name: "NextGen Computer World",
  short_name: "NG",
  tagline: "Computers, upgrades and technical support you can trust.",
  description:
    "Computers, laptops, upgrades, networking products and practical technical support.",
  phone_display: "+91 83285 71256",
  phone_link: "+918328571256",
  whatsapp_number: "918328571256",
  contact_email: "kalyanofficial980@gmail.com",
  owner_email: "kalyanofficial980@gmail.com",
  address_line: "Nellore City, Andhra Pradesh",
  map_url:
    "https://www.google.com/maps/search/?api=1&query=Nellore+City+Andhra+Pradesh",
  working_hours: "Monday–Saturday, 9:30 AM–8:00 PM",
  gst_number: "",
  registration_number: "",
  service_areas: ["Nellore"],
  logo_url: "",
  logo_dark_url: "",
  favicon_url: "",
  hero_image_url: "/products/gaming-pc.svg",
  hero_badge: "Computers • Laptops • Upgrades • Support",
  hero_title: "Technology that fits your work, study and budget.",
  hero_description:
    "Browse current products, compare specifications and contact us for availability, recommendations, upgrades and technical support.",
  primary_color: "#22d3ee",
  secondary_color: "#2563eb",
  accent_color: "#22c55e",
  background_color: "#050b14",
  panel_color: "#0b1728",
  text_color: "#eff6ff",
  announcement_active: false,
  announcement_text: "",
  announcement_link: "",
  youtube_url: "",
  instagram_url: "",
  facebook_url: "",
  google_business_url: "",
  google_analytics_id: "",
  meta_pixel_id: "",
  search_console_verification: "",
  show_public_sales_stats: true,
  show_recent_sales: true,
};

export const fallbackSections: HomepageSection[] = [
  ["hero", "Technology for work, study and business", "Browse current products and get direct guidance.", true, 10],
  ["offers", "Current offers", "Limited-time promotions and value bundles.", true, 30],
  ["categories", "Shop by category", "Find the right product faster.", true, 40],
  ["featured_products", "Featured products", "Popular options worth comparing.", true, 50],
  ["new_arrivals", "New arrivals", "Recently added products and configurations.", true, 60],
  ["best_sellers", "Best sellers", "Frequently selected products.", true, 70],
  ["media", "Videos and reels", "Product showcases, setup tips and updates.", true, 80],
  ["reviews", "Customer reviews", "Feedback from customers we have served.", true, 90],
  ["sales_stats", "Business activity", "Products and customers served.", true, 100],
  ["recent_sales", "Recently sold", "Recent anonymised sales activity.", true, 110],
  ["services", "Technical services", "Product sales backed by practical support.", true, 120],
  ["faq", "Frequently asked questions", "Helpful answers before you contact us.", true, 130],
  ["contact_cta", "Need help choosing?", "Share your budget and intended use.", true, 140],
].map(([section_key, title, subtitle, enabled, sort_order]) => ({
  section_key: String(section_key),
  title: String(title),
  subtitle: String(subtitle),
  enabled: Boolean(enabled),
  sort_order: Number(sort_order),
}));

export function whatsappUrl(settings: BusinessSettings, message: string) {
  return `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(message)}`;
}

export function themeStyle(settings: BusinessSettings): Record<string, string> {
  return {
    "--background": settings.background_color,
    "--foreground": settings.text_color,
    "--panel": settings.panel_color,
    "--primary": settings.primary_color,
    "--secondary": settings.secondary_color,
    "--accent": settings.accent_color,
  };
}

export async function getBusinessSettings(): Promise<BusinessSettings> {
  const supabase = createPublicClient();
  if (!supabase) return fallbackSettings;

  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("Site settings fallback:", error.message);
    return fallbackSettings;
  }

  return { ...fallbackSettings, ...(data as BusinessSettings) };
}

export async function getHomepageSections(): Promise<HomepageSection[]> {
  const supabase = createPublicClient();
  if (!supabase) return fallbackSections;

  const { data, error } = await supabase
    .from("homepage_sections")
    .select("section_key,title,subtitle,enabled,sort_order")
    .order("sort_order");

  if (error || !data?.length) {
    if (error) console.error("Homepage sections fallback:", error.message);
    return fallbackSections;
  }

  return data as HomepageSection[];
}

export async function getActiveOffers(limit = 24): Promise<Offer[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("active", true)
    .order("featured", { ascending: false })
    .order("sort_order")
    .limit(limit);

  if (error) {
    console.error("Offers fallback:", error.message);
    return [];
  }

  return (data ?? []) as Offer[];
}

export async function getPublishedReviews(limit = 100): Promise<Review[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("sort_order")
    .limit(limit);

  if (error) {
    console.error("Reviews fallback:", error.message);
    return [];
  }

  return (data ?? []) as Review[];
}

export async function getPublishedMedia(options: { homepageOnly?: boolean; limit?: number } = {}): Promise<MediaItem[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];

  let query = supabase
    .from("media_items")
    .select("*")
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("sort_order")
    .limit(options.limit ?? 100);

  if (options.homepageOnly ?? false) {
    query = query.eq("show_on_homepage", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Media fallback:", error.message);
    return [];
  }

  return (data ?? []) as MediaItem[];
}

export async function getFaqs(): Promise<Faq[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .eq("active", true)
    .order("sort_order")
    .limit(20);

  if (error) {
    console.error("FAQ fallback:", error.message);
    return [];
  }

  return (data ?? []) as Faq[];
}

export async function getPublicBusinessStats(): Promise<PublicBusinessStats> {
  const supabase = createPublicClient();
  const fallback: PublicBusinessStats = {
    total_products: 0,
    total_units_sold: 0,
    total_reviews: 0,
    average_rating: 0,
  };

  if (!supabase) return fallback;

  const { data, error } = await supabase.rpc("get_public_business_stats");

  if (error || !data?.length) {
    if (error) console.error("Business stats fallback:", error.message);
    return fallback;
  }

  const row = data[0] as Record<string, number | string>;
  return {
    total_products: Number(row.total_products ?? 0),
    total_units_sold: Number(row.total_units_sold ?? 0),
    total_reviews: Number(row.total_reviews ?? 0),
    average_rating: Number(row.average_rating ?? 0),
  };
}

export async function getRecentPublicSales(): Promise<PublicSale[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];

  const { data, error } = await supabase.rpc("get_recent_public_sales", {
    p_limit: 6,
  });

  if (error) {
    console.error("Recent sales fallback:", error.message);
    return [];
  }

  return (data ?? []) as PublicSale[];
}

export async function getLegalPage(
  key: LegalPage["page_key"],
): Promise<LegalPage | null> {
  const supabase = createPublicClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("legal_pages")
    .select("*")
    .eq("page_key", key)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.error("Legal page fallback:", error.message);
    return null;
  }

  return (data as LegalPage | null) ?? null;
}
