// Admin project-management feature barrel (Task 22). Composite admin UI for
// creating, editing, deleting, and featuring projects (Requirement 10).

export { ProjectForm } from "./ProjectForm";
export type { ProjectFormProps } from "./ProjectForm";

export { ProjectList } from "./ProjectList";
export type { ProjectListProps } from "./ProjectList";

export { DeleteProjectButton } from "./DeleteProjectButton";
export type { DeleteProjectButtonProps } from "./DeleteProjectButton";

export { FeaturedOrderControls } from "./FeaturedOrderControls";
export type { FeaturedOrderControlsProps } from "./FeaturedOrderControls";

export { getAllProjects, getProjectById } from "./data";

export {
  ADMIN_PROJECTS_HREF,
  ADMIN_PROJECTS_NEW_HREF,
  adminProjectEditHref,
  MIN_FEATURED,
  MAX_FEATURED,
} from "./config";
