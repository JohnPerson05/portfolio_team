import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { TrustStats } from "./TrustStats";
import { TRUST_STATS } from "./config";
import { mockMatchMedia, reducedMotionMatcher } from "@/test/match-media";

describe("TrustStats", () => {
  it("renders all five metric labels (Req 2.1)", () => {
    mockMatchMedia(reducedMotionMatcher);
    render(<TrustStats />);

    expect(screen.getByText("Years of Experience")).toBeInTheDocument();
    expect(screen.getByText("Organizations")).toBeInTheDocument();
    expect(screen.getByText("Core Technologies")).toBeInTheDocument();
    expect(screen.getByText("Delivery Domains")).toBeInTheDocument();
    expect(screen.getByText("AI Development Tools")).toBeInTheDocument();
  });

  it("exposes an accessible trust section landmark labelled by its heading", () => {
    mockMatchMedia(reducedMotionMatcher);
    const { container } = render(<TrustStats />);

    const section = container.querySelector("section#trust");
    expect(section).not.toBeNull();
    // Region is named via aria-labelledby → the SectionHeading.
    expect(
      screen.getByRole("region", { name: /proven, measurable impact/i }),
    ).toBeInTheDocument();
  });

  it("shows each counter's final value immediately under reduced motion (Req 2.4 / Property 9)", () => {
    mockMatchMedia(reducedMotionMatcher);
    render(<TrustStats />);

    // No counting animation — final values appear right away, with suffixes
    // where configured (Req 2.3).
    expect(screen.getByText("6+")).toBeInTheDocument(); // Years of Experience
    expect(screen.getByText("30+")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getAllByText("4")).toHaveLength(2);
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
        expect(screen.getByText("6+")).toBeInTheDocument();
        expect(screen.getByText("30+")).toBeInTheDocument();
        expect(screen.getByText("5")).toBeInTheDocument();
        expect(screen.getAllByText("4")).toHaveLength(2);
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
    expect(screen.queryByText("Years of Experience")).not.toBeInTheDocument();
  });
});
