import { ProjectForm } from "@/features/admin/projects";

/**
 * New-project page (`/admin/projects/new`) — renders the create form
 * (Requirement 10.1). Lives under the `(protected)` route group so it inherits
 * the guarded admin layout (Property 7). The {@link ProjectForm} calls the
 * `createProject` Server Action, which re-validates and re-checks the session.
 */
export default function AdminNewProjectPage() {
  return <ProjectForm />;
}
