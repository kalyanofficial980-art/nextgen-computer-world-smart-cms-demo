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
    default: `${siteConfig.name} | Smart Catalogue & CMS Demo`,
    template: `%s | ${siteConfig.name}`,
  },
  description:
    "Advanced computer-store catalogue and CMS-ready website demonstration with product search, filters, comparison, enquiries and an admin-dashboard preview.",
  openGraph: {
    title: `${siteConfig.name} | Smart Catalogue & CMS Demo`,
    description:
      "Advanced computer-store catalogue built with Next.js, React, TypeScript and Tailwind CSS.",
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
    <html lang="en">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
