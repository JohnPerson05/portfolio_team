import Link from "next/link";
import { FadeUp, Stagger } from "@/components/motion";
import { EmptyState, SectionHeading } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { PostView } from "@/types";
import { BlogCard } from "./BlogCard";
import {
  BLOG_PREVIEW_EYEBROW,
  BLOG_PREVIEW_HEADING,
  BLOG_PREVIEW_LIMIT,
  selectLatest,
} from "./config";
import { getLatestPublishedPosts } from "./data";

export interface BlogPreviewProps {
  /**
   * Override the posts rendered. Defaults to a live query of the latest
   * published posts. Primarily an injection seam for tests; production renders
   * the live data fetched from the shared Prisma client. The injected list is
   * still run through {@link selectLatest} so the latest-N, most-recent-first
   * invariant (Correctness Property 10) holds either way.
   */
  posts?: readonly PostView[];
  /** Maximum number of articles to show. Defaults to {@link BLOG_PREVIEW_LIMIT}. */
  limit?: number;
  /** Eyebrow label above the heading. */
  eyebrow?: string;
  /** Section heading text. */
  heading?: string;
  className?: string;
}

/**
 * `BlogPreview` — the homepage blog preview section (Requirement 7).
 *
 * A React Server Component: it fetches the latest published posts via the
 * shared Prisma client ({@link getLatestPublishedPosts}, which filters
 * `status = PUBLISHED` — Correctness Property 3 / Requirement 7.4), ordered
 * most-recent-first by `publishedAt` (Correctness Property 10 / Requirement
 * 7.1) and capped at {@link BLOG_PREVIEW_LIMIT}. Each post renders as a linked
 * {@link BlogCard} that navigates to its full article (Requirement 7.3).
 *
 * Empty-state aware (Requirement 7.2): when there are no published posts the
 * section renders a quiet {@link EmptyState} rather than an empty grid.
 *
 * Motion (consistent with the other sections): a {@link Stagger} container
 * orchestrates staggered scroll-triggered reveals of the cards (each wrapped in
 * {@link FadeUp}), honoring reduced motion via the shared primitives.
 *
 * Rendered as a `<section id="blog">` labelled by its heading for an accessible
 * landmark name.
 */
export async function BlogPreview({
  posts,
  limit = BLOG_PREVIEW_LIMIT,
  eyebrow = BLOG_PREVIEW_EYEBROW,
  heading = BLOG_PREVIEW_HEADING,
  className,
}: BlogPreviewProps) {
  const source = posts ?? (await getLatestPublishedPosts(limit));
  const latest = selectLatest(source, limit);
  const headingId = "blog-heading";

  return (
    <section
      id="blog"
      aria-labelledby={headingId}
      className={cn(
        "w-full bg-bg px-space-2 py-section sm:px-space-4",
        className,
      )}
    >
      <div className="mx-auto flex max-w-content flex-col gap-space-8">
        <SectionHeading
          id={headingId}
          eyebrow={eyebrow}
          heading={heading}
          align="center"
          className="mx-auto"
        />

        {latest.length > 0 ? (
          <>
            <Stagger
              as="ul"
              className={cn(
                "grid grid-cols-1 gap-space-3 sm:gap-space-4",
                "md:grid-cols-2 lg:grid-cols-3",
              )}
            >
              {latest.map((post) => (
                <FadeUp as="li" key={post.id} className="h-full list-none">
                  <BlogCard post={post} />
                </FadeUp>
              ))}
            </Stagger>

            <Link
              href="/blog"
              className={cn(
                "mx-auto inline-flex min-h-11 items-center rounded-md px-space-2 font-sans text-body font-medium text-accent no-underline",
                "hover:text-accent/80 transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              )}
            >
              View all articles →
            </Link>
          </>
        ) : (
          <EmptyState
            title="Articles coming soon"
            description="Published writing will appear here once it's live."
          />
        )}
      </div>
    </section>
  );
}
