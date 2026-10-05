"use client";

import { useEffect, useRef } from "react";
import { EventType } from "@prisma/client";
import { recordEvent } from "@/actions/analytics";

export interface PageViewTrackerProps {
  /**
   * Optional path to associate with the recorded view. Defaults to `undefined`
   * (no path); the homepage passes `"/"`.
   */
  path?: string;
}

/**
 * `PageViewTracker` — the non-blocking page-view analytics island
 * (Requirement 13.1; Correctness Properties 5 & 6).
 *
 * Rendered into a server-rendered page, it records a single `PORTFOLIO_VIEW`
 * event once, *after* hydration, from a mount effect. Because the work happens
 * in `useEffect` it never runs during render and therefore can never block the
 * first paint or delay the streamed HTML (Property 6 / Requirement 13.7). The
 * component renders `null`, so it adds nothing to the layout.
 *
 * Exactly-once (Property 5 / Requirement 13.1): a ref guard ensures the event
 * fires a single time even when React re-invokes the mount effect (e.g. under
 * StrictMode's development double-invoke). The underlying {@link recordEvent}
 * already swallows its own failures; we additionally fire-and-forget (no
 * `await`) and defensively catch so a rejected promise can never surface to the
 * visitor.
 */
export function PageViewTracker({ path }: PageViewTrackerProps) {
  const recorded = useRef(false);

  useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;

    // Fire-and-forget: do not await, do not let a rejection bubble.
    void Promise.resolve(
      recordEvent({ type: EventType.PORTFOLIO_VIEW, path }),
    ).catch(() => {
      /* analytics must never disrupt the visitor experience */
    });
  }, [path]);

  return null;
}
