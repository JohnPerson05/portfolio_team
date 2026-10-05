import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge, Tag } from "./Badge";

describe("Badge", () => {
  it("renders its label", () => {
    render(<Badge>TypeScript</Badge>);
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  it("uses neutral styling by default", () => {
    render(<Badge data-testid="badge">Neutral</Badge>);
    const badge = screen.getByTestId("badge");
    expect(badge.className).toContain("text-muted");
    expect(badge.className).not.toContain("text-accent");
  });

  it("applies accent styling for the accent variant", () => {
    render(
      <Badge data-testid="badge" variant="accent">
        Featured
      </Badge>,
    );
    expect(screen.getByTestId("badge").className).toContain("text-accent");
  });

  it("exposes a Tag alias that renders a label", () => {
    render(<Tag>Next.js</Tag>);
    expect(screen.getByText("Next.js")).toBeInTheDocument();
  });
});
