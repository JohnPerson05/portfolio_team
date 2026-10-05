"use client";

import { useMediaQuery } from "./useMediaQuery";

/**
 * Media query that matches when the user has requested reduced motion at the
 * OS/browser level.
 */
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Returns whether the user prefers reduced motion.
 *
 * Implemented on top of {@link useMediaQuery} (rather than framer-motion's own
 * hook) so the behaviour is fully deterministic and testable under jsdom via a
 * mocked `matchMedia`. It is SSR-safe: it returns `false` (NOT reduced) on the
 * server and during the first client render, then updates on mount.
 *
 * Motion primitives use this to render their final/visible state instantly
 * when reduced motion is requested (see Correctness Property 9).
 */
export function useReducedMotion(): boolean {
  return useMediaQuery(REDUCED_MOTION_QUERY);
}
