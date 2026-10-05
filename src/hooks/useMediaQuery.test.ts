import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useMediaQuery } from "./useMediaQuery";
import { mockMatchMedia } from "@/test/match-media";

describe("useMediaQuery", () => {
  it("reflects the initial match state on mount", () => {
    mockMatchMedia((q) => q === "(min-width: 768px)");
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(true);
  });

  it("returns false for a non-matching query", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(false);
  });

  it("updates when the media query change event fires", () => {
    const controller = mockMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery("(pointer: fine)"));
    expect(result.current).toBe(false);

    act(() => {
      controller.setMatches(() => true);
    });
    expect(result.current).toBe(true);
  });
});
