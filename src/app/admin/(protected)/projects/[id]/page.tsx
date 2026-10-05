import { notFound } from "next/navigation";

import { getProjectById, ProjectForm } from "@/features/admin/projects";

/**
 * Edit-project page (`/admin/projects/[id]`) — renders the edit form
 * (Requirement 10.2). Lives under the `(protected)` route group so it inherits
 * the guarded admin layout (Property 7).
 *
 * Loads the project by id and 404s when it does not exist; the
 * {@link ProjectForm} (in edit mode) calls the `updateProject` Server Action,
 * which re-validates and re-checks the session.
 */
export const dynamic = "force-dynamic";

export default async function AdminEditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    notFound();
  }

  return <ProjectForm project={project} />;
}
