import type { Metadata } from "next";
import type { PostView, ProjectView, TeamMemberView } from "@/types";
import {
  SETTINGS_REGISTRY,
  type SiteSettings,
} from "@/server/settings/registry";

const fallbackUrl = "http://localhost:3000";

/**
 * Static fallbacks only. Live values (studio name, default title/description,
 * share image) come from CMS settings — use {@link pageMetadata}.
 */
export const siteConfig = {
  name: SETTINGS_REGISTRY["studio.name"].defaultValue,
  title: SETTINGS_REGISTRY["seo.title"].defaultValue,
  description: SETTINGS_REGISTRY["seo.description"].defaultValue,
  locale: "en_US",
  avatar: SETTINGS_REGISTRY["seo.ogImage"].defaultValue,
} as const;

export function getSiteUrl(): URL {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  try {
    return new URL(configured || fallbackUrl);
  } catch {
    return new URL(fallbackUrl);
  }
}

export function absoluteUrl(path: string): string {
  return new URL(path, getSiteUrl()).toString();
}

export interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  /** Studio name for OpenGraph `siteName`. */
  siteName?: string;
}

/** Build canonical + OpenGraph + Twitter metadata for a page. */
export function createPageMetadata({
  title,
  description,
  path,
  image = siteConfig.avatar,
  type = "website",
  siteName = siteConfig.name,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName,
      locale: siteConfig.locale,
      images: [{ url: imageUrl, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

/**
 * {@link createPageMetadata} with CMS defaults applied: the share image falls
 * back to `seo.ogImage` and `siteName` to `studio.name`.
 */
export async function pageMetadata(
  input: Omit<PageMetadataInput, "siteName">,
): Promise<Metadata> {
  // Imported lazily so this module stays usable in non-server contexts/tests.
  const { getSiteSettings } = await import("@/server/public/queries");
  const settings = await getSiteSettings();
  return createPageMetadata({
    ...input,
    image: input.image || settings["seo.ogImage"] || siteConfig.avatar,
    siteName: settings["studio.name"],
  });
}

/** Organization JSON-LD for the studio and its (published) team. */
export function studioJsonLd(
  settings: Pick<
    SiteSettings,
    | "studio.name"
    | "studio.tagline"
    | "seo.description"
    | "seo.ogImage"
    | "social.linkedin"
    | "social.github"
    | "social.x"
  >,
  team: readonly Pick<TeamMemberView, "name" | "role" | "profileImage">[] = [],
) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: settings["studio.name"],
    url: getSiteUrl().toString(),
    image: absoluteUrl(settings["seo.ogImage"] || siteConfig.avatar),
    description: settings["seo.description"],
    slogan: settings["studio.tagline"],
    sameAs: [settings["social.linkedin"], settings["social.github"], settings["social.x"]].filter(
      Boolean,
    ),
    employee: team.map((member) => ({
      "@type": "Person",
      name: member.name,
      jobTitle: member.role,
      ...(member.profileImage ? { image: absoluteUrl(member.profileImage) } : {}),
    })),
  };
}

/** CreativeWork JSON-LD for a case study page. */
export function projectJsonLd(project: ProjectView, studioName: string) {
  const url = absoluteUrl(`/projects/${project.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    headline: project.seoTitle ?? project.title,
    description: project.seoDescription ?? project.summary,
    url,
    mainEntityOfPage: url,
    ...(project.ogImage || project.thumbnailUrl
      ? { image: absoluteUrl((project.ogImage ?? project.thumbnailUrl) as string) }
      : {}),
    ...(project.category ? { genre: project.category } : {}),
    ...(project.publishedAt ? { datePublished: project.publishedAt } : {}),
    ...(project.updatedAt ? { dateModified: project.updatedAt } : {}),
    ...(project.technologies.length > 0
      ? { keywords: project.technologies.join(", ") }
      : {}),
    creator: { "@type": "Organization", name: studioName, url: getSiteUrl().toString() },
  };
}

export function blogPostingJsonLd(post: PostView, studioName: string = siteConfig.name) {
  const url = absoluteUrl(`/blog/${post.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    url,
    mainEntityOfPage: url,
    ...(post.coverUrl ? { image: absoluteUrl(post.coverUrl) } : {}),
    ...(post.publishedAt
      ? {
          datePublished: post.publishedAt,
          dateModified: post.publishedAt,
        }
      : {}),
    author: {
      "@type": "Organization",
      name: studioName,
      url: getSiteUrl().toString(),
    },
    publisher: {
      "@type": "Organization",
      name: studioName,
    },
  };
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
