import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FadeUp } from "./FadeUp";
import { Stagger } from "./Stagger";
import { mockMatchMedia, reducedMotionMatcher } from "@/test/match-media";

describe("FadeUp", () => {
  it("renders children in the final visible state under reduced motion", () => {
    mockMatchMedia(reducedMotionMatcher);
    render(
      <FadeUp>
        <p>Revealed content</p>
      </FadeUp>,
    );

    const content = screen.getByText("Revealed content");
    expect(content).toBeInTheDocument();

    // Under reduced motion FadeUp renders a plain element with no opacity:0 or
    // translate applied inline, so the child is fully visible.
    const wrapper = content.parentElement as HTMLElement;
    expect(wrapper.style.opacity).not.toBe("0");
    expect(wrapper.style.transform ?? "").not.toContain("translateY");
  });

  it("renders children when in view with motion enabled", () => {
    mockMatchMedia(false);
    render(
      <FadeUp>
        <p>Animated content</p>
      </FadeUp>,
    );
    expect(screen.getByText("Animated content")).toBeInTheDocument();
  });
});

describe("Stagger with FadeUp children", () => {
  it("renders all children visibly under reduced motion", () => {
    mockMatchMedia(reducedMotionMatcher);
    render(
      <Stagger>
        <FadeUp>
          <span>One</span>
        </FadeUp>
        <FadeUp>
          <span>Two</span>
        </FadeUp>
        <FadeUp>
          <span>Three</span>
        </FadeUp>
      </Stagger>,
    );

    expect(screen.getByText("One")).toBeInTheDocument();
    expect(screen.getByText("Two")).toBeInTheDocument();
    expect(screen.getByText("Three")).toBeInTheDocument();
  });
});
