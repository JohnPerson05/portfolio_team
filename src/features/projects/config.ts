/**
 * Projects section configuration + small pure helpers.
 */

import type { ProjectView } from "@/types";

/** Maximum number of projects displayed in the homepage "Selected work" section. */
export const MAX_FEATURED = 6;

/** Default eyebrow label shown above the section heading. */
export const PROJECTS_EYEBROW = "Selected work";
/** Default section heading. */
export const PROJECTS_HEADING = "Real problems, solved.";

/**
 * Order projects for public display (by `displayOrder`) and cap at
 * {@link MAX_FEATURED}. The public query already orders; this keeps the
 * invariant for injected data too.
 */
export function selectFeatured(projects: readonly ProjectView[]): ProjectView[] {
  return [...projects]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .slice(0, MAX_FEATURED);
}

/**
 * A project link is rendered if and only if its URL is non-empty, so an
 * absent URL never produces an empty/broken link.
 */
export function hasLink(url?: string | null): url is string {
  return typeof url === "string" && url.trim().length > 0;
}

/** Hosts whose players may be embedded in a case-study gallery. */
const EMBED_HOSTS = [
  "www.youtube.com",
  "youtube.com",
  "www.youtube-nocookie.com",
  "player.vimeo.com",
  "www.loom.com",
  "embed.figma.com",
  "www.figma.com",
];

/** Only allow https embeds from known video/design hosts. */
export function isAllowedEmbed(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && EMBED_HOSTS.includes(parsed.hostname);
  } catch {
    return false;
  }
}

/** Distinct categories in display order, for the work filter. */
export function projectCategories(projects: readonly ProjectView[]): string[] {
  const seen = new Set<string>();
  for (const project of projects) {
    if (project.category) seen.add(project.category);
  }
  return [...seen];
}
