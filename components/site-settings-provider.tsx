"use client";

import { createContext, useContext, type ReactNode } from "react";
import { fallbackSiteSettings, type SiteSettings, whatsappUrl } from "@/lib/site";

const SiteSettingsContext = createContext<SiteSettings>(fallbackSiteSettings);

export function SiteSettingsProvider({
  settings,
  children,
}: {
  settings: SiteSettings;
  children: ReactNode;
}) {
  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}

export function useWhatsAppUrl(message: string) {
  const settings = useSiteSettings();
  return whatsappUrl(message, settings);
}
