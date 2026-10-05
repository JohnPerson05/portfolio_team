import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectDetail } from "@/features/projects";
import { getProjectForPreview, getProjectPreviewMeta } from "@/server/admin/queries";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const meta = await getProjectPreviewMeta(id);
  return { title: meta ? `Preview · ${meta.title}` : "Preview" };
}

const STATUS_COPY: Record<string, string> = {
  PUBLISHED: "Live — this is what visitors see",
  DRAFT: "Draft — not visible to the public",
  ARCHIVED: "Archived — not visible to the public",
};

/** Exactly the public case study, rendered from the saved (possibly unpublished) project. */
export default async function ProjectPreviewPage({ params }: Props) {
  const { id } = await params;
  const [project, meta] = await Promise.all([getProjectForPreview(id), getProjectPreviewMeta(id)]);
  if (!project || !meta) notFound();

  const statusLabel = meta.deletedAt ? "In trash — not visible to the public" : STATUS_COPY[meta.status];

  return (
    <>
      <div
        role="status"
        className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-2 border-b border-amber-300/30 bg-amber-400 px-4 py-2 text-[13px] font-medium text-zinc-950"
      >
        <span className="flex items-center gap-2">
          <span className="rounded bg-zinc-950 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
            Preview
          </span>
          {statusLabel}
        </span>
        <span className="flex items-center gap-3">
          {meta.status === "PUBLISHED" && !meta.deletedAt ? (
            <Link href={`/projects/${meta.slug}`} className="underline underline-offset-2">
              Open live page
            </Link>
          ) : null}
          <Link href={`/admin/projects/${id}`} className="rounded bg-zinc-950 px-2.5 py-1 text-amber-200 hover:bg-zinc-800">
            Back to editor
          </Link>
        </span>
      </div>
      <main>
        <ProjectDetail project={project} />
      </main>
    </>
  );
}
