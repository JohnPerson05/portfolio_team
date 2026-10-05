import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { PostView } from "@/types";
import { formatPublishedDate } from "./config";

export interface BlogCardProps {
  /** The published post to render. */
  post: PostView;
  className?: string;
}

/**
 * `BlogCard` — a single published-article card used by the homepage preview
 * and the full listing (Requirements 7.1, 7.3).
 *
 * Renders the optional cover image, the published date, the title, and the
 * excerpt. The whole card is a single link to `/blog/[slug]` so clicking
 * anywhere navigates to the full article (Requirement 7.3); the title carries
 * the accessible link name. Uses `next/link` for client-side navigation and
 * `next/image` for the optimized, lazy-loaded cover (graceful when absent).
 *
 * Premium hover (consistent with project cards): a subtle lift + accent border
 * via the shared {@link Card} `hover="lift"` treatment — no flashy motion.
 *
 * Presentational and server-safe; nothing here hydrates on the client.
 */
export function BlogCard({ post, className }: BlogCardProps) {
  const titleId = `post-${post.id}-title`;
  const formattedDate = post.publishedAt
    ? formatPublishedDate(post.publishedAt)
    : null;

  return (
    <Card
      as="article"
      hover="lift"
      aria-labelledby={titleId}
      className={cn("flex h-full flex-col overflow-hidden", className)}
    >
      <Link
        href={`/blog/${post.slug}`}
        className={cn(
          "flex h-full flex-col no-underline",
          "rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        )}
      >
        {post.coverUrl ? (
          <div className="relative aspect-video w-full overflow-hidden border-b border-hairline bg-bg-secondary">
            <Image
              src={post.coverUrl}
              alt={`${post.title} cover`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="flex flex-1 flex-col gap-space-2 p-space-4">
          {formattedDate ? (
            <time
              dateTime={post.publishedAt ?? undefined}
              className="font-sans text-caption font-medium uppercase tracking-widest text-accent"
            >
              {formattedDate}
            </time>
          ) : null}

          <h3
            id={titleId}
            className="font-display text-h3 font-semibold tracking-tight text-text text-balance"
          >
            {post.title}
          </h3>

          <p className="font-sans text-body text-muted text-pretty">
            {post.excerpt}
          </p>

          <span
            aria-hidden="true"
            className="mt-auto pt-space-2 font-sans text-body font-medium text-accent"
          >
            Read article →
          </span>
        </div>
      </Link>
    </Card>
  );
}
