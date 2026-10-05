import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import type { ExperienceView } from "@/types";
import { mockMatchMedia, reducedMotionMatcher } from "@/test/match-media";
import { PRESENT_LABEL } from "./config";
import { Timeline } from "./Timeline";

/** Build an ExperienceView with overridable fields. */
function makeExperience(
  overrides: Partial<ExperienceView> = {},
): ExperienceView {
  return {
    id: overrides.id ?? "exp",
    company: overrides.company ?? "Acme",
    position: overrides.position ?? "Engineer",
    startDate: overrides.startDate ?? "2020-01-01T00:00:00.000Z",
    endDate: overrides.endDate ?? null,
    impact: overrides.impact ?? "Did impactful work.",
    achievements: overrides.achievements ?? ["Shipped a thing."],
    order: overrides.order ?? 0,
  };
}

/** A realistic three-role career history in non-chronological input order. */
function careerHistory(): ExperienceView[] {
  return [
    makeExperience({
      id: "brightseed",
      company: "Brightseed",
      position: "Software Engineer",
      startDate: "2017-07-01T00:00:00.000Z",
      endDate: "2019-05-31T00:00:00.000Z",
      impact: "Delivered customer-facing web features.",
      achievements: ["Lifted activation by 23%.", "Cut CI runtime to 7 minutes."],
    }),
    makeExperience({
      id: "vertex",
      company: "Vertex Labs",
      position: "Principal Software Engineer",
      startDate: "2022-03-01T00:00:00.000Z",
      endDate: null,
      impact: "Set technical direction for the platform org.",
      achievements: ["Architected a streaming platform.", "Mentored 12 engineers."],
    }),
    makeExperience({
      id: "northwind",
      company: "Northwind Systems",
      position: "Senior Software Engineer",
      startDate: "2019-06-01T00:00:00.000Z",
      endDate: "2022-02-28T00:00:00.000Z",
      impact: "Owned the core API platform.",
      achievements: ["Built a feature store.", "Drove p99 latency from 480ms to 85ms."],
    }),
  ];
}

/**
 * `Timeline` is an async Server Component. Awaiting it yields a plain React
 * element we can render with Testing Library.
 */
async function renderTimeline(experiences: readonly ExperienceView[]) {
  const ui = await Timeline({ experiences });
  return render(ui);
}

describe("Timeline — chronological ordering (Req 5.1)", () => {
  it("renders entries most-recent-first regardless of input order", async () => {
    mockMatchMedia(reducedMotionMatcher);
    await renderTimeline(careerHistory());

    const positions = screen
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent);
    expect(positions).toEqual([
      "Principal Software Engineer", // Vertex (2022, present)
      "Senior Software Engineer", // Northwind (2019–2022)
      "Software Engineer", // Brightseed (2017–2019)
    ]);
  });

  it("renders entries as items of a single ordered list", async () => {
    mockMatchMedia(reducedMotionMatcher);
    await renderTimeline(careerHistory());

    const lists = screen.getAllByRole("list");
    // The timeline itself is the only <ol>; achievement <ul>s are nested.
    const timeline = lists.find((el) => el.tagName === "OL");
    expect(timeline).toBeDefined();
    const items = within(timeline as HTMLElement).getAllByRole("listitem");
    // Three top-level entries (achievement bullets live in nested <ul>s).
    const entryArticles = within(timeline as HTMLElement).getAllByRole("article");
    expect(entryArticles).toHaveLength(3);
    expect(items.length).toBeGreaterThanOrEqual(3);
  });

  it("renders company, position, impact, and key achievements for each entry", async () => {
    mockMatchMedia(reducedMotionMatcher);
    await renderTimeline(careerHistory());

    const vertex = screen.getByRole("article", {
      name: /principal software engineer/i,
    });
    expect(within(vertex).getByText("Vertex Labs")).toBeInTheDocument();
    expect(
      within(vertex).getByText("Set technical direction for the platform org."),
    ).toBeInTheDocument();
    expect(
      within(vertex).getByText("Architected a streaming platform."),
    ).toBeInTheDocument();
    expect(
      within(vertex).getByText("Mentored 12 engineers."),
    ).toBeInTheDocument();
  });

  it("labels a current role's tenure with the Present label", async () => {
    mockMatchMedia(reducedMotionMatcher);
    await renderTimeline(careerHistory());

    const vertex = screen.getByRole("article", {
      name: /principal software engineer/i,
    });
    expect(
      within(vertex).getByText(new RegExp(PRESENT_LABEL, "i")),
    ).toBeInTheDocument();
  });

  it("exposes an accessible experience section landmark labelled by its heading", async () => {
    mockMatchMedia(reducedMotionMatcher);
    await renderTimeline(careerHistory());
    expect(
      screen.getByRole("region", { name: /experience/i }),
    ).toBeInTheDocument();
  });

  it("renders an empty state when there are no entries", async () => {
    mockMatchMedia(reducedMotionMatcher);
    await renderTimeline([]);
    expect(screen.getByText(/experience coming soon/i)).toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });
});

describe("Timeline — single-column, no horizontal overflow (Req 5.3 / Property 12)", () => {
  it("constrains content within a max-width container", async () => {
    mockMatchMedia(reducedMotionMatcher);
    const { container } = await renderTimeline(careerHistory());
    // Mirrors the layout-shell convention: a max-w-content container keeps the
    // section from exceeding the viewport width at any breakpoint.
    expect(container.querySelector(".max-w-content")).not.toBeNull();
  });

  it("renders the timeline as a single column at every breakpoint", async () => {
    mockMatchMedia(reducedMotionMatcher);
    await renderTimeline(careerHistory());

    const lists = screen.getAllByRole("list");
    const timeline = lists.find((el) => el.tagName === "OL") as HTMLElement;
    // A flex-col list (no grid-cols-* / no horizontal flex-row) is single
    // column on mobile and up — Requirement 5.3.
    expect(timeline.className).toContain("flex-col");
    expect(timeline.className).not.toMatch(/grid-cols-/);
    expect(timeline.className).not.toMatch(/flex-row/);
  });

  it("uses no fixed-width / overflow-inducing utilities on the section or entries", async () => {
    mockMatchMedia(reducedMotionMatcher);
    const { container } = await renderTimeline(careerHistory());

    // No element opts into horizontal scrolling, and nothing pins a fixed
    // pixel width (w-[...px]) that could exceed a narrow mobile viewport.
    const elements = Array.from(container.querySelectorAll<HTMLElement>("*"));
    for (const el of elements) {
      expect(el.className).not.toContain("overflow-x-auto");
      expect(el.className).not.toContain("overflow-x-scroll");
      expect(el.className).not.toMatch(/\bw-\[\d/); // e.g. w-[800px]
      expect(el.className).not.toMatch(/\bmin-w-\[\d/);
    }
  });

  it("uses token-based responsive horizontal padding rather than negative margins", async () => {
    mockMatchMedia(reducedMotionMatcher);
    await renderTimeline(careerHistory());
    const section = screen.getByRole("region", { name: /experience/i });
    expect(section.className).toContain("px-space-2");
    expect(section.className).toContain("sm:px-space-4");
    // The section spans full width without overflowing its parent.
    expect(section.className).toContain("w-full");
  });
});
