import type { CSSProperties } from "react";
import { createPublicClient } from "@/lib/supabase/public";

export type SiteSettings = {
  singleton_key: string;
  business_name: string;
  tagline: string;
  short_tagline: string;
  logo_url: string;
  favicon_url: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  panel_color: string;
  text_color: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_highlight: string;
  hero_description: string;
  hero_image_url: string;
  hero_cta_label: string;
  hero_cta_href: string;
  hero_secondary_label: string;
  hero_secondary_href: string;
  announcement_enabled: boolean;
  announcement_text: string;
  phone_display: string;
  phone_link: string;
  whatsapp_number: string;
  email: string;
  owner_email: string;
  location: string;
  maps_url: string;
  working_hours: string;
  updated_at?: string;
};

export const fallbackSiteSettings: SiteSettings = {
  singleton_key: "main",
  business_name: "NextGen Computer World",
  tagline: "Computers, upgrades and technical support you can trust.",
  short_tagline: "Computers • Upgrades • Support",
  logo_url: "",
  favicon_url: "",
  primary_color: "#22d3ee",
  secondary_color: "#2563eb",
  accent_color: "#22c55e",
  background_color: "#050b14",
  panel_color: "#0b1728",
  text_color: "#eff6ff",
  hero_eyebrow: "Computers • Laptops • Upgrades • Support",
  hero_title: "Technology that fits your",
  hero_highlight: "work, study and budget.",
  hero_description:
    "Browse current products, compare key specifications and contact us for availability, recommendations, upgrades and technical support.",
  hero_image_url: "/products/gaming-pc.svg",
  hero_cta_label: "Browse products",
  hero_cta_href: "/catalogue",
  hero_secondary_label: "Ask on WhatsApp",
  hero_secondary_href: "whatsapp",
  announcement_enabled: true,
  announcement_text: "New stock, upgrades and service enquiries are open now.",
  phone_display: "+91 83285 71256",
  phone_link: "+918328571256",
  whatsapp_number: "918328571256",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "kalyanofficial980@gmail.com",
  owner_email: process.env.NEXT_PUBLIC_OWNER_EMAIL || "kalyanofficial980@gmail.com",
  location: "Nellore City, Andhra Pradesh",
  maps_url:
    "https://www.google.com/maps/search/?api=1&query=Nellore+City+Andhra+Pradesh",
  working_hours: "Monday to Saturday, 10:00 AM – 8:00 PM",
};

export const siteConfig = {
  name: fallbackSiteSettings.business_name,
  tagline: fallbackSiteSettings.tagline,
  phoneDisplay: fallbackSiteSettings.phone_display,
  phoneLink: fallbackSiteSettings.phone_link,
  whatsapp: fallbackSiteSettings.whatsapp_number,
  email: fallbackSiteSettings.email,
  ownerEmail: fallbackSiteSettings.owner_email,
  location: fallbackSiteSettings.location,
  mapsUrl: fallbackSiteSettings.maps_url,
} as const;

function asText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

export function normalizeSiteSettings(value: Partial<SiteSettings> | null | undefined): SiteSettings {
  return {
    ...fallbackSiteSettings,
    singleton_key: "main",
    business_name: asText(value?.business_name, fallbackSiteSettings.business_name),
    tagline: asText(value?.tagline, fallbackSiteSettings.tagline),
    short_tagline: asText(value?.short_tagline, fallbackSiteSettings.short_tagline),
    logo_url: asText(value?.logo_url, fallbackSiteSettings.logo_url),
    favicon_url: asText(value?.favicon_url, fallbackSiteSettings.favicon_url),
    primary_color: asText(value?.primary_color, fallbackSiteSettings.primary_color),
    secondary_color: asText(value?.secondary_color, fallbackSiteSettings.secondary_color),
    accent_color: asText(value?.accent_color, fallbackSiteSettings.accent_color),
    background_color: asText(value?.background_color, fallbackSiteSettings.background_color),
    panel_color: asText(value?.panel_color, fallbackSiteSettings.panel_color),
    text_color: asText(value?.text_color, fallbackSiteSettings.text_color),
    hero_eyebrow: asText(value?.hero_eyebrow, fallbackSiteSettings.hero_eyebrow),
    hero_title: asText(value?.hero_title, fallbackSiteSettings.hero_title),
    hero_highlight: asText(value?.hero_highlight, fallbackSiteSettings.hero_highlight),
    hero_description: asText(value?.hero_description, fallbackSiteSettings.hero_description),
    hero_image_url: asText(value?.hero_image_url, fallbackSiteSettings.hero_image_url),
    hero_cta_label: asText(value?.hero_cta_label, fallbackSiteSettings.hero_cta_label),
    hero_cta_href: asText(value?.hero_cta_href, fallbackSiteSettings.hero_cta_href),
    hero_secondary_label: asText(value?.hero_secondary_label, fallbackSiteSettings.hero_secondary_label),
    hero_secondary_href: asText(value?.hero_secondary_href, fallbackSiteSettings.hero_secondary_href),
    announcement_enabled: asBoolean(value?.announcement_enabled, fallbackSiteSettings.announcement_enabled),
    announcement_text: asText(value?.announcement_text, fallbackSiteSettings.announcement_text),
    phone_display: asText(value?.phone_display, fallbackSiteSettings.phone_display),
    phone_link: asText(value?.phone_link, fallbackSiteSettings.phone_link),
    whatsapp_number: asText(value?.whatsapp_number, fallbackSiteSettings.whatsapp_number),
    email: asText(value?.email, fallbackSiteSettings.email),
    owner_email: asText(value?.owner_email, fallbackSiteSettings.owner_email),
    location: asText(value?.location, fallbackSiteSettings.location),
    maps_url: asText(value?.maps_url, fallbackSiteSettings.maps_url),
    working_hours: asText(value?.working_hours, fallbackSiteSettings.working_hours),
    updated_at: value?.updated_at,
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createPublicClient();

  if (!supabase) {
    return fallbackSiteSettings;
  }

  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("singleton_key", "main")
    .maybeSingle();

  if (error || !data) {
    if (error && !error.message.toLowerCase().includes("does not exist")) {
      console.error("Site settings fallback:", error.message);
    }

    return fallbackSiteSettings;
  }

  return normalizeSiteSettings(data as Partial<SiteSettings>);
}

export function whatsappUrl(message: string, settings: SiteSettings = fallbackSiteSettings) {
  const number = settings.whatsapp_number.replace(/[^0-9]/g, "") || fallbackSiteSettings.whatsapp_number;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function themeStyle(settings: SiteSettings): CSSProperties {
  return {
    "--background": settings.background_color,
    "--foreground": settings.text_color,
    "--panel": settings.panel_color,
    "--panel-strong": settings.secondary_color,
    "--line": "rgba(148, 163, 184, 0.22)",
    "--muted": "#91a4bd",
    "--cyan": settings.primary_color,
    "--blue": settings.secondary_color,
    "--emerald": settings.accent_color,
    "--brand-primary": settings.primary_color,
    "--brand-secondary": settings.secondary_color,
    "--brand-accent": settings.accent_color,
    "--brand-panel": settings.panel_color,
  } as CSSProperties;
}
