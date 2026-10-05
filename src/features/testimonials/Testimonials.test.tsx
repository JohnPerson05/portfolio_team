import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import type { TestimonialView } from "@/types";
import { mockMatchMedia, reducedMotionMatcher } from "@/test/match-media";
import { Testimonials } from "./Testimonials";

/** Build a TestimonialView with overridable fields. */
function makeTestimonial(
  order: number,
  overrides: Partial<TestimonialView> = {},
): TestimonialView {
  return {
    id: `t-${order}`,
    quote: `Quote ${order}`,
    author: `Author ${order}`,
    role: `Role ${order}`,
    company: `Company ${order}`,
    avatarUrl: undefined,
    logoUrl: undefined,
    order,
    ...overrides,
  };
}

/**
 * `Testimonials` is an async Server Component. Awaiting it yields a plain React
 * element we can render with Testing Library.
 */
async function renderTestimonials(testimonials: readonly TestimonialView[]) {
  const ui = await Testimonials({ testimonials });
  return render(ui);
}

describe("Testimonials — core content (Req 6.1)", () => {
  it("renders quote, author, and role/company for each card", async () => {
    mockMatchMedia(reducedMotionMatcher);
    await renderTestimonials([
      makeTestimonial(1, {
        quote: "An outstanding engineer.",
        author: "Dana Whitfield",
        role: "VP of Engineering",
        company: "Vertex Labs",
      }),
    ]);

    const card = screen.getByRole("figure", { name: /dana whitfield/i });
    expect(
      within(card).getByText(/an outstanding engineer\./i),
    ).toBeInTheDocument();
    expect(within(card).getByText("Dana Whitfield")).toBeInTheDocument();
    // Role and company are rendered together when company is present.
    expect(
      within(card).getByText(/VP of Engineering, Vertex Labs/i),
    ).toBeInTheDocument();
  });

  it("renders only the role when the company is absent", async () => {
    mockMatchMedia(reducedMotionMatcher);
    await renderTestimonials([
      makeTestimonial(1, {
        author: "Priya Nair",
        role: "Staff Engineer",
        company: undefined,
      }),
    ]);

    const card = screen.getByRole("figure", { name: /priya nair/i });
    expect(within(card).getByText("Staff Engineer")).toBeInTheDocument();
    expect(within(card).queryByText(/,/)).not.toBeInTheDocument();
  });

  it("renders testimonials in `order` ascending regardless of input order", async () => {
    mockMatchMedia(reducedMotionMatcher);
    await renderTestimonials([
      makeTestimonial(3, { author: "Third" }),
      makeTestimonial(1, { author: "First" }),
      makeTestimonial(2, { author: "Second" }),
    ]);

    const figures = screen.getAllByRole("figure");
    const authors = figures.map(
      (fig) => within(fig).getByText(/first|second|third/i).textContent,
    );
    expect(authors).toEqual(["First", "Second", "Third"]);
  });

  it("exposes an accessible testimonials landmark labelled by its heading", async () => {
    mockMatchMedia(reducedMotionMatcher);
    await renderTestimonials([makeTestimonial(1)]);
    expect(
      screen.getByRole("region", { name: /professional references/i }),
    ).toBeInTheDocument();
  });

  it("renders an empty state when there are no testimonials", async () => {
    mockMatchMedia(reducedMotionMatcher);
    await renderTestimonials([]);
    expect(
      screen.getByText(/references available on request/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole("figure")).not.toBeInTheDocument();
  });
});

describe("Testimonials — optional media renders gracefully (Req 6.2)", () => {
  it("renders the avatar and company logo when both URLs are present", async () => {
    mockMatchMedia(reducedMotionMatcher);
    await renderTestimonials([
      makeTestimonial(1, {
        author: "Dana Whitfield",
        company: "Vertex Labs",
        avatarUrl: "https://images.example.com/dana.jpg",
        logoUrl: "https://images.example.com/vertex.svg",
      }),
    ]);

    const card = screen.getByRole("figure", { name: /dana whitfield/i });
    expect(
      within(card).getByRole("img", { name: /photo of dana whitfield/i }),
    ).toBeInTheDocument();
    expect(
      within(card).getByRole("img", { name: /vertex labs logo/i }),
    ).toBeInTheDocument();
  });

  it("renders the avatar only when the logo URL is absent", async () => {
    mockMatchMedia(reducedMotionMatcher);
    await renderTestimonials([
      makeTestimonial(1, {
        author: "Marcus Lee",
        company: "Northwind Systems",
        avatarUrl: "https://images.example.com/marcus.jpg",
        logoUrl: undefined,
      }),
    ]);

    const card = screen.getByRole("figure", { name: /marcus lee/i });
    expect(
      within(card).getByRole("img", { name: /photo of marcus lee/i }),
    ).toBeInTheDocument();
    expect(within(card).queryByRole("img", { name: /logo/i })).toBeNull();
  });

  it("falls back cleanly when optional media fails to load", async () => {
    mockMatchMedia(reducedMotionMatcher);
    await renderTestimonials([
      makeTestimonial(1, {
        author: "Dana Whitfield",
        avatarUrl: "https://images.example.com/missing-avatar.jpg",
        logoUrl: "https://images.example.com/missing-logo.svg",
      }),
    ]);

    const card = screen.getByRole("figure", { name: /dana whitfield/i });
    fireEvent.error(
      within(card).getByRole("img", { name: /photo of dana whitfield/i }),
    );
    fireEvent.error(within(card).getByRole("img", { name: /company 1 logo/i }));

    expect(within(card).queryAllByRole("img")).toHaveLength(0);
    expect(within(card).getByText("DW")).toBeInTheDocument();
  });

  it("renders no images when neither avatar nor logo is present, without breaking layout", async () => {
    mockMatchMedia(reducedMotionMatcher);
    await renderTestimonials([
      makeTestimonial(1, {
        quote: "Ships fast without cutting corners.",
        author: "Priya Nair",
        role: "Staff Engineer",
        company: "Brightseed",
        avatarUrl: undefined,
        logoUrl: undefined,
      }),
    ]);

    const card = screen.getByRole("figure", { name: /priya nair/i });
    // No media at all — the card still renders its core content intact.
    expect(within(card).queryAllByRole("img")).toHaveLength(0);
    expect(
      within(card).getByText(/ships fast without cutting corners\./i),
    ).toBeInTheDocument();
    expect(within(card).getByText("Priya Nair")).toBeInTheDocument();
    expect(
      within(card).getByText(/staff engineer, brightseed/i),
    ).toBeInTheDocument();
  });

  it("treats whitespace-only media URLs as absent", async () => {
    mockMatchMedia(reducedMotionMatcher);
    await renderTestimonials([
      makeTestimonial(1, {
        author: "Whitespace",
        avatarUrl: "   ",
        logoUrl: "",
      }),
    ]);

    const card = screen.getByRole("figure", { name: /whitespace/i });
    expect(within(card).queryAllByRole("img")).toHaveLength(0);
  });

  it("renders mixed cards (with and without media) together without breaking layout", async () => {
    mockMatchMedia(reducedMotionMatcher);
    await renderTestimonials([
      makeTestimonial(1, {
        author: "With Media",
        company: "Acme",
        avatarUrl: "https://images.example.com/a.jpg",
        logoUrl: "https://images.example.com/acme.svg",
      }),
      makeTestimonial(2, {
        author: "No Media",
        company: undefined,
        avatarUrl: undefined,
        logoUrl: undefined,
      }),
    ]);

    // Both cards render as list items in the same grid container.
    const cards = screen.getAllByRole("figure");
    expect(cards).toHaveLength(2);

    const withMedia = screen.getByRole("figure", { name: /with media/i });
    expect(within(withMedia).getAllByRole("img")).toHaveLength(2);

    const withoutMedia = screen.getByRole("figure", { name: /no media/i });
    expect(within(withoutMedia).queryAllByRole("img")).toHaveLength(0);
    // The media-less card still shows its quote + author.
    expect(within(withoutMedia).getByText("No Media")).toBeInTheDocument();
  });
});
