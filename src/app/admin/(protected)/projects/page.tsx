import { Button, SectionHeading } from "@/components/ui";
import {
  ADMIN_PROJECTS_NEW_HREF,
  FeaturedOrderControls,
  getAllProjects,
  ProjectList,
} from "@/features/admin/projects";
import {
  PROJECTS_LIST_DESCRIPTION,
  PROJECTS_LIST_EYEBROW,
  PROJECTS_LIST_HEADING,
  PROJECTS_NEW_LABEL,
} from "@/features/admin/projects/config";

/**
 * Admin projects list (`/admin/projects`) — the management hub (Requirement 10).
 *
 * A Server Component under the `(protected)` route group, so it inherits the
 * guarded admin layout (`requireSession`) and renders only for the owner
 * (Property 7). It lists every project with edit/delete actions
 * ({@link ProjectList}) and exposes the featured-ordering controls
 * ({@link FeaturedOrderControls}) that enforce the public 3–6 featured display
 * (Req 10.5 / Property 1).
 *
 * Reads are dynamic so newly created/edited/deleted projects (which
 * `revalidatePath('/admin/projects')` invalidates) always reflect here.
 */
export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await getAllProjects();

  return (
    <div className="flex flex-col gap-space-8">
      <div className="flex flex-wrap items-start justify-between gap-space-3">
        <SectionHeading
          level={1}
          eyebrow={PROJECTS_LIST_EYEBROW}
          heading={PROJECTS_LIST_HEADING}
          description={PROJECTS_LIST_DESCRIPTION}
        />
        <Button href={ADMIN_PROJECTS_NEW_HREF} variant="primary" size="md">
          {PROJECTS_NEW_LABEL}
        </Button>
      </div>

      <ProjectList projects={projects} />

      {projects.length > 0 ? (
        <FeaturedOrderControls projects={projects} />
      ) : null}
    </div>
  );
}
