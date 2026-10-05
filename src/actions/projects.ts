"use server";

import type { Prisma, ProjectStatus } from "@prisma/client";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import {
  idSchema,
  projectSchema,
  publishBlockers,
  reorderSchema,
  type ProjectData,
  type ProjectInput,
} from "@/lib/validation";
import { logActivity } from "@/server/admin/activity";
import {
  nullify,
  persistenceFailure,
  revalidateSite,
  validationFailure,
} from "@/server/admin/mutations";
import type { ActionResult } from "@/types";

/**
 * Project CMS actions. Each one: requireAdmin → validate → mutate → log →
 * revalidate. See `src/server/admin/mutations.ts`.
 */

export type SaveIntent = "draft" | "publish" | "save";

export interface SavedProject {
  id: string;
  status: ProjectStatus;
  slug: string;
  updatedAt: string;
}

function projectColumns(data: ProjectData) {
  const { technologyIds: _t, media: _m, ...columns } = data;
  return nullify(columns);
}

async function writeRelations(
  tx: Prisma.TransactionClient,
  projectId: string,
  data: ProjectData,
): Promise<void> {
  // Technologies: replace the set.
  await tx.projectTechnology.deleteMany({ where: { projectId } });
  const techIds = [...new Set(data.technologyIds)];
  if (techIds.length > 0) {
    const existing = await tx.technology.findMany({
      where: { id: { in: techIds } },
      select: { id: true },
    });
    await tx.projectTechnology.createMany({
      data: existing.map(({ id }) => ({ projectId, technologyId: id })),
    });
  }

  // Media: keep rows whose id is still present, delete the rest, then write
  // every item with its new position.
  const keepIds = data.media.map((m) => m.id).filter((id): id is string => !!id);
  await tx.projectMedia.deleteMany({
    where: { projectId, id: { notIn: keepIds } },
  });
  for (const [index, item] of data.media.entries()) {
    const fields = {
      mediaType: item.mediaType,
      url: item.url,
      thumbnailUrl: item.thumbnailUrl ?? null,
      title: item.title ?? null,
      caption: item.caption ?? null,
      altText: item.altText ?? null,
      displayOrder: index,
    };
    const updated = item.id
      ? await tx.projectMedia.updateMany({
          where: { id: item.id, projectId },
          data: fields,
        })
      : { count: 0 };
    if (updated.count === 0) {
      await tx.projectMedia.create({ data: { ...fields, projectId } });
    }
  }
}

/**
 * Create or update a project.
 *
 *  - `draft`   → status DRAFT (incomplete content allowed). Used by autosave.
 *  - `publish` → status PUBLISHED; requires the full story.
 *  - `save`    → keep the current status (editing a live project). If the
 *                project is live, the full story is still required.
 */
export async function saveProject(
  id: string | null,
  input: ProjectInput,
  intent: SaveIntent = "save",
): Promise<ActionResult<SavedProject>> {
  const admin = await requireAdmin();

  if (id !== null && !idSchema.safeParse(id).success) {
    return { success: false, formError: "Missing project id." };
  }

  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const data = parsed.data;

  try {
    const current = id
      ? await prisma.project.findFirst({
          where: { id, deletedAt: null },
          select: { status: true, publishedAt: true },
        })
      : null;
    if (id && !current) {
      return { success: false, formError: "This project no longer exists." };
    }

    const status: ProjectStatus =
      intent === "publish"
        ? "PUBLISHED"
        : intent === "draft"
          ? "DRAFT"
          : (current?.status ?? "DRAFT");

    if (status === "PUBLISHED") {
      const blockers = publishBlockers(data);
      if (blockers) {
        return {
          success: false,
          fieldErrors: blockers,
          formError: "Finish the story before publishing.",
        };
      }
    }

    const publishedAt =
      status === "PUBLISHED" ? (current?.publishedAt ?? new Date()) : current?.publishedAt ?? null;

    const saved = await prisma.$transaction(async (tx) => {
      const row = id
        ? await tx.project.update({
            where: { id },
            data: { ...projectColumns(data), status, publishedAt, updatedById: admin.id },
          })
        : await tx.project.create({
            data: { ...projectColumns(data), status, publishedAt, updatedById: admin.id },
          });
      await writeRelations(tx, row.id, data);
      return row;
    });

    const verb = !id ? "created" : intent === "publish" && current?.status !== "PUBLISHED" ? "published" : "updated";
    await logActivity(admin, {
      action: `project.${verb === "created" ? "create" : verb === "published" ? "publish" : "update"}`,
      entityType: "project",
      entityId: saved.id,
      summary: `${verb[0]?.toUpperCase()}${verb.slice(1)} project “${saved.title}”`,
    });
    revalidateSite();

    return {
      success: true,
      data: {
        id: saved.id,
        status: saved.status,
        slug: saved.slug,
        updatedAt: saved.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    return persistenceFailure(error, "project");
  }
}

/** Publish, unpublish (back to draft), or archive a project. */
export async function setProjectStatus(
  id: string,
  status: ProjectStatus,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!idSchema.safeParse(id).success) return { success: false, formError: "Missing project id." };
  if (!["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) {
    return { success: false, formError: "Unknown status." };
  }

  try {
    const project = await prisma.project.findFirst({ where: { id, deletedAt: null } });
    if (!project) return { success: false, formError: "This project no longer exists." };

    if (status === "PUBLISHED") {
      const blockers = publishBlockers(project);
      if (blockers) {
        return {
          success: false,
          formError: `Can't publish yet — missing: ${Object.keys(blockers).join(", ")}. Open the editor to finish it.`,
        };
      }
    }

    await prisma.project.update({
      where: { id },
      data: {
        status,
        updatedById: admin.id,
        ...(status === "PUBLISHED" && !project.publishedAt ? { publishedAt: new Date() } : {}),
      },
    });
    const verb = status === "PUBLISHED" ? "Published" : status === "ARCHIVED" ? "Archived" : "Unpublished";
    await logActivity(admin, {
      action: `project.${status.toLowerCase()}`,
      entityType: "project",
      entityId: id,
      summary: `${verb} project “${project.title}”`,
    });
    revalidateSite();
    return { success: true };
  } catch (error) {
    return persistenceFailure(error, "project");
  }
}

export async function setProjectFeatured(id: string, featured: boolean): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!idSchema.safeParse(id).success) return { success: false, formError: "Missing project id." };
  try {
    const project = await prisma.project.update({
      where: { id },
      data: { featured: Boolean(featured), updatedById: admin.id },
    });
    await logActivity(admin, {
      action: featured ? "project.feature" : "project.unfeature",
      entityType: "project",
      entityId: id,
      summary: `${featured ? "Featured" : "Unfeatured"} project “${project.title}”`,
    });
    revalidateSite();
    return { success: true };
  } catch (error) {
    return persistenceFailure(error, "project");
  }
}

