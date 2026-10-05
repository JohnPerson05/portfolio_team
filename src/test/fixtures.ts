import type { ProjectView } from "@/types";

/** A complete published ProjectView for component tests. */
export function makeProjectView(order: number, overrides: Partial<ProjectView> = {}): ProjectView {
  return {
    id: `proj-${order}`,
    title: `Project ${order}`,
    slug: `project-${order}`,
    category: "Business system",
    shortDescription: `Summary ${order}`,
    problem: `Problem ${order}`,
    solution: `Solution ${order}`,
    result: `Result ${order}`,
    coverImage: `/images/projects/${order}.jpg`,
    heroImage: `/images/projects/${order}.jpg`,
    projectUrl: `https://p${order}.example.com`,
    githubUrl: `https://github.com/example/p${order}`,
    featured: true,
    displayOrder: order,
    publishedAt: "2026-10-01T00:00:00.000Z",
    updatedAt: "2026-10-02T00:00:00.000Z",
    media: [],
    technologies: [
      { name: "TypeScript", slug: "typescript" },
      { name: "Next.js", slug: "next-js" },
    ],
    ...overrides,
  };
}
