import type { Metadata } from "next";
import { FadeUp, Stagger } from "@/components/motion";
import { EmptyState, PageHero } from "@/components/ui";
import { cn } from "@/lib/utils";
import { BlogCard, getPublishedPosts } from "@/features/blog";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Articles",
  description:
    "Writing on engineering, architecture, and building for the web.",
  path: "/blog",
});

/**
 * `/blog` — the public blog listing page (Requirements 7.1, 7.4).
 *
 * A React Server Component that queries only `PUBLISHED` posts via
 * {@link getPublishedPosts} (which centralizes the published-only filter —
 * Correctness Property 3), ordered most-recent-first (Correctness Property 10).
 * Each post links to its full article at `/blog/[slug]`. When there are no
 * published posts it renders an {@link EmptyState} (Requirement 7.2).
 *
 * The root layout owns the single `<main>` landmark, so this returns a
 * `<section>` labelled by its heading.
 */
export default async function BlogListingPage() {
  const posts = await getPublishedPosts();
  const headingId = "blog-listing-heading";

  return (
    <>
      <PageHero
        index="05"
        eyebrow="Insights"
        title="Notes from inside the build."
        description="Practical writing on product engineering, system design, interaction, architecture, and the decisions that turn an idea into reliable software."
      />
      <section
        aria-labelledby={headingId}
        className="w-full bg-bg px-space-2 py-section sm:px-space-4"
      >
        <div className="mx-auto flex max-w-content flex-col gap-space-8">
          <h2 id={headingId} className="sr-only">
            Published articles
          </h2>
          {posts.length > 0 ? (
            <Stagger
              as="ul"
              className={cn(
                "grid grid-cols-1 gap-space-3 sm:gap-space-4",
                "md:grid-cols-2 lg:grid-cols-3",
              )}
            >
              {posts.map((post) => (
                <FadeUp as="li" key={post.id} className="h-full list-none">
                  <BlogCard post={post} />
                </FadeUp>
              ))}
            </Stagger>
          ) : (
            <EmptyState
              title="Articles coming soon"
              description="Published writing will appear here once it's live."
            />
          )}
        </div>
      </section>
    </>
  );
}
