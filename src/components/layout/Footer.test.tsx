import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { Footer } from "./Footer";
import { BRAND_NAME, NAV_LINKS, SOCIAL_LINKS } from "./navigation";

describe("Footer", () => {
  it("renders a contentinfo landmark with the brand logo", () => {
    render(<Footer />);
    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();
    expect(within(footer).getByText(BRAND_NAME)).toBeInTheDocument();
    expect(
      within(footer).getByRole("img", { name: BRAND_NAME }),
    ).toHaveAttribute("src", expect.stringContaining("brandlogo"));
  });

  it("renders the shared quick links with their hash hrefs", () => {
    render(<Footer />);
    const footerNav = screen.getByRole("navigation", { name: "Footer" });
    for (const link of NAV_LINKS) {
      expect(
        within(footerNav).getByRole("link", { name: link.label }),
      ).toHaveAttribute("href", link.href);
    }
  });

  it("renders social links that open in a new tab safely", () => {
    render(<Footer />);
    for (const social of SOCIAL_LINKS) {
      const link = screen.getByRole("link", { name: social.label });
      expect(link).toHaveAttribute("href", social.href);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("renders a copyright line with the current year", () => {
    render(<Footer />);
    const year = new Date().getFullYear();
    expect(
      screen.getByText(
        new RegExp(`©\\s*${year}\\s*${BRAND_NAME}`),
      ),
    ).toBeInTheDocument();
  });

  it("constrains content within a max-width container (no overflow)", () => {
    const { container } = render(<Footer />);
    expect(container.querySelector(".max-w-content")).not.toBeNull();
  });
});
