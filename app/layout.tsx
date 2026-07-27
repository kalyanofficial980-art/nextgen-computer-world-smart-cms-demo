import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/app/globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteSettingsProvider } from "@/components/site-settings-provider";
import { getSiteSettings, themeStyle } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    ),
    title: {
      default: `${settings.business_name} | Computers, Laptops & Support`,
      template: `%s | ${settings.business_name}`,
    },
    description: settings.tagline,
    openGraph: {
      title: `${settings.business_name} | Computers, Laptops & Support`,
      description: settings.hero_description,
      type: "website",
      images: settings.hero_image_url ? [settings.hero_image_url] : undefined,
    },
    icons: settings.favicon_url ? { icon: settings.favicon_url } : undefined,
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const settings = await getSiteSettings();

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body style={themeStyle(settings)}>
        <SiteSettingsProvider settings={settings}>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
