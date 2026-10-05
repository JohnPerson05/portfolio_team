import type { ProjectView } from "@/types";

/** A complete published ProjectView for component tests. */
export function makeProjectView(order: number, overrides: Partial<ProjectView> = {}): ProjectView {
  return {
    id: `proj-${order}`,
    title: `Project ${order}`,
    slug: `project-${order}`,
    summary: `Summary ${order}`,
    problem: `Problem ${order}`,
    solution: `Solution ${order}`,
    impact: `Impact ${order}`,
    technologies: ["TypeScript", "Next.js"],
    imageUrls: [`/images/projects/${order}.jpg`],
    thumbnailUrl: `/images/projects/${order}.jpg`,
    githubUrl: `https://github.com/example/p${order}`,
    liveUrl: `https://p${order}.example.com`,
    featured: true,
    order,
    ...overrides,
  };
}
