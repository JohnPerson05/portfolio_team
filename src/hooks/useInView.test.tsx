import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { useInView } from "./useInView";
import { mockMatchMedia } from "@/test/match-media";

function Probe() {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} data-testid="probe">
      {inView ? "in-view" : "out-of-view"}
    </div>
  );
}

describe("useInView", () => {
  it("reports in view when the observed element is intersecting", () => {
    // The mocked IntersectionObserver in vitest.setup reports intersection
    // synchronously when an element is observed.
    mockMatchMedia(false);
    render(<Probe />);
    expect(screen.getByTestId("probe")).toHaveTextContent("in-view");
  });
});
