// Public project reads come from the shared public read model, which only
// returns PUBLISHED, non-deleted projects. The original function names are
// kept so the original pages and sections work unchanged.
export {
  getAdjacentProjects,
  getFeaturedProjects,
  getPublishedProjects as getProjects,
  getPublishedProjectBySlug as getProjectBySlug,
} from "@/server/public/queries";
