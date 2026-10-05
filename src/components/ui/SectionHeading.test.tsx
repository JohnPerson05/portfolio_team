import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SectionHeading } from "./SectionHeading";

describe("SectionHeading", () => {
  it("renders a level-2 heading by default with the given id", () => {
    render(<SectionHeading id="projects-heading" heading="Featured Projects" />);
    const heading = screen.getByRole("heading", {
      level: 2,
      name: "Featured Projects",
    });
    expect(heading).toHaveAttribute("id", "projects-heading");
  });

  it("renders the configured heading level", () => {
    render(<SectionHeading level={3} heading="Subsection" />);
    expect(
      screen.getByRole("heading", { level: 3, name: "Subsection" }),
    ).toBeInTheDocument();
  });

  it("renders the eyebrow and description when provided", () => {
    render(
      <SectionHeading
        eyebrow="Work"
        heading="Featured Projects"
        description="A selection of recent builds."
      />,
    );
    expect(screen.getByText("Work")).toBeInTheDocument();
    expect(
      screen.getByText("A selection of recent builds."),
    ).toBeInTheDocument();
  });

  it("omits the description when not provided", () => {
    render(<SectionHeading heading="No description" />);
    expect(
      screen.queryByText("A selection of recent builds."),
    ).not.toBeInTheDocument();
  });
});
