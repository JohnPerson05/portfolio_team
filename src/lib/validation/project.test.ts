import { describe, expect, it } from "vitest";

import { projectSchema } from "./project";

const validInput = {
  title: "Realtime Analytics Platform",
  slug: "realtime-analytics-platform",
  summary: "A streaming analytics dashboard.",
  problem: "Teams lacked live visibility.",
  solution: "Built a websocket pipeline.",
  impact: "Cut decision latency by 80%.",
  technologies: ["Next.js", "PostgreSQL"],
  thumbnailUrl: "https://example.com/thumb.png",
  githubUrl: "https://github.com/me/project",
  liveUrl: "https://project.example.com",
  featured: true,
  order: 0,
};

describe("projectSchema — valid input", () => {
  it("accepts a complete project", () => {
    expect(projectSchema.safeParse(validInput).success).toBe(true);
  });

  it("defaults featured to false and order to 0 when omitted", () => {
    const { featured: _f, order: _o, ...rest } = validInput;
    const result = projectSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.featured).toBe(false);
      expect(result.data.order).toBe(0);
    }
  });

  it("normalizes empty optional URLs to undefined", () => {
    const result = projectSchema.safeParse({
      ...validInput,
      thumbnailUrl: "",
      githubUrl: "",
      liveUrl: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.thumbnailUrl).toBeUndefined();
      expect(result.data.githubUrl).toBeUndefined();
      expect(result.data.liveUrl).toBeUndefined();
    }
  });

  it("accepts ordered remote and local project images", () => {
    const result = projectSchema.safeParse({
      ...validInput,
      imageUrls: [
        "https://example.com/cover.webp",
        "/images/project-detail.webp",
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe("projectSchema — invalid input (Requirement 10.4)", () => {
  it("rejects an empty required field", () => {
    expect(
      projectSchema.safeParse({ ...validInput, summary: "   " }).success,
    ).toBe(false);
  });

  it("rejects a non-URL-safe slug", () => {
    expect(
      projectSchema.safeParse({ ...validInput, slug: "Not A Slug!" }).success,
    ).toBe(false);
  });

  it("rejects a malformed github URL", () => {
    expect(
      projectSchema.safeParse({ ...validInput, githubUrl: "not-a-url" })
        .success,
    ).toBe(false);
  });

  it("rejects malformed project image URLs", () => {
    expect(
      projectSchema.safeParse({
        ...validInput,
        imageUrls: ["not-an-image-location"],
      }).success,
    ).toBe(false);
  });

  it("rejects an empty technologies array", () => {
    expect(
      projectSchema.safeParse({ ...validInput, technologies: [] }).success,
    ).toBe(false);
  });

  it("rejects a technologies array with an empty entry", () => {
    expect(
      projectSchema.safeParse({ ...validInput, technologies: ["Next.js", ""] })
        .success,
    ).toBe(false);
  });

  it("rejects a negative order", () => {
    expect(projectSchema.safeParse({ ...validInput, order: -1 }).success).toBe(
      false,
    );
  });

  it("accepts order at the lower boundary (0)", () => {
    expect(projectSchema.safeParse({ ...validInput, order: 0 }).success).toBe(
      true,
    );
  });
});
