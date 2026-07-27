import { fallbackSettings, whatsappUrl as buildWhatsappUrl } from "@/lib/cms-repository";

export const siteConfig = {
  name: fallbackSettings.business_name,
  tagline: fallbackSettings.tagline,
  phoneDisplay: fallbackSettings.phone_display,
  phoneLink: fallbackSettings.phone_link,
  whatsapp: fallbackSettings.whatsapp_number,
  email: fallbackSettings.contact_email,
  ownerEmail: fallbackSettings.owner_email,
  location: fallbackSettings.address_line,
  mapsUrl: fallbackSettings.map_url,
} as const;

export function whatsappUrl(message: string) {
  return buildWhatsappUrl(fallbackSettings, message);
}
