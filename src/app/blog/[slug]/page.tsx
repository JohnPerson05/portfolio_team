import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Article, getPublishedPostBySlug } from "@/features/blog";
import {
  blogPostingJsonLd,
  createPageMetadata,
  serializeJsonLd,
} from "@/lib/seo";

interface BlogArticlePageProps {
  /** Route params. In Next.js 15 `params` is async and must be awaited. */
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return {};

  return createPageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.coverUrl,
    type: "article",
  });
}

/**
 * `/blog/[slug]` — the public single-article page (Requirements 7.3, 7.4).
 *
 * A React Server Component that resolves the post via
 * {@link getPublishedPostBySlug}, which returns a post only when it exists AND
 * is `PUBLISHED`. A missing slug or a `DRAFT` post yields `null`, in which case
 * we call `notFound()` to render the 404 — a draft is never reachable publicly
 * (Correctness Property 3 / Requirement 7.4).
 *
 * The root layout owns the single `<main>` landmark; this delegates the article
 * render to {@link Article}.
 */
export default async function BlogArticlePage({
  params,
}: BlogArticlePageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(blogPostingJsonLd(post)),
        }}
      />
      <Article post={post} />
    </>
  );
}
