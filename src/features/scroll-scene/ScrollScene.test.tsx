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

import { ScrollScene } from "./ScrollScene";
import { SCROLL_SCENE_CHAPTERS, SCROLL_SCENE_HEADING } from "./config";

describe("ScrollScene", () => {
  it("renders the process landmark with every step", () => {
    render(<ScrollScene />);

    expect(
      screen.getByRole("region", { name: SCROLL_SCENE_HEADING }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: SCROLL_SCENE_HEADING }),
    ).toBeInTheDocument();
    for (const chapter of SCROLL_SCENE_CHAPTERS) {
      expect(screen.getByText(chapter.title)).toBeInTheDocument();
    }
  });
});
