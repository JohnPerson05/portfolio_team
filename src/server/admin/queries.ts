import type { Prisma, ProjectStatus } from "@prisma/client";

import prisma from "@/lib/prisma";
import { projectInclude, toProjectView } from "@/server/public/queries";
import {
  coerceSetting,
  defaultSettings,
  isSettingKey,
  type SiteSettings,
} from "@/server/settings/registry";
import {
  HOMEPAGE_SECTION_DEFAULTS,
  NAVIGATION_DEFAULTS,
} from "@/server/content/defaults";
import { findMediaUsage } from "@/server/media/usage";
import type { ProjectView } from "@/types";

/**
 * Admin read model. Only ever called from pages/layouts under the admin
 * layout (which runs `requireAdmin()`), never from public pages. Unlike the
 * public queries these return drafts, archived, and trashed rows.
 */

/* -------------------------------------------------------------------------- */
/* Dashboard                                                                  */
/* -------------------------------------------------------------------------- */

export async function getDashboardData() {
  const [
    projectsByStatus,
    team,
    services,
    testimonials,
    technologies,
    recentProjects,
    activity,
    unreadContacts,
  ] = await Promise.all([
    prisma.project.groupBy({
      by: ["status"],
      where: { deletedAt: null },
      _count: { _all: true },
    }),
    prisma.teamMember.groupBy({
      by: ["isPublished"],
      where: { deletedAt: null },
      _count: { _all: true },
    }),
    prisma.service.groupBy({ by: ["isPublished"], _count: { _all: true } }),
    prisma.testimonial.groupBy({ by: ["isPublished"], _count: { _all: true } }),
    prisma.technology.count({ where: { isActive: true } }),
    prisma.project.findMany({
      where: { deletedAt: null },
      orderBy: { updatedAt: "desc" },
      take: 6,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
        coverImage: true,
        media: { take: 1, orderBy: { displayOrder: "asc" }, select: { url: true } },
        updatedBy: { select: { name: true } },
      },
    }),
    prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { actor: { select: { name: true } } },
    }),
    prisma.contactSubmission.count({ where: { readAt: null } }),
  ]);

  const statusCount = (s: ProjectStatus) =>
    projectsByStatus.find((r) => r.status === s)?._count._all ?? 0;
  const split = (rows: { isPublished: boolean; _count: { _all: number } }[]) => ({
    total: rows.reduce((sum, r) => sum + r._count._all, 0),
    published: rows.find((r) => r.isPublished)?._count._all ?? 0,
  });

  return {
    projects: {
      total: projectsByStatus.reduce((sum, r) => sum + r._count._all, 0),
      published: statusCount("PUBLISHED"),
      drafts: statusCount("DRAFT"),
      archived: statusCount("ARCHIVED"),
    },
    team: split(team),
    services: split(services),
    testimonials: split(testimonials),
    technologies,
    recentProjects: recentProjects.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      status: p.status,
      updatedAt: p.updatedAt.toISOString(),
      image: p.coverImage ?? p.media[0]?.url ?? null,
      updatedBy: p.updatedBy?.name ?? null,
    })),
    activity: activity.map((a) => ({
      id: a.id,
      summary: a.summary,
      actor: a.actor?.name ?? null,
      createdAt: a.createdAt.toISOString(),
    })),
    unreadContacts,
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

/* -------------------------------------------------------------------------- */
/* Projects                                                                   */
/* -------------------------------------------------------------------------- */

export type ProjectListView = "all" | "published" | "draft" | "archived" | "trash";

export async function listProjects(view: ProjectListView = "all") {
  const where: Prisma.ProjectWhereInput =
    view === "trash"
      ? { deletedAt: { not: null } }
      : view === "all"
        ? { deletedAt: null }
        : { deletedAt: null, status: view.toUpperCase() as ProjectStatus };

  const [rows, counts, trash] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: view === "trash" ? { deletedAt: "desc" } : [{ displayOrder: "asc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        status: true,
        featured: true,
        displayOrder: true,
        updatedAt: true,
        deletedAt: true,
        coverImage: true,
        media: { take: 1, orderBy: { displayOrder: "asc" }, select: { url: true } },
        updatedBy: { select: { name: true } },
        _count: { select: { media: true } },
      },
    }),
    prisma.project.groupBy({ by: ["status"], where: { deletedAt: null }, _count: { _all: true } }),
    prisma.project.count({ where: { deletedAt: { not: null } } }),
  ]);

  const count = (s: ProjectStatus) => counts.find((c) => c.status === s)?._count._all ?? 0;

  return {
    rows: rows.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      category: p.category,
      status: p.status,
      featured: p.featured,
      updatedAt: p.updatedAt.toISOString(),
      deletedAt: p.deletedAt?.toISOString() ?? null,
      image: p.coverImage ?? p.media[0]?.url ?? null,
      updatedBy: p.updatedBy?.name ?? null,
      mediaCount: p._count.media,
    })),
    counts: {
      all: counts.reduce((s, c) => s + c._count._all, 0),
      published: count("PUBLISHED"),
      draft: count("DRAFT"),
      archived: count("ARCHIVED"),
      trash,
    },
  };
}

