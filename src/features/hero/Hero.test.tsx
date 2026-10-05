import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "./Hero";
import { HERO_CONTENT } from "./config";

describe("Hero", () => {
  it("renders the name as the page h1 (Req 1.1)", () => {
    render(<Hero />);
    const heading = screen.getByRole("heading", {
      level: 1,
      name: HERO_CONTENT.name,
    });
    expect(heading).toBeInTheDocument();
  });

  it("renders the role and value proposition (Req 1.1)", () => {
    render(<Hero />);
    expect(screen.getByText(HERO_CONTENT.role)).toBeInTheDocument();
    expect(screen.getByText(HERO_CONTENT.valueProposition)).toBeInTheDocument();
  });

  it("renders active project/contact links and a disabled résumé control", () => {
    render(<Hero />);

    const viewProjects = screen.getByRole("link", { name: /view projects/i });
    expect(viewProjects).toHaveAttribute("href", "/projects");

    const downloadResume = screen.getByRole("button", {
      name: /download resume/i,
    });
    expect(downloadResume).toBeDisabled();
    expect(downloadResume).toHaveAttribute("aria-disabled", "true");

    const contactMe = screen.getByRole("link", { name: /contact me/i });
    expect(contactMe).toHaveAttribute("href", "/contact");
  });

  it("renders the avatar image with non-empty alt text (Req 1.1, 15.3)", () => {
    render(<Hero />);
    const avatar = screen.getByRole("img", { name: HERO_CONTENT.name });
    expect(avatar).toBeInTheDocument();
    expect(avatar.getAttribute("alt")).toBeTruthy();
  });

  it("exposes the #top anchor target for the navbar brand link (Req 1.4 nav)", () => {
    const { container } = render(<Hero />);
    expect(container.querySelector("section#top")).not.toBeNull();
  });

  it("uses props to override the default content", () => {
    render(
      <Hero
        name="Jordan Lee"
        role="Staff Engineer"
        valueProposition="Building reliable systems at scale."
      />,
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "Jordan Lee" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Staff Engineer")).toBeInTheDocument();
    expect(
      screen.getByText("Building reliable systems at scale."),
    ).toBeInTheDocument();
    // Avatar alt tracks the provided name.
    expect(screen.getByRole("img", { name: "Jordan Lee" })).toBeInTheDocument();
  });

  it("renders optional secondary links when provided", () => {
    render(
      <Hero
        links={[{ label: "GitHub", href: "https://github.com/example" }]}
      />,
    );
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute(
      "href",
      "https://github.com/example",
    );
  });
});
