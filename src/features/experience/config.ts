/**
 * Experience timeline configuration + ordering/formatting logic (Task 16).
 *
 * Requirement 5.1: the experience section renders a timeline of career entries
 * (company, position, impact, key achievements). Requirement 5.2 reveals them
 * with attention-guiding motion, and 5.3 collapses the timeline to a single
 * column on mobile.
 *
 * The pure {@link orderExperiences} / {@link formatDateRange} helpers keep the
 * chronological-ordering invariant and the "Present" date wording easily
 * testable and shared between the live data layer and the Server Component.
 */

import type { ExperienceView } from "@/types";

/** Default eyebrow label shown above the section heading. */
export const EXPERIENCE_EYEBROW = "Career";
/** Default section heading. */
export const EXPERIENCE_HEADING = "Experience";

/**
 * Label rendered in place of an end date for a current role (null `endDate`).
 * The "Present" wording is a view-layer concern, so the DTO keeps `endDate`
 * as `null` and this module decides how to render it.
 */
export const PRESENT_LABEL = "Present";
export const PROJECT_EXPERIENCE_LABEL = "Project Experience";

/**
 * Order experience entries chronologically, most-recent-first
 * (Requirement 5.1 — "understand their progression").
 *
 * Primary sort is by `startDate` descending so the newest role leads the
 * timeline, matching résumé convention. A current role (null `endDate`) is
 * already the most recent by virtue of its start date, so no special-casing is
 * needed. Ties on start date fall back to the explicit `order` field ascending,
 * giving the owner a deterministic override. Defensive sorting keeps the
 * invariant even when the caller passes an unordered list (the live query
 * already orders; the unit tests exercise this directly), so re-rendering with
 * the same data is idempotent.
 */
export function orderExperiences(
  experiences: readonly ExperienceView[],
): ExperienceView[] {
  return [...experiences].sort((a, b) => {
    const startDiff =
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    if (startDiff !== 0) return startDiff;
    return a.order - b.order;
  });
}

const MONTH_YEAR_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  // Pin to UTC so a date stored as midnight UTC never renders the previous
  // month in negative-offset timezones.
  timeZone: "UTC",
});

/**
 * Format an ISO-8601 date string as a short "Mon YYYY" label (e.g. "Mar 2022").
 * Invalid input falls back to an empty string so a bad row never throws.
 */
export function formatMonthYear(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return MONTH_YEAR_FORMATTER.format(date);
}

/**
 * Format a role's tenure as a "start — end" range, rendering {@link PRESENT_LABEL}
 * when `endDate` is `null` (a current role). Used both for display and for the
 * entry's accessible date description.
 */
export function formatDateRange(
  startIso: string,
  endIso: string | null,
): string {
  const start = formatMonthYear(startIso);
  const end = endIso === null ? PRESENT_LABEL : formatMonthYear(endIso);
  return `${start} — ${end}`;
}

export function getExperienceDateLabel(entry: ExperienceView): string {
  return entry.company === "GlobalMeet"
    ? PROJECT_EXPERIENCE_LABEL
    : formatDateRange(entry.startDate, entry.endDate);
}
