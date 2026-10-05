import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({ __esModule: true, default: {}, prisma: {} }));

import { initialsFor, PUBLIC_PROJECT_WHERE, socialLinks, toProjectView, type ProjectWithRelations } from "./queries";
import { defaultSettings } from "@/server/settings/registry";

function row(overrides: Partial<ProjectWithRelations> = {}): ProjectWithRelations {
  return {
    id: "p1",
    title: "PetCury",
    slug: "petcury",
    category: null,
    tagline: null,
    shortDescription: "Short",
    description: "",
    problem: "P",
    solution: "S",
    result: "R",
    coverImage: null,
    heroImage: null,
    projectUrl: null,
    githubUrl: null,
    otherUrl: null,
    otherUrlLabel: null,
    clientName: null,
    year: null,
    status: "PUBLISHED",
    featured: true,
    displayOrder: 0,
    seoTitle: null,
    seoDescription: null,
    ogImage: null,
    publishedAt: new Date("2026-01-01T00:00:00Z"),
    deletedAt: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-02T00:00:00Z"),
    updatedById: null,
    media: [],
    technologies: [],
    ...overrides,
  } as ProjectWithRelations;
}

describe("public read model", () => {
  it("only ever selects published, non-deleted projects", () => {
    expect(PUBLIC_PROJECT_WHERE).toEqual({ status: "PUBLISHED", deletedAt: null });
  });

  it("normalises empty values to undefined", () => {
    const view = toProjectView(row());
    expect(view.description).toBeUndefined();
    expect(view.thumbnailUrl).toBeUndefined();
    expect(view.liveUrl).toBeUndefined();
  });

  it("uses the first gallery image as the cover when none is set", () => {
    const view = toProjectView(
      row({
        media: [
          { id: "m0", projectId: "p1", mediaType: "VIDEO", url: "https://x/v.mp4", thumbnailUrl: null, title: null, caption: null, altText: null, displayOrder: 0, createdAt: new Date() },
          { id: "m1", projectId: "p1", mediaType: "IMAGE", url: "https://x/a.png", thumbnailUrl: null, title: null, caption: "Cap", altText: "Alt", displayOrder: 1, createdAt: new Date() },
        ],
      }),
    );
    expect(view.thumbnailUrl).toBe("https://x/a.png");
    expect(view.imageUrls).toEqual(["https://x/a.png"]);
    expect(view.media?.[1]).toMatchObject({ caption: "Cap", altText: "Alt" });
  });

  it("maps technologies to names", () => {
    const view = toProjectView(
      row({
        technologies: [
          { projectId: "p1", technologyId: "t1", technology: { id: "t1", name: "Next.js", slug: "next-js", icon: null, category: null, displayOrder: 0, isActive: true } },
        ],
      }),
    );
    expect(view.technologies).toEqual(["Next.js"]);
  });

  it("builds initials and filters empty social links", () => {
    expect(initialsFor("John Person Narral")).toBe("JP");
    expect(initialsFor("[EDIT ME] Second Person")).toBe("SP");
    expect(initialsFor("IAM & IT Operations Specialist")).toBe("IAM");
    const settings = { ...defaultSettings(), "social.linkedin": "https://linkedin.com/in/x" };
    expect(socialLinks(settings)).toEqual([{ label: "LinkedIn", href: "https://linkedin.com/in/x" }]);
  });
});
