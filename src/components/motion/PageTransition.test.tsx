import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageTransition } from "./PageTransition";
import { MotionProvider } from "./MotionProvider";
import { mockMatchMedia, reducedMotionMatcher } from "@/test/match-media";

describe("PageTransition", () => {
  it("renders children with no motion wrapper under reduced motion", () => {
    mockMatchMedia(reducedMotionMatcher);
    render(
      <PageTransition>
        <main>Page body</main>
      </PageTransition>,
    );
    const content = screen.getByText("Page body");
    expect(content).toBeInTheDocument();
    const wrapper = content.parentElement as HTMLElement;
    expect(wrapper.style.opacity).not.toBe("0");
  });

  it("renders children inside the MotionProvider with motion enabled", () => {
    mockMatchMedia(false);
    render(
      <MotionProvider>
        <PageTransition routeKey="/home">
          <main>Home</main>
        </PageTransition>
      </MotionProvider>,
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
  });
});
