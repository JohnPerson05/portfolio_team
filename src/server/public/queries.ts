import { cache } from "react";
import type { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";
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
import {
  toTestimonialView,
  type HomepageSectionView,
  type NavLinkView,
  type ProcessStepView,
  type ProjectView,
  type ServiceView,
  type TeamMemberView,
  type TestimonialView,
} from "@/types";

/**
 * Public read model.
 *
 * EVERY query the public website makes goes through this module, and every
 * query here filters on publication state. Draft, archived, unpublished, and
 * soft-deleted rows can never reach a public page through these functions.
 * The admin preview is the only place that renders unpublished content, and it
 * uses `getProjectForPreview` behind `requireAdmin()`.
 *
 * Functions are wrapped in React `cache()` so `generateMetadata` and the page
 * share one query per request.
 */

/* -------------------------------------------------------------------------- */
/* Projects                                                                   */
/* -------------------------------------------------------------------------- */

export const PUBLIC_PROJECT_WHERE = {
  status: "PUBLISHED",
  deletedAt: null,
} satisfies Prisma.ProjectWhereInput;

export const projectInclude = {
  media: { orderBy: { displayOrder: "asc" } },
  technologies: {
    where: { technology: { isActive: true } },
    include: { technology: true },
    orderBy: { technology: { displayOrder: "asc" } },
  },
} satisfies Prisma.ProjectInclude;

export type ProjectWithRelations = Prisma.ProjectGetPayload<{
  include: typeof projectInclude;
}>;

const PUBLIC_ORDER: Prisma.ProjectOrderByWithRelationInput[] = [
  { displayOrder: "asc" },
  { publishedAt: "desc" },
];

/** The number of projects shown in the homepage "Selected work" section. */
export const HOMEPAGE_PROJECT_LIMIT = 6;

function opt<T>(value: T | null | undefined): T | undefined {
  return value === null || value === undefined || value === ""
    ? undefined
    : value;
}

export function toProjectView(row: ProjectWithRelations): ProjectView {
  const firstImage = row.media.find(
    (m) => m.mediaType === "IMAGE" || m.mediaType === "GIF",
  )?.url;
  const coverImage = opt(row.coverImage) ?? firstImage;

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: opt(row.category),
    tagline: opt(row.tagline),
    shortDescription: row.shortDescription,
    description: opt(row.description),
    problem: row.problem,
    solution: row.solution,
    result: row.result,
    coverImage,
    heroImage: opt(row.heroImage) ?? coverImage,
    projectUrl: opt(row.projectUrl),
    githubUrl: opt(row.githubUrl),
    otherUrl: opt(row.otherUrl),
    otherUrlLabel: opt(row.otherUrlLabel),
    clientName: opt(row.clientName),
    year: opt(row.year),
    featured: row.featured,
    displayOrder: row.displayOrder,
    seoTitle: opt(row.seoTitle),
    seoDescription: opt(row.seoDescription),
    ogImage: opt(row.ogImage),
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    updatedAt: row.updatedAt.toISOString(),
    media: row.media.map((m) => ({
      id: m.id,
      mediaType: m.mediaType,
      url: m.url,
      thumbnailUrl: opt(m.thumbnailUrl),
      title: opt(m.title),
      caption: opt(m.caption),
      altText: opt(m.altText),
    })),
    technologies: row.technologies.map(({ technology }) => ({
      name: technology.name,
      slug: technology.slug,
      icon: opt(technology.icon),
    })),
  };
}

/**
 * Projects for the homepage: featured ones first (in their display order). If
 * nothing is featured yet, fall back to the newest published work so the
 * section is never empty while there is published content.
 */
export const getFeaturedProjects = cache(async (): Promise<ProjectView[]> => {
  const featured = await prisma.project.findMany({
    where: { ...PUBLIC_PROJECT_WHERE, featured: true },
    include: projectInclude,
    orderBy: PUBLIC_ORDER,
    take: HOMEPAGE_PROJECT_LIMIT,
  });
  if (featured.length > 0) return featured.map(toProjectView);

  const latest = await prisma.project.findMany({
    where: PUBLIC_PROJECT_WHERE,
    include: projectInclude,
    orderBy: PUBLIC_ORDER,
    take: HOMEPAGE_PROJECT_LIMIT,
  });
  return latest.map(toProjectView);
});

export const getPublishedProjects = cache(async (): Promise<ProjectView[]> => {
  const rows = await prisma.project.findMany({
    where: PUBLIC_PROJECT_WHERE,
    include: projectInclude,
    orderBy: PUBLIC_ORDER,
  });
  return rows.map(toProjectView);
});

export const getPublishedProjectBySlug = cache(
  async (slug: string): Promise<ProjectView | null> => {
    const row = await prisma.project.findFirst({
      where: { ...PUBLIC_PROJECT_WHERE, slug },
      include: projectInclude,
    });
    return row ? toProjectView(row) : null;
  },
);

/** Published neighbours for "next project" navigation on a case study. */
export const getAdjacentProjects = cache(
  async (
    slug: string,
  ): Promise<{ previous?: ProjectView; next?: ProjectView }> => {
    const all = await getPublishedProjects();
    const index = all.findIndex((p) => p.slug === slug);
    if (index === -1 || all.length < 2) return {};
    return {
      previous: all[(index - 1 + all.length) % all.length],
      next: all[(index + 1) % all.length],
    };
  },
);

/* -------------------------------------------------------------------------- */
/* Team, services, process, testimonials                                      */
/* -------------------------------------------------------------------------- */