/** Copy a project (content, media, technologies) into a new draft. */
export async function duplicateProject(id: string): Promise<ActionResult<{ id: string }>> {
  const admin = await requireAdmin();
  if (!idSchema.safeParse(id).success) return { success: false, formError: "Missing project id." };

  try {
    const source = await prisma.project.findFirst({
      where: { id, deletedAt: null },
      include: { media: true, technologies: true },
    });
    if (!source) return { success: false, formError: "This project no longer exists." };

    let slug = `${source.slug}-copy`.slice(0, 110);
    for (let n = 2; await prisma.project.findUnique({ where: { slug } }); n += 1) {
      slug = `${source.slug}-copy-${n}`.slice(0, 120);
    }

    const {
      id: _id,
      createdAt: _c,
      updatedAt: _u,
      publishedAt: _p,
      deletedAt: _d,
      media,
      technologies,
      ...rest
    } = source;

    const copy = await prisma.project.create({
      data: {
        ...rest,
        title: `${source.title} (copy)`.slice(0, 140),
        slug,
        status: "DRAFT",
        featured: false,
        updatedById: admin.id,
        media: {
          create: media.map(({ id: _mid, projectId: _pid, createdAt: _mc, ...m }) => m),
        },
        technologies: {
          create: technologies.map(({ technologyId }) => ({ technologyId })),
        },
      },
    });
    await logActivity(admin, {
      action: "project.duplicate",
      entityType: "project",
      entityId: copy.id,
      summary: `Duplicated “${source.title}”`,
    });
    revalidateSite();
    return { success: true, data: { id: copy.id } };
  } catch (error) {
    return persistenceFailure(error, "project");
  }
}

/** Move to trash (soft delete). Recoverable via {@link restoreProject}. */
export async function trashProject(id: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!idSchema.safeParse(id).success) return { success: false, formError: "Missing project id." };
  try {
    const project = await prisma.project.update({
      where: { id },
      data: { deletedAt: new Date(), featured: false, updatedById: admin.id },
    });
    await logActivity(admin, {
      action: "project.trash",
      entityType: "project",
      entityId: id,
      summary: `Moved project “${project.title}” to trash`,
    });
    revalidateSite();
    return { success: true };
  } catch (error) {
    return persistenceFailure(error, "project");
  }
}

export async function restoreProject(id: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!idSchema.safeParse(id).success) return { success: false, formError: "Missing project id." };
  try {
    // Restored projects come back as drafts so nothing reappears publicly by surprise.
    const project = await prisma.project.update({
      where: { id },
      data: { deletedAt: null, status: "DRAFT", updatedById: admin.id },
    });
    await logActivity(admin, {
      action: "project.restore",
      entityType: "project",
      entityId: id,
      summary: `Restored project “${project.title}” as a draft`,
    });
    revalidateSite();
    return { success: true };
  } catch (error) {
    return persistenceFailure(error, "project");
  }
}

/** Permanently delete a project that is already in the trash. */
export async function deleteProjectPermanently(id: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!idSchema.safeParse(id).success) return { success: false, formError: "Missing project id." };
  try {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return { success: true };
    if (!project.deletedAt) {
      return { success: false, formError: "Move the project to trash before deleting it permanently." };
    }
    await prisma.project.delete({ where: { id } });
    await logActivity(admin, {
      action: "project.delete",
      entityType: "project",
      entityId: id,
      summary: `Permanently deleted project “${project.title}”`,
    });
    revalidateSite();
    return { success: true };
  } catch (error) {
    return persistenceFailure(error, "project");
  }
}

/** Persist a drag-and-drop order. `ids` is the full list in its new order. */
export async function reorderProjects(ids: string[]): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = reorderSchema.safeParse(ids);
  if (!parsed.success) return { success: false, formError: "Invalid order." };
  try {
    await prisma.$transaction(
      parsed.data.map((id, index) =>
        prisma.project.update({ where: { id }, data: { displayOrder: index } }),
      ),
    );
    await logActivity(admin, {
      action: "project.reorder",
      entityType: "project",
      summary: "Reordered projects",
    });
    revalidateSite();
    return { success: true };
  } catch (error) {
    return persistenceFailure(error, "project");
  }
}
