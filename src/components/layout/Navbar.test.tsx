import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { Navbar } from "./Navbar";
import { BRAND_NAME, NAV_LINKS, PRIMARY_CTA } from "./navigation";

describe("Navbar", () => {
  it("renders a primary navigation landmark", () => {
    render(<Navbar />);
    expect(
      screen.getByRole("navigation", { name: "Primary" }),
    ).toBeInTheDocument();
  });

  it("renders inside a header (banner) landmark with the brand logo", () => {
    render(<Navbar />);
    const banner = screen.getByRole("banner");
    expect(banner).toBeInTheDocument();
    expect(
      within(banner).getByRole("link", { name: BRAND_NAME }),
    ).toBeInTheDocument();
    // The logo is decorative (alt="") because the link already carries the name.
    const logo = within(banner).getByRole("link", { name: BRAND_NAME }).querySelector("img");
    expect(logo).toHaveAttribute("src", expect.stringContaining("brandlogo"));
    expect(logo).toHaveAttribute("alt", "");
  });

  it("renders each section link with the correct hash href", () => {
    render(<Navbar />);
    const nav = screen.getByRole("navigation", { name: "Primary" });
    for (const link of NAV_LINKS) {
      expect(
        within(nav).getByRole("link", { name: link.label }),
      ).toHaveAttribute("href", link.href);
    }
  });

  it("renders the primary CTA pointing at the contact anchor", () => {
    render(<Navbar />);
    const nav = screen.getByRole("navigation", { name: "Primary" });
    // The CTA label appears in both the desktop bar and the (collapsed-by
    // -default) mobile drawer source; querying within the desktop nav resolves
    // the visible CTA link.
    const [cta] = within(nav).getAllByRole("link", { name: PRIMARY_CTA.label });
    expect(cta).toBeDefined();
    expect(cta).toHaveAttribute("href", PRIMARY_CTA.href);
  });

  it("uses a max-width container to constrain content width", () => {
    render(<Navbar />);
    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(nav.className).toContain("max-w-content");
  });
});
