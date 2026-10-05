export interface MatchMediaController {
  /** Update which media queries currently match and notify listeners. */
  setMatches: (predicate: (query: string) => boolean) => void;
}

/**
 * Install a controllable `window.matchMedia` stub for tests.
 *
 * @param matches A predicate (or boolean) deciding whether a given query
 *   matches. For example `(q) => q.includes("reduce")` to simulate
 *   `prefers-reduced-motion: reduce`.
 * @returns A controller to update matches at runtime.
 */
export function mockMatchMedia(
  matches: boolean | ((query: string) => boolean),
): MatchMediaController {
  const predicate =
    typeof matches === "function" ? matches : () => matches;
  let current = predicate;

  type Listener = (event: MediaQueryListEvent) => void;
  const registry = new Map<string, Set<Listener>>();

  window.matchMedia = ((query: string): MediaQueryList => {
    const listeners = registry.get(query) ?? new Set<Listener>();
    registry.set(query, listeners);

    return {
      get matches() {
        return current(query);
      },
      media: query,
      onchange: null,
      addEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
        listeners.add(listener as Listener);
      },
      removeEventListener: (
        _type: string,
        listener: EventListenerOrEventListenerObject,
      ) => {
        listeners.delete(listener as Listener);
      },
      addListener: (listener: Listener) => listeners.add(listener),
      removeListener: (listener: Listener) => listeners.delete(listener),
      dispatchEvent: () => true,
    } as unknown as MediaQueryList;
  }) as typeof window.matchMedia;

  return {
    setMatches(next) {
      current = next;
      for (const [query, listeners] of registry.entries()) {
        const event = { matches: next(query), media: query } as MediaQueryListEvent;
        listeners.forEach((listener) => listener(event));
      }
    },
  };
}

/** Predicate matching the reduced-motion media query. */
export const reducedMotionMatcher = (query: string): boolean =>
  query.includes("prefers-reduced-motion");