export type ProjectListRow = Awaited<ReturnType<typeof listProjects>>["rows"][number];

export async function getProjectForEdit(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      media: { orderBy: { displayOrder: "asc" } },
      technologies: { select: { technologyId: true } },
      updatedBy: { select: { name: true } },
    },
  });
  if (!project) return null;
  return {
    ...project,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    publishedAt: project.publishedAt?.toISOString() ?? null,
    deletedAt: project.deletedAt?.toISOString() ?? null,
    technologyIds: project.technologies.map((t) => t.technologyId),
    updatedByName: project.updatedBy?.name ?? null,
  };
}

export type ProjectForEdit = NonNullable<Awaited<ReturnType<typeof getProjectForEdit>>>;

/** Any project (draft, archived, trashed) rendered as the public page would. */
export async function getProjectForPreview(id: string): Promise<ProjectView | null> {
  const row = await prisma.project.findUnique({ where: { id }, include: projectInclude });
  return row ? toProjectView(row) : null;
}

export async function getProjectPreviewMeta(id: string) {
  return prisma.project.findUnique({
    where: { id },
    select: { id: true, status: true, slug: true, deletedAt: true, title: true },
  });
}

export async function listProjectOptions() {
  return prisma.project.findMany({
    where: { deletedAt: null },
    orderBy: { title: "asc" },
    select: { id: true, title: true, status: true },
  });
}

/** Distinct categories already in use, for the editor's suggestions. */
export async function listProjectCategories(): Promise<string[]> {
  const rows = await prisma.project.findMany({
    where: { category: { not: null } },
    distinct: ["category"],
    select: { category: true },
  });
  return rows.map((r) => r.category).filter((c): c is string => !!c).sort();
}

/* -------------------------------------------------------------------------- */
/* Technologies                                                               */
/* -------------------------------------------------------------------------- */

export async function listTechnologies() {
  const rows = await prisma.technology.findMany({
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { projects: true } } },
  });
  return rows.map(({ _count, ...t }) => ({ ...t, projectCount: _count.projects }));
}

export type TechnologyRow = Awaited<ReturnType<typeof listTechnologies>>[number];

/* -------------------------------------------------------------------------- */
/* Team / services / process / testimonials                                   */
/* -------------------------------------------------------------------------- */

export async function listTeamMembers() {
  const rows = await prisma.teamMember.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  });
  return rows.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
    deletedAt: m.deletedAt?.toISOString() ?? null,
  }));
}

export type TeamMemberRow = Awaited<ReturnType<typeof listTeamMembers>>[number];

export async function getTeamMember(id: string) {
  const m = await prisma.teamMember.findUnique({ where: { id } });
  return m
    ? { ...m, createdAt: m.createdAt.toISOString(), updatedAt: m.updatedAt.toISOString(), deletedAt: m.deletedAt?.toISOString() ?? null }
    : null;
}

export async function listServices() {
  const rows = await prisma.service.findMany({ orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] });
  return rows.map((s) => ({ ...s, createdAt: s.createdAt.toISOString(), updatedAt: s.updatedAt.toISOString() }));
}

export type ServiceRow = Awaited<ReturnType<typeof listServices>>[number];

export async function listProcessSteps() {
  const rows = await prisma.processStep.findMany({ orderBy: [{ displayOrder: "asc" }, { stepNumber: "asc" }] });
  return rows.map((s) => ({ ...s, createdAt: s.createdAt.toISOString(), updatedAt: s.updatedAt.toISOString() }));
}

export type ProcessStepRow = Awaited<ReturnType<typeof listProcessSteps>>[number];

