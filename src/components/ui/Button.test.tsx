import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button, type ButtonVariant } from "./Button";

describe("Button", () => {
  it.each<ButtonVariant>(["primary", "ghost", "outline"])(
    "renders the %s variant as a native button with an accessible name",
    (variant) => {
      render(<Button variant={variant}>Save</Button>);
      const button = screen.getByRole("button", { name: "Save" });
      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe("BUTTON");
    },
  );

  it("derives an accessible name from aria-label when provided", () => {
    render(<Button aria-label="Close dialog">×</Button>);
    expect(
      screen.getByRole("button", { name: "Close dialog" }),
    ).toBeInTheDocument();
  });

  it("is keyboard operable (Enter and Space activate it)", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Press</Button>);
    const user = userEvent.setup();

    await user.tab();
    expect(screen.getByRole("button", { name: "Press" })).toHaveFocus();

    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("does not fire onClick when disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Disabled
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Disabled" });
    expect(button).toBeDisabled();

    const user = userEvent.setup();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders an anchor with href in link mode", () => {
    render(<Button href="/projects">View projects</Button>);
    const link = screen.getByRole("link", { name: "View projects" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/projects");
  });

  it("forwards a type attribute in button mode", () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole("button", { name: "Submit" })).toHaveAttribute(
      "type",
      "submit",
    );
  });

  it("renders a functional button through the magnetic primitive", async () => {
    const onClick = vi.fn();
    render(
      <Button magnetic onClick={onClick}>
        Magnetic
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Magnetic" });
    const user = userEvent.setup();
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("applies a focus-visible ring utility", () => {
    render(<Button>Focus</Button>);
    expect(screen.getByRole("button", { name: "Focus" }).className).toContain(
      "focus-visible:outline-accent",
    );
  });
});
