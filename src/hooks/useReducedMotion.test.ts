import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useReducedMotion } from "./useReducedMotion";
import { mockMatchMedia, reducedMotionMatcher } from "@/test/match-media";

describe("useReducedMotion", () => {
  it("returns true when the prefers-reduced-motion query matches", () => {
    mockMatchMedia(reducedMotionMatcher);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it("returns false when the user has no reduced-motion preference", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });
});
