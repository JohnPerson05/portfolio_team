import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders the title", () => {
    render(<EmptyState title="No posts yet" />);
    expect(screen.getByText("No posts yet")).toBeInTheDocument();
  });

  it("renders the optional description", () => {
    render(
      <EmptyState
        title="No contacts"
        description="Submissions will appear here."
      />,
    );
    expect(
      screen.getByText("Submissions will appear here."),
    ).toBeInTheDocument();
  });

  it("renders the icon slot but hides it from assistive tech", () => {
    render(
      <EmptyState
        title="Empty"
        icon={<svg data-testid="empty-icon" />}
      />,
    );
    const icon = screen.getByTestId("empty-icon");
    expect(icon).toBeInTheDocument();
    // The decorative wrapper around the icon is aria-hidden.
    expect(icon.parentElement).toHaveAttribute("aria-hidden", "true");
  });

  it("renders an action node and children", () => {
    render(
      <EmptyState
        title="Nothing here"
        action={<a href="/new">Create one</a>}
      >
        <button type="button">Refresh</button>
      </EmptyState>,
    );
    expect(screen.getByRole("link", { name: "Create one" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Refresh" }),
    ).toBeInTheDocument();
  });

  it("can render the title as a custom element", () => {
    render(<EmptyState title="Heading" titleAs="h2" />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Heading" }),
    ).toBeInTheDocument();
  });
});
