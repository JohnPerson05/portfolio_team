"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe `matchMedia` hook.
 *
 * Returns `false` on the server and during the first client render (so server
 * and client markup match and hydration never mismatches), then updates to the
 * real value on mount and stays in sync with subsequent media-query changes.
 *
 * @param query A CSS media query, e.g. `"(min-width: 768px)"`.
 * @returns Whether the query currently matches.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Guard for non-browser/SSR environments and jsdom without matchMedia.
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }

    const mediaQueryList = window.matchMedia(query);
    setMatches(mediaQueryList.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQueryList.addEventListener("change", handleChange);
    return () => {
      mediaQueryList.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}
