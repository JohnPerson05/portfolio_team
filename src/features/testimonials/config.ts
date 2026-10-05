/**
 * Testimonials section configuration + ordering logic (Task 17).
 *
 * Requirement 6.1: the testimonials section renders cards containing the quote,
 * author name, and author role/company. Requirement 6.2 displays an optional
 * profile photo or company logo when present and renders gracefully without it.
 * Requirement 6.3 reveals the cards with smooth professional motion.
 *
 * The pure {@link orderTestimonials} / {@link hasMedia} helpers keep the
 * display ordering and the optional-media guard easily testable and shared
 * between the live data layer and the Server Component.
 */

import type { TestimonialView } from "@/types";

/** Default eyebrow label shown above the section heading. */
export const TESTIMONIALS_EYEBROW = "References";
/** Default section heading. */
export const TESTIMONIALS_HEADING = "Professional references";

/**
 * Order testimonials for public display by their explicit `order` field
 * ascending. Defensive sorting keeps the ordering invariant even when the
 * caller passes an unordered list (the live query already orders; the unit
 * tests exercise this directly), so re-rendering with the same data is
 * idempotent and does not mutate the input.
 */
export function orderTestimonials(
  testimonials: readonly TestimonialView[],
): TestimonialView[] {
  return [...testimonials].sort((a, b) => a.order - b.order);
}

/**
 * Optional-media guard (Requirement 6.2).
 *
 * A testimonial's avatar/company logo is rendered if and only if its URL is a
 * non-empty, non-whitespace string. This narrows away `undefined`, `null`, and
 * whitespace-only strings so an absent image never produces a broken/empty
 * `<img>` and the card layout stays intact without it.
 */
export function hasMedia(url?: string | null): url is string {
  return typeof url === "string" && url.trim().length > 0;
}

/**
 * Older seed records used generic local portrait illustrations. Treat those as
 * placeholders so references without a real supplied photo render initials.
 */
export function hasReferencePhoto(url?: string | null): url is string {
  return hasMedia(url) && !url.startsWith("/images/testimonials/");
}
