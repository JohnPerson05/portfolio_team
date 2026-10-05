import type { Metadata } from "next";
import Link from "next/link";

import { listProjects, type ProjectListView } from "@/server/admin/queries";
import { ProjectsList } from "@/features/admin/projects/ProjectsList";
import { AdminLinkButton, Icon, PageHeader } from "@/features/admin/ui";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Projects" };

const VIEWS: { id: ProjectListView; label: string }[] = [
  { id: "all", label: "All" },
  { id: "published", label: "Published" },
  { id: "draft", label: "Drafts" },
  { id: "archived", label: "Archived" },
  { id: "trash", label: "Trash" },
];

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view: rawView } = await searchParams;
  const view = (VIEWS.find((v) => v.id === rawView)?.id ?? "all") as ProjectListView;
  const { rows, counts } = await listProjects(view);

  return (
    <>
      <PageHeader
        title="Projects"
        description="Case studies shown on /work and the homepage. Drafts and archived projects are never public."
        actions={
          <AdminLinkButton href="/admin/projects/new" variant="primary">
            <Icon.Plus size={14} /> Add project
          </AdminLinkButton>
        }
      />

      <nav aria-label="Filter projects" className="mb-4 flex gap-1 overflow-x-auto border-b border-zinc-200">
        {VIEWS.map((item) => {
          const active = item.id === view;
          const count = counts[item.id];
          return (
            <Link
              key={item.id}
              href={item.id === "all" ? "/admin/projects" : `/admin/projects?view=${item.id}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "-mb-px inline-flex h-10 shrink-0 items-center gap-1.5 border-b-2 px-3 text-sm font-medium transition-colors",
                active ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-500 hover:text-zinc-800",
              )}
            >
              {item.label}
              <span className="rounded-full bg-zinc-100 px-1.5 text-[11px] font-semibold text-zinc-600">{count}</span>
            </Link>
          );
        })}
      </nav>

      <ProjectsList rows={rows} view={view} />
    </>
  );
}
