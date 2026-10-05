// Featured Projects feature barrel (Task 14).

export { FeaturedProjects } from "./FeaturedProjects";
export type { FeaturedProjectsProps } from "./FeaturedProjects";
export { ProjectCard } from "./ProjectCard";
export type { ProjectCardProps } from "./ProjectCard";
export { ProjectVisual } from "./ProjectVisual";
export type { ProjectVisualProps } from "./ProjectVisual";
export { ProjectGallery } from "./ProjectGallery";
export type { ProjectGalleryProps } from "./ProjectGallery";
export { ProjectLink } from "./ProjectLink";
export type { ProjectLinkProps } from "./ProjectLink";
export { getFeaturedProjects, getProjectBySlug, getProjects } from "./data";
export {
  selectFeatured,
  hasLink,
  MIN_FEATURED,
  MAX_FEATURED,
  PROJECTS_EYEBROW,
  PROJECTS_HEADING,
} from "./config";
