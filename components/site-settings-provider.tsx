"use client";

import { createContext, useContext } from "react";
import { fallbackSettings } from "@/lib/cms-repository";
import type { BusinessSettings } from "@/lib/cms-types";

const SiteSettingsContext = createContext<BusinessSettings>(fallbackSettings);

export function SiteSettingsProvider({
  settings,
  children,
}: {
  settings: BusinessSettings;
  children: React.ReactNode;
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
