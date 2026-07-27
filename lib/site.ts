export const siteConfig = {
  name: "NextGen Computer World",
  tagline: "Smart products. Clear choices. Owner-managed catalogue.",
  phoneDisplay: "+91 83285 71256",
  phoneLink: "+918328571256",
  whatsapp: "918328571256",
  email: "kalayanofficial980@gmail.com",
  location: "Nellore City, Andhra Pradesh",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Nellore+City+Andhra+Pradesh",
  regularPrice: "₹25,000",
  founderPrice: "₹15,000",
} as const;

export function whatsappUrl(message: string) {
  return `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(message)}`;
}
