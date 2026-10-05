"use client";

import { createContext, useContext, type ReactNode } from "react";

import {
  BRAND_NAME,
  NAV_LINKS,
  PRIMARY_CTA,
  type NavLink,
} from "./navigation";

/**
 * CMS-driven values the client-side shell (navbar, mobile drawer, loading
 * screen) needs. Provided once by the public layout from the database; the
 * defaults keep components usable without a provider (tests, error pages).
 */
export interface SiteChrome {
  studioName: string;
  headerLinks: readonly NavLink[];
  cta: NavLink;
}

const SiteChromeContext = createContext<SiteChrome>({
  studioName: BRAND_NAME,
  headerLinks: NAV_LINKS,
  cta: PRIMARY_CTA,
});

export function SiteChromeProvider({
  value,
  children,
}: {
  value: SiteChrome;
  children: ReactNode;
}) {
  return (
    <SiteChromeContext.Provider value={value}>
      {children}
    </SiteChromeContext.Provider>
  );
}

export function useSiteChrome(): SiteChrome {
  return useContext(SiteChromeContext);
}
