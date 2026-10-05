import Image from "next/image";
import { FadeUp } from "@/components/motion";
import { cn } from "@/lib/utils";
import type { PostView } from "@/types";
import { formatPublishedDate } from "./config";

export interface ArticleProps {
  /** The published post to render in full. */
  post: PostView;
  className?: string;
}

/**
 * `Article` — the full single-article render for `/blog/[slug]`
 * (Requirement 7.3).
 *
 * Renders the title, the published date, the optional cover image
 * (`next/image` when `coverUrl` is present, lazy/optimized), and the article
 * body. The body is rendered with whitespace preserved so the seeded
 * markdown-ish content keeps its line breaks without pulling in a markdown
 * renderer (rich rendering is out of scope for this task). Full SEO/JSON-LD is
 * Task 26.
 *
 * Rendered as a semantic `<article>` labelled by its title for an accessible
 * landmark name. Presentational and server-safe.
 */
export function Article({ post, className }: ArticleProps) {
  const titleId = `article-${post.id}-title`;
  const formattedDate = post.publishedAt
    ? formatPublishedDate(post.publishedAt)
    : null;

  return (
    <article
      aria-labelledby={titleId}
      className={cn(
        "mx-auto w-full max-w-content px-space-2 py-section sm:px-space-4",
        className,
      )}
    >
      <FadeUp>
        <header className="flex flex-col gap-space-3">
          {formattedDate ? (
            <time
              dateTime={post.publishedAt ?? undefined}
              className="font-sans text-caption font-medium uppercase tracking-widest text-accent"
            >
              {formattedDate}
            </time>
          ) : null}

          <h1
            id={titleId}
            className="text-balance font-display text-h1 font-semibold tracking-tight text-text"
          >
            {post.title}
          </h1>

          <p className="text-pretty font-sans text-body-lg text-muted">
            {post.excerpt}
          </p>
        </header>
      </FadeUp>

      {post.coverUrl ? (
        <div className="relative mt-space-6 aspect-video w-full overflow-hidden rounded-lg border border-hairline bg-bg-secondary">
          <Image
            src={post.coverUrl}
            alt={`${post.title} cover`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="mt-space-8 whitespace-pre-wrap text-pretty font-sans text-body-lg leading-relaxed text-text">
        {post.content}
      </div>
    </article>
  );
}
