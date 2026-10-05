import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import type { ProjectView } from "@/types";
import { MAX_FEATURED, MIN_FEATURED } from "./config";
import { FeaturedProjects } from "./FeaturedProjects";

// The analytics action is only invoked by the link island on click; mock it so
// rendering never touches a server action / database.
vi.mock("@/actions/analytics", () => ({
  __esModule: true,
  recordEvent: vi.fn(async () => undefined),
}));

/** Build a featured ProjectView with overridable link fields. */
function makeProject(
  order: number,
  overrides: Partial<ProjectView> = {},
): ProjectView {
  return {
    id: `proj-${order}`,
    title: `Project ${order}`,
    slug: `project-${order}`,
    summary: `Summary ${order}`,
    problem: `Problem ${order}`,
    solution: `Solution ${order}`,
    impact: `Impact ${order}`,
    technologies: ["TypeScript", "Next.js"],
    thumbnailUrl: `/images/projects/${order}.jpg`,
    githubUrl: `https://github.com/example/p${order}`,
    liveUrl: `https://p${order}.example.com`,
    featured: true,
    order,
    ...overrides,
  };
}

/**
 * `FeaturedProjects` is an async Server Component. Awaiting it yields a plain
 * React element we can render with Testing Library.
 */
async function renderFeatured(projects: readonly ProjectView[]) {
  const ui = await FeaturedProjects({ projects });
  return render(ui);
}

describe("FeaturedProjects — featured bound & ordering (Property 1; Req 3.1)", () => {
  it("renders all cards in `order` ascending for an in-range dataset", async () => {
    await renderFeatured([makeProject(3), makeProject(1), makeProject(2)]);

    const headings = screen
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent);
    expect(headings).toEqual(["Project 1", "Project 2", "Project 3"]);
  });

  it("renders at most 6 cards even when more featured projects exist", async () => {
    const projects = Array.from({ length: 9 }, (_, i) => makeProject(i + 1));
    await renderFeatured(projects);

    const cards = screen.getAllByRole("article");
    expect(cards.length).toBeLessThanOrEqual(MAX_FEATURED);
    expect(cards).toHaveLength(MAX_FEATURED);
  });

  it("keeps the rendered count within 3–6 across in-range datasets", async () => {
    for (let count = MIN_FEATURED; count <= MAX_FEATURED; count += 1) {
      const projects = Array.from({ length: count }, (_, i) =>
        makeProject(i + 1),
      );
      const { unmount } = await renderFeatured(projects);
      const cards = screen.getAllByRole("article");
      expect(cards.length).toBeGreaterThanOrEqual(MIN_FEATURED);
      expect(cards.length).toBeLessThanOrEqual(MAX_FEATURED);
      unmount();
    }
  });

  it("renders an accessible projects landmark labelled by its heading", async () => {
    await renderFeatured([makeProject(1), makeProject(2), makeProject(3)]);
    expect(
      screen.getByRole("region", { name: /featured projects/i }),
    ).toBeInTheDocument();
  });
});

describe("FeaturedProjects — link integrity (Property 2; Req 3.3)", () => {
  it("renders both links when both URLs are present", async () => {
    await renderFeatured([makeProject(1), makeProject(2), makeProject(3)]);
    const card = screen.getByRole("article", { name: /project 1/i });
    expect(
      within(card).getByRole("link", { name: /github/i }),
    ).toBeInTheDocument();
    expect(
      within(card).getByRole("link", { name: /live demo/i }),
    ).toBeInTheDocument();
  });

  it("renders GitHub only when the live URL is absent", async () => {
    await renderFeatured([
      makeProject(1, { liveUrl: undefined }),
      makeProject(2),
      makeProject(3),
    ]);
    const card = screen.getByRole("article", { name: /project 1/i });
    expect(
      within(card).getByRole("link", { name: /github/i }),
    ).toBeInTheDocument();
    expect(
      within(card).queryByRole("link", { name: /live demo/i }),
    ).not.toBeInTheDocument();
  });

  it("renders Live Demo only when the GitHub URL is absent", async () => {
    await renderFeatured([
      makeProject(1, { githubUrl: undefined }),
      makeProject(2),
      makeProject(3),
    ]);
    const card = screen.getByRole("article", { name: /project 1/i });
    expect(
      within(card).queryByRole("link", { name: /github/i }),
    ).not.toBeInTheDocument();
    expect(
      within(card).getByRole("link", { name: /live demo/i }),
    ).toBeInTheDocument();
  });

  it("renders no action links when neither URL is present (no broken links)", async () => {
    await renderFeatured([
      makeProject(1, { githubUrl: undefined, liveUrl: undefined }),
      makeProject(2),
      makeProject(3),
    ]);
    const card = screen.getByRole("article", { name: /project 1/i });
    expect(
      within(card)
        .queryAllByRole("link")
        .filter((link) => link.getAttribute("target") === "_blank"),
    ).toHaveLength(0);
  });

  it("treats whitespace-only URLs as absent", async () => {
    await renderFeatured([
      makeProject(1, { githubUrl: "   ", liveUrl: "" }),
      makeProject(2),
      makeProject(3),
    ]);
    const card = screen.getByRole("article", { name: /project 1/i });
    expect(
      within(card)
        .queryAllByRole("link")
        .filter((link) => link.getAttribute("target") === "_blank"),
    ).toHaveLength(0);
  });
});

describe("FeaturedProjects — card content (Req 3.2)", () => {
  it("renders thumbnail, problem, solution, impact, and technologies", async () => {
    await renderFeatured([makeProject(1), makeProject(2), makeProject(3)]);
    const card = screen.getByRole("article", { name: /project 1/i });

    expect(within(card).getByText("Problem 1")).toBeInTheDocument();
    expect(within(card).getByText("Solution 1")).toBeInTheDocument();
    expect(within(card).getByText("Impact 1")).toBeInTheDocument();
    expect(within(card).getByText("TypeScript")).toBeInTheDocument();
    expect(within(card).getByText("Next.js")).toBeInTheDocument();
    expect(
      within(card).getByRole("img", { name: /project 1 preview/i }),
    ).toBeInTheDocument();
  });

  it("renders an empty state when there are no featured projects", async () => {
    await renderFeatured([]);
    expect(screen.getByText(/projects coming soon/i)).toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });
});
