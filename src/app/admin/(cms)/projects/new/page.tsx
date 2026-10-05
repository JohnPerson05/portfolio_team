import type { Metadata } from "next";

import { listProjectCategories, listTechnologies } from "@/server/admin/queries";
import { ProjectEditor } from "@/features/admin/projects/ProjectEditor";
import { PageHeader } from "@/features/admin/ui";

export const metadata: Metadata = { title: "New project" };

export default async function NewProjectPage() {
  const [technologies, categories] = await Promise.all([listTechnologies(), listProjectCategories()]);
  return (
    <>
      <PageHeader
        title="New project"
        description="Start with a name — save a draft any time, publish when the story is ready."
        back={{ href: "/admin/projects", label: "Projects" }}
      />
      <ProjectEditor
        project={null}
        technologies={technologies.map(({ id, name, category, isActive }) => ({ id, name, category, isActive }))}
        categories={categories}
      />
    </>
  );
}