export async function listTestimonials() {
  const rows = await prisma.testimonial.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    include: { project: { select: { id: true, title: true } } },
  });
  return rows.map((t) => ({ ...t, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString() }));
}

export type TestimonialRow = Awaited<ReturnType<typeof listTestimonials>>[number];

/* -------------------------------------------------------------------------- */
/* Settings / homepage / navigation                                           */
/* -------------------------------------------------------------------------- */

export async function getSettingsForEdit(): Promise<{
  values: SiteSettings;
  updatedAt: string | null;
}> {
  const values = defaultSettings();
  const rows = await prisma.siteSetting.findMany();
  const target = values as unknown as Record<string, unknown>;
  let latest: Date | null = null;
  for (const row of rows) {
    if (!isSettingKey(row.key)) continue;
    target[row.key] = coerceSetting(row.key, row.value);
    if (!latest || row.updatedAt > latest) latest = row.updatedAt;
  }
  return { values, updatedAt: latest?.toISOString() ?? null };
}

export async function listHomepageSectionsForEdit() {
  const rows = await prisma.homepageSection.findMany({ orderBy: { displayOrder: "asc" } });
  const byKey = new Map(rows.map((r) => [r.key, r]));
  const known = new Set(HOMEPAGE_SECTION_DEFAULTS.map((d) => d.key));

  // Saved rows in their saved order, then any section added in code since.
  const ordered = rows
    .filter((r) => known.has(r.key))
    .map((r) => ({
      key: r.key,
      label: r.label,
      eyebrow: r.eyebrow ?? "",
      title: r.title ?? "",
      description: r.description ?? "",
      isEnabled: r.isEnabled,
    }));
  for (const d of HOMEPAGE_SECTION_DEFAULTS) {
    if (!byKey.has(d.key)) {
      ordered.push({
        key: d.key,
        label: d.label,
        eyebrow: d.eyebrow ?? "",
        title: d.title ?? "",
        description: d.description ?? "",
        isEnabled: d.enabled !== false,
      });
    }
  }
  return ordered;
}

export type HomepageSectionRow = Awaited<ReturnType<typeof listHomepageSectionsForEdit>>[number];

export async function listNavigationForEdit() {
  const rows = await prisma.navigationItem.findMany({ orderBy: { displayOrder: "asc" } });
  const source = rows.length > 0 ? rows : NAVIGATION_DEFAULTS.map((d) => ({ ...d, isVisible: true }));
  return source.map((r) => ({
    label: r.label,
    href: r.href,
    location: r.location as "HEADER" | "FOOTER",
    isVisible: r.isVisible,
  }));
}

export type NavigationRow = Awaited<ReturnType<typeof listNavigationForEdit>>[number];

/* -------------------------------------------------------------------------- */
/* Media / admins / activity                                                  */
/* -------------------------------------------------------------------------- */

export async function listMedia() {
  const assets = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
    include: { uploadedBy: { select: { name: true } } },
  });
  const usage = await findMediaUsage(assets.map((a) => a.url));
  return assets.map((a) => ({
    id: a.id,
    url: a.url,
    filename: a.filename,
    contentType: a.contentType,
    size: a.size,
    width: a.width,
    height: a.height,
    createdAt: a.createdAt.toISOString(),
    uploadedBy: a.uploadedBy?.name ?? null,
    usedBy: usage.get(a.url) ?? [],
  }));
}

export type MediaRow = Awaited<ReturnType<typeof listMedia>>[number];

export async function listAdminUsers() {
  const users = await prisma.adminUser.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });
  return users.map((u) => ({
    ...u,
    lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
    createdAt: u.createdAt.toISOString(),
  }));
}

export type AdminUserRow = Awaited<ReturnType<typeof listAdminUsers>>[number];

export const ACTIVITY_PAGE_SIZE = 50;

export async function listActivity(page = 1) {
  const [rows, total] = await Promise.all([
    prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ACTIVITY_PAGE_SIZE,
      take: ACTIVITY_PAGE_SIZE,
      include: { actor: { select: { name: true, email: true } } },
    }),
    prisma.activityLog.count(),
  ]);
  return {
    rows: rows.map((r) => ({
      id: r.id,
      action: r.action,
      entityType: r.entityType,
      entityId: r.entityId,
      summary: r.summary,
      actor: r.actor?.name ?? "System",
      createdAt: r.createdAt.toISOString(),
    })),
    total,
    pages: Math.max(1, Math.ceil(total / ACTIVITY_PAGE_SIZE)),
  };
}
