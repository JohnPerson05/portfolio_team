import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Counter } from "./Counter";
import { mockMatchMedia, reducedMotionMatcher } from "@/test/match-media";

describe("Counter", () => {
  it("renders its final target value immediately under reduced motion", () => {
    mockMatchMedia(reducedMotionMatcher);
    render(<Counter value={120} suffix="+" />);
    // No counting animation — the final formatted value is shown right away.
    expect(screen.getByText("120+")).toBeInTheDocument();
  });

  it("formats large numbers with separators and a prefix/suffix", () => {
    mockMatchMedia(reducedMotionMatcher);
    render(<Counter value={1500} prefix="$" suffix="k" />);
    expect(screen.getByText("$1,500k")).toBeInTheDocument();
  });

  it("counts up to the final value when motion is allowed", async () => {
    mockMatchMedia(false);
    render(<Counter value={50} duration={50} />);
    await waitFor(() => expect(screen.getByText("50")).toBeInTheDocument());
  });
});
