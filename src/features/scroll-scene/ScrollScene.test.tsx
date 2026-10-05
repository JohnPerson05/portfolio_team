import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>(
    "framer-motion",
  );
  return {
    ...actual,
    useReducedMotion: () => true,
    useScroll: () => ({
      scrollYProgress: { get: () => 0, on: () => () => undefined },
    }),
    useTransform: (
      _value: unknown,
      inputOrMapper: unknown,
      output?: number[] | string[],
    ) => {
      if (typeof inputOrMapper === "function") return 1;
      return Array.isArray(output) ? output[0] : 0;
    },
  };
});

import type { ProcessStepView } from "@/types";
import { ScrollScene } from "./ScrollScene";
import { toChapters } from "./config";

const SCROLL_SCENE_HEADING = "From first conversation to a product that keeps working.";
const STEPS: ProcessStepView[] = [
  { id: "s1", stepNumber: 1, title: "Discover", headline: "We start with your business", description: "A focused conversation." },
  { id: "s2", stepNumber: 2, title: "Build", description: "Short, visible steps." },
];
const SCROLL_SCENE_CHAPTERS = toChapters(STEPS);

describe("ScrollScene", () => {
  it("renders nothing without published steps", () => {
    const { container } = render(<ScrollScene steps={[]} heading="How we work" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("uses the headline when present and falls back to the step name", () => {
    expect(SCROLL_SCENE_CHAPTERS.map((c) => c.title)).toEqual(["We start with your business", "Build"]);
    expect(SCROLL_SCENE_CHAPTERS[0]?.label).toBe("01 — Discover");
  });

  it("renders the process landmark with every step", () => {
    render(<ScrollScene steps={STEPS} heading={SCROLL_SCENE_HEADING} />);

    expect(
      screen.getByRole("region", { name: SCROLL_SCENE_HEADING }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: SCROLL_SCENE_HEADING }),
    ).toBeInTheDocument();
    for (const chapter of SCROLL_SCENE_CHAPTERS) {
      expect(screen.getAllByText(chapter.title).length).toBeGreaterThan(0);
    }
  });
});
