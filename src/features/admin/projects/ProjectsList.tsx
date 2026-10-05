"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  deleteProjectPermanently,
  duplicateProject,
  reorderProjects,
  restoreProject,
  setProjectFeatured,
  setProjectStatus,
  trashProject,
} from "@/actions/projects";
import { imageSource } from "@/lib/images";
import type { ProjectListRow, ProjectListView } from "@/server/admin/queries";
import {
  AdminEmptyState,
  AdminLinkButton,
  Badge,
  Icon,
  RowMenu,
  SortableList,
  StatusBadge,
  timeAgo,
  useAdminAction,
  useAdminFeedback,
  type MenuItem,
  type SortableRenderState,
} from "../ui";

function Thumb({ src }: { src: string | null }) {
  return (
    <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-md border border-zinc-200 bg-zinc-100">
      {src ? (
        <Image {...imageSource(src)} alt="" fill sizes="64px" className="object-cover" />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-zinc-300">
          <Icon.Image size={16} />
        </span>
      )}
    </div>
  );
}

function useRowActions(view: ProjectListView) {
  const { run } = useAdminAction();
  const { confirm } = useAdminFeedback();
  const router = useRouter();

  return (project: ProjectListRow): MenuItem[] => {
    if (view === "trash") {
      return [
        {
          label: "Restore as draft",
          icon: <Icon.Restore size={14} />,
          onSelect: () => run(() => restoreProject(project.id), { success: "Project restored as a draft" }),
        },
        {
          label: "Delete permanently",
          icon: <Icon.Trash size={14} />,
          tone: "danger",
          onSelect: async () => {
            const ok = await confirm({
              title: `Delete “${project.title}” forever?`,
              description: "The project, its gallery, and its technology links will be permanently removed. This can't be undone.",
              confirmLabel: "Delete forever",
              tone: "danger",
            });
            if (ok) run(() => deleteProjectPermanently(project.id), { success: "Project deleted" });
          },
        },
      ];
    }
    return [
      { label: "Edit", icon: <Icon.Pen size={14} />, onSelect: () => router.push(`/admin/projects/${project.id}`) },
      {
        label: "Preview",
        icon: <Icon.Eye size={14} />,
        onSelect: () => window.open(`/admin/projects/${project.id}/preview`, "_blank", "noopener"),
      },
      {
        label: "View live",
        icon: <Icon.External size={14} />,
        hidden: project.status !== "PUBLISHED",
        onSelect: () => window.open(`/projects/${project.slug}`, "_blank", "noopener"),
      },
      {
        label: "Publish",
        icon: <Icon.Check size={14} />,
        hidden: project.status === "PUBLISHED",
        onSelect: () => run(() => setProjectStatus(project.id, "PUBLISHED"), { success: "Published — it's live on /projects" }),
      },
      {
        label: "Unpublish (to draft)",
        icon: <Icon.EyeOff size={14} />,
        hidden: project.status !== "PUBLISHED",
        onSelect: () => run(() => setProjectStatus(project.id, "DRAFT"), { success: "Moved back to drafts" }),
      },
      {
        label: project.featured ? "Remove from homepage" : "Feature on homepage",
        icon: <Icon.Star size={14} />,
        onSelect: () =>
          run(() => setProjectFeatured(project.id, !project.featured), {
            success: project.featured ? "Removed from homepage" : "Featured on homepage",
          }),
      },
      {
        label: "Duplicate",
        icon: <Icon.Copy size={14} />,
        onSelect: () =>
          run(() => duplicateProject(project.id), {
            success: "Duplicated as a draft",
            onSuccess: (data) => data && router.push(`/admin/projects/${data.id}`),
          }),
      },
      {
        label: "Archive",
        icon: <Icon.Archive size={14} />,
        hidden: project.status === "ARCHIVED",
        onSelect: () => run(() => setProjectStatus(project.id, "ARCHIVED"), { success: "Archived — hidden from the site" }),
      },
      {
        label: "Move to trash",
        icon: <Icon.Trash size={14} />,
        tone: "danger",
        onSelect: async () => {
          const ok = await confirm({
            title: `Move “${project.title}” to trash?`,
            description: "It disappears from the site immediately. You can restore it from the Trash tab.",
            confirmLabel: "Move to trash",
            tone: "danger",
          });
          if (ok) run(() => trashProject(project.id), { success: "Moved to trash" });
        },
      },
    ];
  };
}

