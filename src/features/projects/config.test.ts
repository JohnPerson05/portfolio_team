import { describe, expect, it } from "vitest";
import type { ProjectView } from "@/types";
import { makeProjectView } from "@/test/fixtures";
import { MAX_FEATURED, hasLink, isAllowedEmbed, projectCategories, selectFeatured } from "./config";

const MIN_FEATURED = 1;

function makeProject(order: number, overrides: Partial<ProjectView> = {}): ProjectView {
  return makeProjectView(order, overrides);
}

describe("selectFeatured — featured bound + ordering (Property 1; Req 3.1, 10.5)", () => {
  it("orders projects by `displayOrder` ascending regardless of input order", () => {
    const result = selectFeatured([
      makeProject(3),
      makeProject(1),
      makeProject(2),
    ]);
    expect(result.map((p) => p.displayOrder)).toEqual([1, 2, 3]);
  });

  it("caps the result at MAX_FEATURED (6) even when more are supplied", () => {
    const tenProjects = Array.from({ length: 10 }, (_, i) => makeProject(i + 1));
    const result = selectFeatured(tenProjects);

    expect(result).toHaveLength(MAX_FEATURED);
    // The lowest-ordered 6 are kept, still ascending.
    expect(result.map((p) => p.displayOrder)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("never exceeds six for any in-range dataset", () => {
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
    const snapshot = input.map((p) => p.displayOrder);
    selectFeatured(input);
    expect(input.map((p) => p.displayOrder)).toEqual(snapshot);
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

describe("isAllowedEmbed", () => {
  it("only allows https players from known hosts", () => {
    expect(isAllowedEmbed("https://www.youtube-nocookie.com/embed/abc")).toBe(true);
    expect(isAllowedEmbed("https://player.vimeo.com/video/1")).toBe(true);
    expect(isAllowedEmbed("http://player.vimeo.com/video/1")).toBe(false);
    expect(isAllowedEmbed("https://evil.example.com/embed")).toBe(false);
    expect(isAllowedEmbed("javascript:alert(1)")).toBe(false);
  });
});

describe("projectCategories", () => {
  it("lists distinct categories in first-seen order", () => {
    const list = [
      makeProject(1, { category: "B" }),
      makeProject(2, { category: "A" }),
      makeProject(3, { category: "B" }),
      makeProject(4, { category: undefined }),
    ];
    expect(projectCategories(list)).toEqual(["B", "A"]);
  });
});
