/**
 * Blog section configuration + selection logic (Task 18).
 *
 * Requirement 7.1 / Correctness Property 10: public blog views surface the
 * latest published posts, ordered most-recent-first by `publishedAt`. The
 * recency ordering and the preview cap are enforced here in the pure
 * {@link sortByRecency} / {@link selectLatest} helpers (easily unit-tested and
 * shared between the live data layer and the Server Components), mirroring the
 * `selectFeatured` pattern used by the projects section.
 *
 * Note: the published-only invariant (Property 3 / Requirement 7.4) is enforced
 * one layer down, in `data.ts`, where every query filters `status = PUBLISHED`.
 * The {@link PostView} DTO consumed here is already the published projection
 * (it carries no `DRAFT` status), so these helpers only concern ordering and
 * count.
 */

import type { PostView } from "@/types";

/** Number of latest articles shown in the homepage preview (Requirement 7.1). */
export const BLOG_PREVIEW_LIMIT = 3;

/** Default eyebrow label shown above the homepage preview heading. */
export const BLOG_PREVIEW_EYEBROW = "Writing";
/** Default homepage preview heading. */
export const BLOG_PREVIEW_HEADING = "Latest Articles";

/** Default eyebrow label shown above the full listing heading. */
export const BLOG_LISTING_EYEBROW = "Writing";
/** Default full listing heading. */
export const BLOG_LISTING_HEADING = "Articles";

/**
 * Order posts most-recent-first by `publishedAt` (Correctness Property 10).
 *
 * ISO-8601 timestamps compare correctly as strings, so a descending
 * `localeCompare` yields newest → oldest. A `null` `publishedAt` (defensive —
 * published posts always carry one) sorts last so it never displaces a dated
 * post from the top. Pure and non-mutating: the input array is copied first.
 */
export function sortByRecency(posts: readonly PostView[]): PostView[] {
  return [...posts].sort((a, b) => {
    if (a.publishedAt === null && b.publishedAt === null) return 0;
    if (a.publishedAt === null) return 1;
    if (b.publishedAt === null) return -1;
    return b.publishedAt.localeCompare(a.publishedAt);
  });
}

/**
 * Select the latest `limit` posts, ordered most-recent-first
 * (Requirement 7.1 / Correctness Property 10).
 *
 * Defensive re-sort + cap so the preview invariant holds even if a caller
 * injects an unordered or oversized list (the live query already orders and
 * limits, but tests exercise this directly). Returns at most `limit` entries.
 */
export function selectLatest(
  posts: readonly PostView[],
  limit: number = BLOG_PREVIEW_LIMIT,
): PostView[] {
  return sortByRecency(posts).slice(0, Math.max(0, limit));
}

/**
 * Format an ISO-8601 timestamp as a human-readable published date
 * (e.g. "September 12, 2024"). Formatted in UTC so the rendered day is stable
 * regardless of the server/client timezone (the seed stores midnight-UTC
 * dates). Returns an empty string for an unparseable value.
 */
export function formatPublishedDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}
