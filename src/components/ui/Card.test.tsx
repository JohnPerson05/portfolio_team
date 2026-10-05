import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "./Card";

describe("Card", () => {
  it("renders its children on a token-based surface", () => {
    render(
      <Card>
        <p>Card body</p>
      </Card>,
    );
    const body = screen.getByText("Card body");
    const card = body.parentElement;
    expect(card).not.toBeNull();
    expect(card?.className).toContain("bg-card");
    expect(card?.className).toContain("border-hairline");
  });

  it("does not apply hover utilities by default", () => {
    render(<Card data-testid="card">Plain</Card>);
    const card = screen.getByTestId("card");
    expect(card.className).not.toContain("hover:");
  });

  it("applies the hover treatment class when set", () => {
    render(
      <Card data-testid="card" hover="lift">
        Lift
      </Card>,
    );
    expect(screen.getByTestId("card").className).toContain("hover:-translate-y-1");
  });

  it("can render as a custom semantic element via `as`", () => {
    render(
      <Card as="article" data-testid="card">
        Article
      </Card>,
    );
    expect(screen.getByTestId("card").tagName).toBe("ARTICLE");
  });
});
