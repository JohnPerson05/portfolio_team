import {
  SETTINGS_REGISTRY,
  type SettingStat,
} from "@/server/settings/registry";

/**
 * Trust / Stats section content + types (Task 13).
 *
 * The trust section is driven by a small, typed configuration array so the
 * quantified credibility signals live in one place and are trivial to edit.
 * The shape intentionally mirrors what a future CMS-backed source (e.g. a
 * `SiteStats` record or a `siteStats` config table) would provide, so the
 * section can later be fed from the database without changing its props.
 *
 * Requirements: 2.1 (the five metrics: Years of Experience, Projects
 * Completed, Technologies, Certifications, Awards), 2.2 (each renders an
 * animated counter to its final value).
 */

/** A single quantified credibility metric rendered as a label + counter. */
export interface TrustStat {
  /**
   * Stable identifier used as the React key (and a future CMS primary key).
   * Lowercase, hyphen-free slug.
   */
  readonly id: string;
  /** Human-readable label shown beneath the value (e.g. "Years of Experience"). */
  readonly label: string;
  /** Final value the {@link Counter} counts up to. */
  readonly value: number;
  /**
   * Optional text appended after the number (e.g. "+"). Used for "at least"
   * style figures such as `8+` years or `50+` projects.
   */
  readonly suffix?: string;
}

/** Map the `home.stats` setting onto the section's stat shape. */
export function toTrustStats(stats: readonly SettingStat[]): TrustStat[] {
  return stats.map((stat, index) => ({
    id: `stat-${index}`,
    label: stat.label,
    value: stat.value,
    suffix: stat.suffix || undefined,
  }));
}

/** Defaults (the `home.stats` setting's default value). */
export const TRUST_STATS: readonly TrustStat[] = toTrustStats(
  SETTINGS_REGISTRY["home.stats"].defaultValue,
);
