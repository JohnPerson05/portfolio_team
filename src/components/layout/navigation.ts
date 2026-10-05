import { NAVIGATION_DEFAULTS } from "@/server/content/defaults";
import { SETTINGS_REGISTRY } from "@/server/settings/registry";

/**
 * Fallback navigation data for the layout shell.
 *
 * At runtime the navbar, mobile drawer, and footer read the CMS-managed
 * navigation and settings through {@link SiteChromeProvider}. These constants
 * are only the defaults used before the CMS is configured (and in tests).
 */

export interface NavLink {
  readonly label: string;
  readonly href: string;
}

export type SocialLink = NavLink;

export const BRAND_NAME = SETTINGS_REGISTRY["studio.name"].defaultValue;

/** Path to the brand logo mark used across the public shell. */
export const BRAND_LOGO_SRC = "/images/brandlogo.png" as const;

const pick = (location: "HEADER" | "FOOTER"): NavLink[] =>
  NAVIGATION_DEFAULTS.filter((item) => item.location === location).map(
    ({ label, href }) => ({ label, href }),
  );

export const NAV_LINKS: readonly NavLink[] = pick("HEADER");
export const BACKGROUND_LINKS: readonly NavLink[] = pick("FOOTER");

export const PRIMARY_CTA: NavLink = {
  label: SETTINGS_REGISTRY["cta.text"].defaultValue,
  href: SETTINGS_REGISTRY["cta.url"].defaultValue,
};

export const SOCIAL_LINKS: readonly SocialLink[] = [];