function Row({
  project,
  view,
  state,
  actions,
}: {
  project: ProjectListRow;
  view: ProjectListView;
  state?: SortableRenderState;
  actions: MenuItem[];
}) {
  const href = view === "trash" ? undefined : `/admin/projects/${project.id}`;
  return (
    <div className="flex items-center gap-3 px-3 py-3 sm:px-4">
      {state ? state.handle : <span className="w-6 shrink-0" />}
      <Thumb src={project.image} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {href ? (
            <Link href={href} className="truncate font-medium text-zinc-900 hover:underline">
              {project.title}
            </Link>
          ) : (
            <span className="truncate font-medium text-zinc-900">{project.title}</span>
          )}
          {project.featured ? (
            <span title="Featured on homepage" className="shrink-0 text-amber-500">
              <Icon.Star size={13} className="fill-current" />
              <span className="sr-only">Featured</span>
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 hidden truncate text-xs text-zinc-500 sm:block">/{project.slug}</p>
        <p className="mt-1 flex items-center gap-2 text-xs text-zinc-500 sm:hidden">
          <StatusBadge status={view === "trash" ? "TRASH" : project.status} />
          <span>{timeAgo(view === "trash" ? project.deletedAt : project.updatedAt)}</span>
        </p>
      </div>
      <div className="hidden w-36 shrink-0 text-[13px] text-zinc-600 lg:block">
        {project.category ?? <span className="text-zinc-300">—</span>}
      </div>
      <div className="hidden w-28 shrink-0 sm:block">
        <StatusBadge status={view === "trash" ? "TRASH" : project.status} />
      </div>
      <div className="hidden w-36 shrink-0 text-[13px] text-zinc-500 md:block">
        {timeAgo(view === "trash" ? project.deletedAt : project.updatedAt)}
        {project.updatedBy ? <span className="block truncate text-xs text-zinc-400">by {project.updatedBy}</span> : null}
      </div>
      <RowMenu items={actions} label={`Actions for ${project.title}`} />
    </div>
  );
}

export function ProjectsList({ rows, view }: { rows: ProjectListRow[]; view: ProjectListView }) {
  const actionsFor = useRowActions(view);
  const sortable = view === "all";

  if (rows.length === 0) {
    return view === "all" ? (
      <AdminEmptyState
        icon={<Icon.Projects size={20} />}
        title="No projects yet."
        description="Start building your portfolio by adding your first project."
        action={
          <AdminLinkButton href="/admin/projects/new" variant="primary">
            <Icon.Plus size={14} /> Add project
          </AdminLinkButton>
        }
      />
    ) : (
      <AdminEmptyState
        icon={view === "trash" ? <Icon.Trash size={20} /> : <Icon.Projects size={20} />}
        title={view === "trash" ? "Trash is empty." : `No ${view} projects.`}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="hidden items-center gap-3 border-b border-zinc-100 bg-zinc-50/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 sm:flex">
        <span className="w-6" />
        <span className="w-16" />
        <span className="flex-1">Project</span>
        <span className="hidden w-36 lg:block">Category</span>
        <span className="w-28">Status</span>
        <span className="hidden w-36 md:block">{view === "trash" ? "Deleted" : "Updated"}</span>
        <span className="w-8" />
      </div>
      {sortable ? (
        <SortableList
          items={rows}
          onReorder={reorderProjects}
          itemLabel={(p) => p.title}
          className="divide-y divide-zinc-100"
          itemClassName="bg-white"
          successMessage="Project order saved"
          renderItem={(project, state) => (
            <Row project={project} view={view} state={state} actions={actionsFor(project)} />
          )}
        />
      ) : (
        <ul className="divide-y divide-zinc-100">
          {rows.map((project) => (
            <li key={project.id}>
              <Row project={project} view={view} actions={actionsFor(project)} />
            </li>
          ))}
        </ul>
      )}
      {sortable ? (
        <p className="border-t border-zinc-100 bg-zinc-50/60 px-4 py-2 text-xs text-zinc-500">
          Drag <Icon.Grip size={12} className="inline align-[-2px]" /> to set the order projects appear on the site.{" "}
          <Badge tone="amber" className="ml-1">
            <Icon.Star size={10} className="fill-current" /> Featured
          </Badge>{" "}
          projects show on the homepage.
        </p>
      ) : null}
    </div>
  );
}
