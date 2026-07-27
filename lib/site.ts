export const siteConfig = {
  name: "NextGen Computer World",
  tagline: "Computers, upgrades and technical support you can trust.",
  phoneDisplay: "+91 83285 71256",
  phoneLink: "+918328571256",
  whatsapp: "918328571256",
  email:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL || "kalyanofficial980@gmail.com",
  ownerEmail:
    process.env.NEXT_PUBLIC_OWNER_EMAIL || "kalyanofficial980@gmail.com",
  location: "Nellore City, Andhra Pradesh",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Nellore+City+Andhra+Pradesh",
} as const;

export function whatsappUrl(message: string) {
  return `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(message)}`;
}