export function initialsFor(name: string): string {
  const letters = name
    .replace(/\[|\]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  return letters || "+";
}

export const getTeamMembers = cache(async (): Promise<TeamMemberView[]> => {
  const rows = await prisma.teamMember.findMany({
    where: { isPublished: true, deletedAt: null },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  });
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    role: row.role,
    shortBio: opt(row.shortBio),
    bio: opt(row.bio),
    profileImage: opt(row.profileImage),
    location: opt(row.location),
    email: opt(row.email),
    website: opt(row.website),
    linkedin: opt(row.linkedin),
    github: opt(row.github),
    responsibilities: row.responsibilities ?? [],
    skills: row.skills ?? [],
    experience: opt(row.experience),
    isFeatured: row.isFeatured,
    initials: initialsFor(row.name),
  }));
});

export const getServices = cache(async (): Promise<ServiceView[]> => {
  const rows = await prisma.service.findMany({
    where: { isPublished: true },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  });
  return rows.map((row, index) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    shortDescription: row.shortDescription,
    description: opt(row.description),
    icon: opt(row.icon),
    image: opt(row.image),
    leadLabel: opt(row.leadLabel),
    number: String(index + 1).padStart(2, "0"),
  }));
});

export const getProcessSteps = cache(async (): Promise<ProcessStepView[]> => {
  const rows = await prisma.processStep.findMany({
    where: { isPublished: true },
    orderBy: [{ displayOrder: "asc" }, { stepNumber: "asc" }],
  });
  return rows.map((row, index) => ({
    id: row.id,
    // Numbering follows the published order so gaps never show publicly.
    stepNumber: index + 1,
    title: row.title,
    headline: opt(row.headline),
    description: row.description,
    visual: opt(row.visual),
  }));
});

export const getTestimonials = cache(async (): Promise<TestimonialView[]> => {
  const rows = await prisma.testimonial.findMany({
    where: { isPublished: true },
    orderBy: [{ isFeatured: "desc" }, { displayOrder: "asc" }],
    include: {
      project: {
        select: { title: true, slug: true, status: true, deletedAt: true },
      },
    },
  });
  return rows.map(({ project, ...row }) =>
    toTestimonialView({
      ...row,
      // Only link to a project the public can actually open.
      project:
        project && project.status === "PUBLISHED" && !project.deletedAt
          ? { title: project.title, slug: project.slug }
          : null,
    }),
  );
});

/* -------------------------------------------------------------------------- */
/* Settings, sections, navigation                                             */
/* -------------------------------------------------------------------------- */

/**
 * Site settings merged over registry defaults. Never throws: if the database
 * is unreachable, the site still renders with defaults (and the error is
 * logged) so the shell — navbar, footer, metadata — always works.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const settings = defaultSettings();
  try {
    const rows = await prisma.siteSetting.findMany();
    const target = settings as unknown as Record<string, unknown>;
    for (const row of rows) {
      if (isSettingKey(row.key)) {
        target[row.key] = coerceSetting(row.key, row.value);
      }
    }
  } catch (error) {
    console.error("Failed to load site settings; using defaults", error);
  }
  return settings;
});

/** Enabled homepage sections in display order. */
export const getHomepageSections = cache(
  async (): Promise<HomepageSectionView[]> => {
    try {
      const rows = await prisma.homepageSection.findMany({
        orderBy: { displayOrder: "asc" },
      });
      if (rows.length > 0) {
        return rows
          .filter((row) => row.isEnabled)
          .map((row) => ({
            key: row.key,
            label: row.label,
            eyebrow: opt(row.eyebrow),
            title: opt(row.title),
            description: opt(row.description),
          }));
      }
    } catch (error) {
      console.error("Failed to load homepage sections; using defaults", error);
    }
    return HOMEPAGE_SECTION_DEFAULTS;
  },
);

/** Look up one homepage section's copy (even if disabled on the homepage). */
export const getSectionCopy = cache(
  async (key: string): Promise<HomepageSectionView | undefined> => {
    const fallback = HOMEPAGE_SECTION_DEFAULTS.find((s) => s.key === key);
    try {
      const row = await prisma.homepageSection.findUnique({ where: { key } });
      if (row) {
        return {
          key: row.key,
          label: row.label,
          eyebrow: opt(row.eyebrow) ?? fallback?.eyebrow,
          title: opt(row.title) ?? fallback?.title,
          description: opt(row.description) ?? fallback?.description,
        };
      }
    } catch (error) {
      console.error(`Failed to load section "${key}"`, error);
    }
    return fallback;
  },
);

export const getNavigation = cache(
  async (): Promise<{ header: NavLinkView[]; footer: NavLinkView[] }> => {
    let items: { label: string; href: string; location: string }[] =
      NAVIGATION_DEFAULTS;
    try {
      const rows = await prisma.navigationItem.findMany({
        where: { isVisible: true },
        orderBy: { displayOrder: "asc" },
      });
      const total = await prisma.navigationItem.count();
      // An empty table means "not configured yet" → defaults. If rows exist
      // but are all hidden, respect that.
      if (total > 0) items = rows;
    } catch (error) {
      console.error("Failed to load navigation; using defaults", error);
    }
    const pick = (location: string) =>
      items
        .filter((item) => item.location === location)
        .map(({ label, href }) => ({ label, href }));
    return { header: pick("HEADER"), footer: pick("FOOTER") };
  },
);

/** Social links that have actually been filled in. */
export function socialLinks(settings: SiteSettings): NavLinkView[] {
  return [
    { label: "LinkedIn", href: settings["social.linkedin"] },
    { label: "GitHub", href: settings["social.github"] },
    { label: "X", href: settings["social.x"] },
  ].filter((link) => link.href.trim() !== "");
}
