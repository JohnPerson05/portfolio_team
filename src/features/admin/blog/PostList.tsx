import { PostStatus } from "@prisma/client";

import { Badge, Button, Card, EmptyState } from "@/components/ui";
import { DeletePostButton } from "./DeletePostButton";
import { PostStatusToggle } from "./PostStatusToggle";
import type { AdminPostView } from "./data";
import {
  ADMIN_BLOG_NEW_HREF,
  adminPostEditHref,
  POSTS_EMPTY_DESCRIPTION,
  POSTS_EMPTY_TITLE,
  POSTS_NEW_LABEL,
  STATUS_DRAFT_LABEL,
  STATUS_PUBLISHED_LABEL,
} from "./config";

export interface PostListProps {
  posts: readonly AdminPostView[];
}

/**
 * `PostList` — the admin articles table (Server Component).
 *
 * Renders each article with its draft/published status badge, a
 * {@link PostStatusToggle} (publish ↔ move-to-draft — Req 11.4/11.5), an edit
 * link to the `[id]` form, and a {@link DeletePostButton} confirmation dialog
 * (Req 11.3). When there are no articles an {@link EmptyState} invites the owner
 * to write the first one. Mirrors `ProjectList` (Task 22).
 */
export function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <EmptyState
        title={POSTS_EMPTY_TITLE}
        description={POSTS_EMPTY_DESCRIPTION}
        action={
          <Button href={ADMIN_BLOG_NEW_HREF} variant="primary" size="md">
            {POSTS_NEW_LABEL}
          </Button>
        }
      />
    );
  }

  return (
    <ul className="flex flex-col gap-space-3">
      {posts.map((post) => {
        const isPublished = post.status === PostStatus.PUBLISHED;
        return (
          <li key={post.id}>
            <Card className="flex flex-wrap items-center justify-between gap-space-3 p-space-4">
              <div className="flex min-w-0 flex-col gap-space-1">
                <div className="flex items-center gap-space-2">
                  <span className="truncate font-display text-body-lg font-semibold text-text">
                    {post.title}
                  </span>
                  <Badge variant={isPublished ? "accent" : "default"}>
                    {isPublished ? STATUS_PUBLISHED_LABEL : STATUS_DRAFT_LABEL}
                  </Badge>
                </div>
                <span className="truncate font-sans text-caption text-muted">
                  /blog/{post.slug}
                </span>
              </div>

              <div className="flex items-center gap-space-2">
                <PostStatusToggle postId={post.id} status={post.status} />
                <Button
                  href={adminPostEditHref(post.id)}
                  variant="outline"
                  size="sm"
                >
                  Edit
                </Button>
                <DeletePostButton postId={post.id} postTitle={post.title} />
              </div>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
