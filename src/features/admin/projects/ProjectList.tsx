import Link from "next/link";

import { Badge, Button, Card, EmptyState } from "@/components/ui";
import type { ProjectView } from "@/types";
import { DeleteProjectButton } from "./DeleteProjectButton";
import {
  ADMIN_PROJECTS_NEW_HREF,
  adminProjectEditHref,
  PROJECTS_EMPTY_DESCRIPTION,
  PROJECTS_EMPTY_TITLE,
} from "./config";

export interface ProjectListProps {
  projects: readonly ProjectView[];
}

/**
 * `ProjectList` — the admin projects table (Server Component).
 *
 * Renders each project with its featured badge and quick edit/delete actions.
 * Edit links to the `[id]` form; delete routes through the
 * {@link DeleteProjectButton} confirmation dialog (Req 10.3). When there are no
 * projects an {@link EmptyState} invites the owner to create the first one.
 */
export function ProjectList({ projects }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <EmptyState
        title={PROJECTS_EMPTY_TITLE}
        description={PROJECTS_EMPTY_DESCRIPTION}
        action={
          <Button href={ADMIN_PROJECTS_NEW_HREF} variant="primary" size="md">
            New project
          </Button>
        }
      />
    );
  }

  return (
    <ul className="flex flex-col gap-space-3">
      {projects.map((project) => (
        <li key={project.id}>
          <Card className="flex flex-wrap items-center justify-between gap-space-3 p-space-4">
            <div className="flex min-w-0 flex-col gap-space-1">
              <div className="flex items-center gap-space-2">
                <span className="truncate font-display text-body-lg font-semibold text-text">
                  {project.title}
                </span>
                {project.featured ? (
                  <Badge variant="accent">Featured · {project.order}</Badge>
                ) : null}
              </div>
              <span className="truncate font-sans text-caption text-muted">
                /{project.slug}
              </span>
            </div>

            <div className="flex items-center gap-space-2">
              <Button
                href={adminProjectEditHref(project.id)}
                variant="outline"
                size="sm"
              >
                Edit
              </Button>
              <DeleteProjectButton
                projectId={project.id}
                projectTitle={project.title}
              />
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}

/** Re-exported for convenience where a plain link to the form is needed. */
export { Link };
