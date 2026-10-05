/**
 * Hero content + types.
 *
 * The hero copy is sourced from the studio config (`features/studio/config.ts`)
 * so the brand statement lives in one place. Props on {@link Hero} can still
 * override any field (e.g. for experiments or a future CMS source).
 */
import { HERO, STUDIO } from "@/features/studio/config";

/** A secondary link rendered beneath the hero CTAs (e.g. LinkedIn). */
export interface HeroLink {
  readonly label: string;
  readonly href: string;
}

export interface HeroCta {
  readonly label: string;
  readonly href: string;
}

/** The complete, resolved content the hero renders. */
export interface HeroContent {
  /** Small label above the headline. */
  readonly eyebrow: string;
  /** First part of the `<h1>` statement. */
  readonly headline: string;
  /** Highlighted second part of the `<h1>` statement. */
  readonly headlineAccent: string;
  /** Supporting paragraph beneath the headline. */
  readonly supporting: string;
  readonly primaryCta: HeroCta;
  readonly secondaryCta: HeroCta;
  /** Availability note shown in the status pill. */
  readonly availability: string;
  /** Optional secondary links (studio social profiles, etc.). */
  readonly links: readonly HeroLink[];
}

export const HERO_CONTENT: HeroContent = {
  eyebrow: HERO.eyebrow,
  headline: HERO.headline,
  headlineAccent: HERO.headlineAccent,
  supporting: HERO.supporting,
  primaryCta: HERO.primaryCta,
  secondaryCta: HERO.secondaryCta,
  availability: HERO.availability,
  links: STUDIO.links,
};
