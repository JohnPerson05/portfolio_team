import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockMatchMedia, reducedMotionMatcher } from "@/test/match-media";
import { BackToTop } from "./BackToTop";

describe("BackToTop", () => {
  beforeEach(() => {
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 0,
    });
    window.scrollTo = vi.fn();
    mockMatchMedia(false);
  });

  it("appears after scrolling and smoothly returns to the top", () => {
    render(<BackToTop />);
    expect(
      screen.queryByRole("button", { name: /back to top/i }),
    ).not.toBeInTheDocument();

    window.scrollY = 800;
    fireEvent.scroll(window);

    fireEvent.click(screen.getByRole("button", { name: /back to top/i }));
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  });

  it("uses instant scrolling when reduced motion is preferred", () => {
    mockMatchMedia(reducedMotionMatcher);
    window.scrollY = 800;
    render(<BackToTop />);

    fireEvent.click(screen.getByRole("button", { name: /back to top/i }));
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  });
});
