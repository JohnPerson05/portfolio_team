import { afterEach, describe, expect, it } from "vitest";
import type { PostView } from "@/types";
import {
  absoluteUrl,
  blogPostingJsonLd,
  createPageMetadata,
  studioJsonLd,
  serializeJsonLd,
} from "./seo";

const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

afterEach(() => {
  process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
});

describe("SEO helpers", () => {
  it("builds canonical, Open Graph, and Twitter metadata", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://portfolio.example";

    const metadata = createPageMetadata({
      title: "Articles",
      description: "Engineering writing.",
      path: "/blog",
    });

    expect(metadata.alternates).toEqual({
      canonical: "https://portfolio.example/blog",
    });
    expect(metadata.openGraph).toMatchObject({
      title: "Articles",
      url: "https://portfolio.example/blog",
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: "Articles",
    });
  });

  it("returns valid studio and BlogPosting JSON-LD shapes", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://portfolio.example";
    const post: PostView = {
      id: "post-1",
      title: "Reliable systems",
      slug: "reliable-systems",
      excerpt: "How to build systems that last.",
      content: "Article",
      coverUrl: "/images/blog/reliable-systems.jpg",
      publishedAt: "2026-01-02T00:00:00.000Z",
    };

    expect(
      studioJsonLd(
        {
          "studio.name": "Pairwork Studio",
          "studio.tagline": "Two people.",
          "seo.description": "Desc",
          "seo.ogImage": "/images/cover.png",
          "social.linkedin": "https://linkedin.com/company/x",
          "social.github": "",
          "social.x": "",
        },
        [{ name: "John", role: "Engineer", profileImage: "/images/profile.png" }],
      ),
    ).toMatchObject({
      sameAs: ["https://linkedin.com/company/x"],
      employee: [{ "@type": "Person", name: "John", jobTitle: "Engineer" }],
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      url: "https://portfolio.example/",
    });
    expect(blogPostingJsonLd(post)).toMatchObject({
      "@type": "BlogPosting",
      headline: post.title,
      url: absoluteUrl(`/blog/${post.slug}`),
      datePublished: post.publishedAt,
    });
  });

  it("escapes HTML-significant characters in serialized JSON-LD", () => {
    expect(serializeJsonLd({ value: "</script>" })).not.toContain("</script>");
  });
});
