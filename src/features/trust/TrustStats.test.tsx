import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { TrustStats } from "./TrustStats";
import { TRUST_STATS } from "./config";
import { mockMatchMedia, reducedMotionMatcher } from "@/test/match-media";

describe("TrustStats", () => {
  it("renders every configured metric label (Req 2.1)", () => {
    mockMatchMedia(reducedMotionMatcher);
    render(<TrustStats />);

    for (const stat of TRUST_STATS) {
      expect(screen.getByText(stat.label)).toBeInTheDocument();
    }
  });

  it("exposes an accessible trust section landmark labelled by its heading", () => {
    mockMatchMedia(reducedMotionMatcher);
    const { container } = render(<TrustStats />);

    const section = container.querySelector("section#trust");
    expect(section).not.toBeNull();
    // Region is named via aria-labelledby → the SectionHeading.
    expect(
      screen.getByRole("region", { name: /enterprise experience, small-team attention/i }),
    ).toBeInTheDocument();
  });

  it("shows each counter's final value immediately under reduced motion (Req 2.4 / Property 9)", () => {
    mockMatchMedia(reducedMotionMatcher);
    render(<TrustStats />);

    // No counting animation — final values appear right away, with suffixes
    // where configured (Req 2.3).
    expect(screen.getByText("11+")).toBeInTheDocument(); // Combined years
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("includes the configured suffix on values that define one (Req 2.3)", () => {
    mockMatchMedia(reducedMotionMatcher);
    render(<TrustStats />);

    // Stats with a suffix render it; stats without one render the bare number.
    for (const stat of TRUST_STATS) {
      const expected = `${stat.value.toLocaleString("en-US")}${stat.suffix ?? ""}`;
      expect(screen.getAllByText(expected).length).toBeGreaterThan(0);
    }
  });

  it("counts up to the correct final values when motion is allowed (Req 2.2, 2.3)", async () => {
    mockMatchMedia(false);
    render(<TrustStats />);

    // The in-view counters (IntersectionObserver mock intersects synchronously)
    // settle on their exact target values once the animation completes. The
    // count-up runs for ~1.5s, so allow the assertion to retry past that.
    await waitFor(
      () => {
        expect(screen.getByText("11+")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
        expect(screen.getByText("5")).toBeInTheDocument();
        expect(screen.getByText("0")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("renders the provided stats when overridden via props", () => {
    mockMatchMedia(reducedMotionMatcher);
    render(
      <TrustStats
        stats={[
          { id: "clients", label: "Happy Clients", value: 120, suffix: "+" },
        ]}
      />,
    );

    expect(screen.getByText("Happy Clients")).toBeInTheDocument();
    expect(screen.getByText("120+")).toBeInTheDocument();
    // Default metrics are not rendered when overridden.
    expect(
      screen.queryByText("Combined years in enterprise tech"),
    ).not.toBeInTheDocument();
  });
});
