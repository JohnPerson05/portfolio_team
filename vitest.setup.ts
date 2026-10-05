import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

// Ensure the DOM is reset between tests to keep them isolated.
afterEach(() => {
  cleanup();
});

/**
 * jsdom does not implement IntersectionObserver, which the motion primitives
 * (`useInView`, `FadeUp`, `Stagger`, `Counter`) rely on. This mock immediately
 * reports the observed element as intersecting so reveal/in-view logic resolves
 * deterministically in tests. Individual tests can still override it.
 */
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];
  private readonly callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element): void {
    const entry = {
      isIntersecting: true,
      intersectionRatio: 1,
      target,
      time: 0,
      boundingClientRect: target.getBoundingClientRect(),
      intersectionRect: target.getBoundingClientRect(),
      rootBounds: null,
    } as IntersectionObserverEntry;
    // Invoke synchronously so the consuming component sees "in view" right away.
    this.callback([entry], this);
  }

  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

/**
 * Default `matchMedia` stub: reports NOT matching for every query (so reduced
 * motion is off and pointer is coarse by default). Tests that need a specific
 * preference use `mockMatchMedia` from `src/test/match-media.ts`.
 */
function defaultMatchMedia(query: string): MediaQueryList {
  return {
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList;
}

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  // requestAnimationFrame in jsdom can be undefined depending on version.
  if (typeof window.requestAnimationFrame !== "function") {
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) =>
      setTimeout(() => cb(performance.now()), 0),
    );
    vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
  }
  window.matchMedia = defaultMatchMedia as typeof window.matchMedia;
});
