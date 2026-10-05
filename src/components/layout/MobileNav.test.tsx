import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobileNav } from "./MobileNav";
import { NAV_LINKS, PRIMARY_CTA } from "./navigation";

const [firstLink] = NAV_LINKS;
if (!firstLink) {
  throw new Error("NAV_LINKS must contain at least one link for these tests");
}

describe("MobileNav (accessible toggle pattern)", () => {
  it("renders a collapsed toggle with an accessible name and aria-expanded=false", () => {
    render(<MobileNav />);
    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    // Panel content is not present while collapsed.
    expect(
      screen.queryByRole("link", { name: firstLink.label }),
    ).not.toBeInTheDocument();
  });

  it("toggles aria-expanded and the accessible name on open/close", async () => {
    render(<MobileNav />);
    const user = userEvent.setup();
    const toggle = screen.getByRole("button", { name: "Open menu" });

    await user.click(toggle);
    const openToggle = screen.getByRole("button", { name: "Close menu" });
    expect(openToggle).toHaveAttribute("aria-expanded", "true");

    await user.click(openToggle);
    expect(
      screen.getByRole("button", { name: "Open menu" }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("points aria-controls at the panel id that exists when open", async () => {
    render(<MobileNav />);
    const user = userEvent.setup();
    const toggle = screen.getByRole("button", { name: "Open menu" });
    const controls = toggle.getAttribute("aria-controls");
    expect(controls).toBeTruthy();

    await user.click(toggle);
    const panel = document.getElementById(controls as string);
    expect(panel).not.toBeNull();
    expect(panel).toContainElement(
      screen.getByRole("link", { name: firstLink.label }),
    );
  });

  it("renders all section links plus the primary CTA when open", async () => {
    render(<MobileNav />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Open menu" }));

    for (const link of NAV_LINKS) {
      expect(
        screen.getByRole("link", { name: link.label }),
      ).toHaveAttribute("href", link.href);
    }
    expect(
      screen.getByRole("link", { name: PRIMARY_CTA.label }),
    ).toHaveAttribute("href", PRIMARY_CTA.href);
  });

  it("closes the menu when Escape is pressed", async () => {
    render(<MobileNav />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(
      screen.getByRole("link", { name: firstLink.label }),
    ).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(
      screen.getByRole("button", { name: "Open menu" }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("link", { name: firstLink.label }),
    ).not.toBeInTheDocument();
  });

  it("closes the menu when a section link is activated", async () => {
    render(<MobileNav />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Open menu" }));

    await user.click(screen.getByRole("link", { name: firstLink.label }));

    expect(
      screen.getByRole("button", { name: "Open menu" }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("link", { name: firstLink.label }),
    ).not.toBeInTheDocument();
  });

  it("moves focus to the panel on open and restores it to the toggle on close", async () => {
    render(<MobileNav />);
    const user = userEvent.setup();
    const toggle = screen.getByRole("button", { name: "Open menu" });

    await user.click(toggle);
    const controls = screen
      .getByRole("button", { name: "Close menu" })
      .getAttribute("aria-controls");
    const panel = document.getElementById(controls as string);
    expect(panel).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveFocus();
  });
});
