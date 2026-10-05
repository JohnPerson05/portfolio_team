// Projects feature barrel.

export { FeaturedProjects } from "./FeaturedProjects";
export type { FeaturedProjectsProps } from "./FeaturedProjects";
export { ProjectCard } from "./ProjectCard";
export type { ProjectCardProps } from "./ProjectCard";
export { ProjectCaseStudy } from "./ProjectCaseStudy";
export type { ProjectCaseStudyProps } from "./ProjectCaseStudy";
export { ProjectVisual } from "./ProjectVisual";
export type { ProjectVisualProps } from "./ProjectVisual";
export { ProjectGallery } from "./ProjectGallery";
export type { ProjectGalleryProps } from "./ProjectGallery";
export { ProjectLink } from "./ProjectLink";
export type { ProjectLinkProps } from "./ProjectLink";
export { WorkShowcase } from "./WorkShowcase";
export {
  getAdjacentProjects,
  getFeaturedProjects,
  getPublishedProjectBySlug,
  getPublishedProjects,
} from "./data";
export {
  selectFeatured,
  hasLink,
  isAllowedEmbed,
  projectCategories,
  MAX_FEATURED,
  PROJECTS_EYEBROW,
  PROJECTS_HEADING,
} from "./config";
