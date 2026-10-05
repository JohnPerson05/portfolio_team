import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "./Hero";
import { HERO_CONTENT } from "./config";
import { TEAM } from "@/features/studio/config";

describe("Hero", () => {
  it("renders the studio statement as the page h1", () => {
    render(<Hero />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent(HERO_CONTENT.headline);
    expect(heading).toHaveTextContent(HERO_CONTENT.headlineAccent);
  });

  it("renders the eyebrow and supporting copy", () => {
    render(<Hero />);
    expect(screen.getByText(HERO_CONTENT.eyebrow)).toBeInTheDocument();
    expect(screen.getByText(HERO_CONTENT.supporting)).toBeInTheDocument();
  });

  it("renders the primary and secondary CTAs with their targets", () => {
    render(<Hero />);
    expect(
      screen.getByRole("link", { name: new RegExp(HERO_CONTENT.primaryCta.label, "i") }),
    ).toHaveAttribute("href", HERO_CONTENT.primaryCta.href);
    expect(
      screen.getByRole("link", { name: HERO_CONTENT.secondaryCta.label }),
    ).toHaveAttribute("href", HERO_CONTENT.secondaryCta.href);
  });

  it("presents both team members in the duo composition", () => {
    render(<Hero />);
    for (const member of TEAM) {
      expect(
        screen.getByLabelText(`${member.name} — ${member.discipline}`),
      ).toBeInTheDocument();
    }
  });

  it("exposes the #top anchor target for the navbar brand link", () => {
    const { container } = render(<Hero />);
    expect(container.querySelector("section#top")).not.toBeNull();
  });

  it("uses props to override the default content", () => {
    render(
      <Hero
        headline="We build things"
        headlineAccent="that matter."
        supporting="A custom line."
      />,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "We build things that matter.",
    );
    expect(screen.getByText("A custom line.")).toBeInTheDocument();
  });

  it("renders optional secondary links when provided", () => {
    render(
      <Hero links={[{ label: "LinkedIn", href: "https://linkedin.com/example" }]} />,
    );
    expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
      "href",
      "https://linkedin.com/example",
    );
  });
});
