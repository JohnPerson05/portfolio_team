import { describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useCounter } from "./useCounter";
import { mockMatchMedia, reducedMotionMatcher } from "@/test/match-media";

describe("useCounter", () => {
  it("returns the target immediately under reduced motion", () => {
    mockMatchMedia(reducedMotionMatcher);
    const { result } = renderHook(() =>
      useCounter({ target: 42, active: true }),
    );
    expect(result.current).toBe(42);
  });

  it("stays at 0 while inactive", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() =>
      useCounter({ target: 99, active: false }),
    );
    expect(result.current).toBe(0);
  });

  it("animates up to and settles exactly on the target", async () => {
    mockMatchMedia(false);
    const { result } = renderHook(() =>
      useCounter({ target: 100, active: true, duration: 50 }),
    );
    await waitFor(() => expect(result.current).toBe(100));
  });
});
