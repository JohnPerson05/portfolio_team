/**
 * Hero content types. Values come from CMS settings (`hero.*`) — see
 * `heroContentFromSettings`.
 */
import type { SiteSettings } from "@/server/settings/registry";
import { defaultSettings } from "@/server/settings/registry";

export interface HeroLink {
  readonly label: string;
  readonly href: string;
}

export interface HeroCta {
  readonly label: string;
  readonly href: string;
}

export interface HeroContent {
  readonly eyebrow: string;
  readonly headline: string;
  readonly headlineAccent: string;
  readonly supporting: string;
  readonly primaryCta: HeroCta;
  readonly secondaryCta: HeroCta;
  readonly availability: string;
  readonly links: readonly HeroLink[];
  readonly outcomes: readonly string[];
}

export function heroContentFromSettings(
  settings: SiteSettings,
  links: readonly HeroLink[] = [],
): HeroContent {
  return {
    eyebrow: settings["hero.eyebrow"],
    headline: settings["hero.title"],
    headlineAccent: settings["hero.titleAccent"],
    supporting: settings["hero.subtitle"],
    primaryCta: {
      label: settings["hero.primaryCtaLabel"],
      href: settings["hero.primaryCtaUrl"],
    },
    secondaryCta: {
      label: settings["hero.secondaryCtaLabel"],
      href: settings["hero.secondaryCtaUrl"],
    },
    availability: settings["hero.availability"],
    links,
    outcomes: settings["hero.outcomes"],
  };
}

/** Defaults (used by tests and as a fallback). */
export const HERO_CONTENT: HeroContent = heroContentFromSettings(defaultSettings());
