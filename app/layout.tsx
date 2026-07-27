import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "@/app/globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteSettingsProvider } from "@/components/site-settings-provider";
import {
  getBusinessSettings,
  themeStyle,
} from "@/lib/cms-repository";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getBusinessSettings();
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    metadataBase: new URL(base),
    title: {
      default: `${settings.business_name} | Computers, Laptops & Support`,
      template: `%s | ${settings.business_name}`,
    },
    description: settings.description,
    icons: settings.favicon_url
      ? { icon: settings.favicon_url, shortcut: settings.favicon_url }
      : undefined,
    verification: settings.search_console_verification
      ? { google: settings.search_console_verification }
      : undefined,
    openGraph: {
      title: `${settings.business_name} | Computers, Laptops & Support`,
      description: settings.description,
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const settings = await getBusinessSettings();
  return { themeColor: settings.background_color };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getBusinessSettings();
  const style = themeStyle(settings) as React.CSSProperties;
  const analyticsId = /^G-[A-Z0-9]+$/i.test(settings.google_analytics_id)
    ? settings.google_analytics_id
    : "";
  const pixelId = /^\d{5,30}$/.test(settings.meta_pixel_id)
    ? settings.meta_pixel_id
    : "";

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body style={style}>
        <SiteSettingsProvider settings={settings}>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </SiteSettingsProvider>

        {analyticsId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${analyticsId}');`}
            </Script>
          </>
        )}

        {pixelId && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`}
          </Script>
        )}
      </body>
    </html>
  );
}
