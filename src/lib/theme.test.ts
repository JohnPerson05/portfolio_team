import { describe, expect, it } from "vitest";
import config from "../../tailwind.config";

// Sanity checks that the design tokens are centralized in the Tailwind theme
// and mapped to the CSS variables declared in globals.css. This guards
// Requirement 17.5 (centralized color tokens + typography for reuse).
describe("tailwind design tokens", () => {
  const colors = config.theme?.extend?.colors as Record<string, unknown>;

  it("maps color tokens to CSS variables", () => {
    expect(colors).toBeDefined();
    expect(colors.bg).toMatchObject({
      DEFAULT: "var(--bg)",
      secondary: "var(--bg-secondary)",
    });
    expect(colors.card).toBe("var(--card)");
    expect(colors.text).toMatchObject({
      DEFAULT: "var(--text)",
      muted: "var(--text-muted)",
    });
    expect(colors.muted).toBe("var(--text-muted)");
    expect(colors.accent).toMatchObject({ DEFAULT: "var(--accent)" });
    expect(colors.hairline).toBe("var(--border)");
  });

  it("exposes border-hairline mapped to the border token", () => {
    const borderColor = config.theme?.extend?.borderColor as Record<
      string,
      unknown
    >;
    expect(borderColor.hairline).toBe("var(--border)");
  });

  it("defines a fluid clamp-based typography scale", () => {
    const fontSize = config.theme?.extend?.fontSize as Record<
      string,
      [string, Record<string, string>]
    >;
    for (const key of ["caption", "body", "h2", "h3", "hero"]) {
      expect(fontSize[key]).toBeDefined();
      expect(fontSize[key]?.[0]).toContain("clamp(");
    }
  });

  it("defines an 8px-based spacing rhythm", () => {
    const spacing = config.theme?.extend?.spacing as Record<string, string>;
    expect(spacing["space-1"]).toBe("0.5rem"); // 8px base unit
    expect(spacing["space-2"]).toBe("1rem"); // 16px
    expect(spacing["space-4"]).toBe("2rem"); // 32px
  });

  it("wires display and body font families to next/font variables", () => {
    const fontFamily = config.theme?.extend?.fontFamily as Record<
      string,
      string[]
    >;
    expect(fontFamily.sans?.[0]).toBe("var(--font-sans)");
    expect(fontFamily.display?.[0]).toBe("var(--font-display)");
  });
});
