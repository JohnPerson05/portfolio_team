import { describe, expect, it } from "vitest";
import type { ProjectView } from "@/types";
import { MAX_FEATURED, MIN_FEATURED, hasLink, selectFeatured } from "./config";

/** Build a minimal ProjectView with a given order and optional link overrides. */
function makeProject(
  order: number,
  overrides: Partial<ProjectView> = {},
): ProjectView {
  return {
    id: `proj-${order}`,
    title: `Project ${order}`,
    slug: `project-${order}`,
    summary: "summary",
    problem: "problem",
    solution: "solution",
    impact: "impact",
    technologies: ["TypeScript"],
    thumbnailUrl: undefined,
    githubUrl: undefined,
    liveUrl: undefined,
    featured: true,
    order,
    ...overrides,
  };
}

describe("selectFeatured — featured bound + ordering (Property 1; Req 3.1, 10.5)", () => {
  it("orders projects by `order` ascending regardless of input order", () => {
    const result = selectFeatured([
      makeProject(3),
      makeProject(1),
      makeProject(2),
    ]);
    expect(result.map((p) => p.order)).toEqual([1, 2, 3]);
  });

  it("caps the result at MAX_FEATURED (6) even when more are supplied", () => {
    const tenProjects = Array.from({ length: 10 }, (_, i) => makeProject(i + 1));
    const result = selectFeatured(tenProjects);

    expect(result).toHaveLength(MAX_FEATURED);
    // The lowest-ordered 6 are kept, still ascending.
    expect(result.map((p) => p.order)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("keeps the count within the 3–6 bound for any in-range dataset", () => {
    for (let count = MIN_FEATURED; count <= MAX_FEATURED; count += 1) {
      const projects = Array.from({ length: count }, (_, i) =>
        makeProject(i + 1),
      );
      const result = selectFeatured(projects);
      expect(result.length).toBeGreaterThanOrEqual(MIN_FEATURED);
      expect(result.length).toBeLessThanOrEqual(MAX_FEATURED);
    }
  });

  it("does not mutate the input array", () => {
    const input = [makeProject(2), makeProject(1)];
    const snapshot = input.map((p) => p.order);
    selectFeatured(input);
    expect(input.map((p) => p.order)).toEqual(snapshot);
  });
});

describe("hasLink — link integrity (Property 2; Req 3.3)", () => {
  it("is true only for non-empty, non-whitespace strings", () => {
    expect(hasLink("https://example.com")).toBe(true);
  });

  it("is false for undefined, null, empty, and whitespace-only URLs", () => {
    expect(hasLink(undefined)).toBe(false);
    expect(hasLink(null)).toBe(false);
    expect(hasLink("")).toBe(false);
    expect(hasLink("   ")).toBe(false);
  });
});
