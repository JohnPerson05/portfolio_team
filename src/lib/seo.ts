import type { Metadata } from "next";
import type { PostView } from "@/types";
import { STUDIO, TEAM } from "@/features/studio/config";

const fallbackUrl = "http://localhost:3000";

export const siteConfig = {
  name: STUDIO.name,
  title: `${STUDIO.name} — ${STUDIO.tagline}`,
  description: STUDIO.description,
  locale: "en_US",
  /** Default share image for Open Graph / Twitter cards. */
  avatar: STUDIO.shareImage,
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

export function createPageMetadata({
  title,
  description,
  path,
  image = siteConfig.avatar,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
}): Metadata {
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
      siteName: siteConfig.name,
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
 * Organization JSON-LD for the studio, listing both team members. Placeholder
 * team members (no real details yet) are left out of structured data.
 */
export function studioJsonLd() {
  const url = getSiteUrl().toString();

  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: siteConfig.name,
    url,
    image: absoluteUrl(siteConfig.avatar),
    description: siteConfig.description,
    slogan: STUDIO.tagline,
    sameAs: STUDIO.links.map(({ href }) => href),
    employee: TEAM.filter((member) => !member.isPlaceholder).map((member) => ({
      "@type": "Person",
      name: member.name,
      jobTitle: member.discipline,
      ...(member.photo ? { image: absoluteUrl(member.photo) } : {}),
    })),
    knowsAbout: [
      "Digital product development",
      "Web application development",
      "Internal business tools",
      "Customer portals",
      "MVP development",
      "Identity and access management",
      "IT operations and support",
    ],
  };
}

/** @deprecated Use {@link studioJsonLd}. Kept for backwards compatibility. */
export const personJsonLd = studioJsonLd;

export function blogPostingJsonLd(post: PostView) {
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
      name: siteConfig.name,
      url: getSiteUrl().toString(),
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
    },
  };
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
