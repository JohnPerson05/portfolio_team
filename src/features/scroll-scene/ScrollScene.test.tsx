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
import { SCROLL_SCENE_HEADING } from "./config";

describe("ScrollScene", () => {
  it("renders the immersive craft landmark with cover and profile media", () => {
    render(<ScrollScene />);

    expect(
      screen.getByRole("region", { name: SCROLL_SCENE_HEADING }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: SCROLL_SCENE_HEADING }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /john person portrait/i }),
    ).toBeInTheDocument();
  });
});
