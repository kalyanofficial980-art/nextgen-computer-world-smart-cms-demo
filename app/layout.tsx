import type { Metadata } from "next";
import "@/app/globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: `${siteConfig.name} | Computers, Laptops & Support`,
    template: `%s | ${siteConfig.name}`,
  },
  description:
    "Browse computers, laptops, custom PCs, printers, networking products and upgrades from NextGen Computer World in Nellore.",
  openGraph: {
    title: `${siteConfig.name} | Computers, Laptops & Support`,
    description:
      "Browse products, compare specifications and contact NextGen Computer World for current availability.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}