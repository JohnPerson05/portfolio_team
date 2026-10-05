import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { ThemeBackground } from "./ThemeBackground";

describe("ThemeBackground", () => {
  it("is decorative: aria-hidden, non-interactive, and clips overflow", () => {
    const { container } = render(<ThemeBackground />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    expect(root).toHaveAttribute("aria-hidden", "true");
    // pointer-events-none so it never intercepts clicks; overflow-hidden so the
    // oversized glows cannot create horizontal scroll (Property 12).
    expect(root.className).toContain("pointer-events-none");
    expect(root.className).toContain("overflow-hidden");
    // Sits behind content.
    expect(root.className).toContain("-z-10");
  });

  it("exposes no accessible/interactive content", () => {
    const { container } = render(<ThemeBackground />);
    expect(container.querySelector("a, button, input")).toBeNull();
  });
});
