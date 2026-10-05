/**
 * Featured Projects section configuration + selection logic (Task 14).
 *
 * Requirement 3.1 / Correctness Property 1: the public projects section renders
 * between 3 and 6 featured projects, ordered by `order` ascending. The upper
 * bound is enforced here in {@link selectFeatured} (a pure, easily-tested
 * function); the lower bound is a data invariant enforced by the admin featured
 * controls (Task 22 / Requirement 10.5) since the public renderer cannot
 * manufacture projects that do not exist.
 */

import type { ProjectView } from "@/types";

/** Minimum number of featured projects expected on the public site (Req 10.5). */
export const MIN_FEATURED = 3;
/** Maximum number of featured projects displayed publicly (Req 3.1 / Property 1). */
export const MAX_FEATURED = 6;

/** Default eyebrow label shown above the section heading. */
export const PROJECTS_EYEBROW = "Selected work";
/** Default section heading. */
export const PROJECTS_HEADING = "Featured Projects";

/**
 * Clamp and order featured projects for public display (Correctness Property 1).
 *
 * Returns the projects sorted by `order` ascending and capped at
 * {@link MAX_FEATURED}. Defensive sorting keeps the invariant even if the
 * caller passes an unordered list (the live query already orders, but the unit
 * tests exercise this directly). The result never exceeds 6 entries, so the
 * rendered count always stays within the 3–6 bound for any valid dataset.
 */
export function selectFeatured(projects: readonly ProjectView[]): ProjectView[] {
  return [...projects]
    .sort((a, b) => a.order - b.order)
    .slice(0, MAX_FEATURED);
}

/**
 * Link integrity guard (Correctness Property 2 / Requirement 3.3).
 *
 * A project action link (GitHub/Live Demo) is rendered if and only if its URL
 * is non-empty. This narrows away `undefined`, `null`, and whitespace-only
 * strings so an absent URL never produces an empty/broken link.
 */
export function hasLink(url?: string | null): url is string {
  return typeof url === "string" && url.trim().length > 0;
}

