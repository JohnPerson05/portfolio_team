/**
 * Admin project-management copy + routes (Task 22, Requirement 10).
 *
 * Centralizes the labels and hrefs used by the admin projects list/new/edit UI
 * and the featured-ordering controls so the components stay focused on
 * behavior. The featured bounds are re-exported from the public projects config
 * (`MIN_FEATURED`/`MAX_FEATURED`) so the admin UI and the public renderer share
 * a single source of truth for the 3–6 rule (Req 10.5 / Property 1).
 */

export { MIN_FEATURED, MAX_FEATURED } from "@/features/projects/config";

/** Base route of the admin projects section. */
export const ADMIN_PROJECTS_HREF = "/admin/projects" as const;
/** Route of the "new project" form. */
export const ADMIN_PROJECTS_NEW_HREF = "/admin/projects/new" as const;

/** Build the edit route for a given project id. */
export function adminProjectEditHref(id: string): string {
  return `/admin/projects/${id}`;
}

// --- List page copy ---------------------------------------------------------

export const PROJECTS_LIST_EYEBROW = "Projects" as const;
export const PROJECTS_LIST_HEADING = "Manage projects" as const;
export const PROJECTS_LIST_DESCRIPTION =
  "Create, edit, and feature the work shown on your public site." as const;

export const PROJECTS_NEW_LABEL = "New project" as const;

export const PROJECTS_EMPTY_TITLE = "No projects yet" as const;
export const PROJECTS_EMPTY_DESCRIPTION =
  "Add your first project to start building your featured work." as const;

// --- Form copy --------------------------------------------------------------

export const PROJECT_NEW_HEADING = "New project" as const;
export const PROJECT_EDIT_HEADING = "Edit project" as const;
export const PROJECT_FORM_EYEBROW = "Projects" as const;

export const PROJECT_CREATE_SUBMIT = "Create project" as const;
export const PROJECT_UPDATE_SUBMIT = "Save changes" as const;
export const PROJECT_SUBMITTING_LABEL = "Saving…" as const;

export const PROJECT_GENERIC_ERROR =
  "Something went wrong. Please try again." as const;

// --- Delete dialog copy -----------------------------------------------------

export const PROJECT_DELETE_LABEL = "Delete" as const;
export const PROJECT_DELETE_TITLE = "Delete this project?" as const;
export const PROJECT_DELETE_DESCRIPTION =
  "This permanently removes the project and hides it from your public site. This cannot be undone." as const;
export const PROJECT_DELETE_CONFIRM = "Delete project" as const;
export const PROJECT_DELETE_CANCEL = "Cancel" as const;
export const PROJECT_DELETING_LABEL = "Deleting…" as const;

// --- Featured ordering copy -------------------------------------------------

export const FEATURED_HEADING = "Featured order" as const;
export const FEATURED_DESCRIPTION =
  "Choose 3–6 projects to feature on your homepage and set their order." as const;
export const FEATURED_SAVE_LABEL = "Save featured order" as const;
export const FEATURED_SAVING_LABEL = "Saving…" as const;
export const FEATURED_MOVE_UP_LABEL = "Move up" as const;
export const FEATURED_MOVE_DOWN_LABEL = "Move down" as const;
