import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getProjectForEdit,
  listProjectCategories,
  listTechnologies,
} from "@/server/admin/queries";
import { ProjectEditor } from "@/features/admin/projects/ProjectEditor";
import { PageHeader } from "@/features/admin/ui";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = await getProjectForEdit(id);
  return { title: project ? `Edit · ${project.title}` : "Project not found" };
}

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params;
  const [project, technologies, categories] = await Promise.all([
    getProjectForEdit(id),
    listTechnologies(),
    listProjectCategories(),
  ]);
  if (!project) notFound();

  return (
    <>
      <PageHeader
        title={project.title}
        back={{ href: project.deletedAt ? "/admin/projects?view=trash" : "/admin/projects", label: "Projects" }}
      />
      {project.deletedAt ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          This project is in the trash. Restore it from Projects → Trash to edit and publish it again.
        </p>
      ) : null}
      <ProjectEditor
        key={project.id}
        project={project}
        technologies={technologies.map(({ id: techId, name, category, isActive }) => ({ id: techId, name, category, isActive }))}
        categories={categories}
      />
    </>
  );
}
