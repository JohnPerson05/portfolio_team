import { Button, SectionHeading } from "@/components/ui";
import {
  ADMIN_BLOG_NEW_HREF,
  getAllPosts,
  PostList,
  POSTS_LIST_DESCRIPTION,
  POSTS_LIST_EYEBROW,
  POSTS_LIST_HEADING,
  POSTS_NEW_LABEL,
} from "@/features/admin/blog";

/**
 * Admin blog list (`/admin/blog`) — the article management hub (Requirement 11).
 *
 * A Server Component under the `(protected)` route group, so it inherits the
 * guarded admin layout (`requireSession`) and renders only for the owner
 * (Property 7). It lists every article (drafts AND published) with a
 * draft/publish toggle, edit, and delete actions ({@link PostList}).
 *
 * Reads are dynamic so newly created/edited/deleted/published articles (which
 * `revalidatePath('/admin/blog')` invalidates) always reflect here.
 */
export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="flex flex-col gap-space-8">
      <div className="flex flex-wrap items-start justify-between gap-space-3">
        <SectionHeading
          level={1}
          eyebrow={POSTS_LIST_EYEBROW}
          heading={POSTS_LIST_HEADING}
          description={POSTS_LIST_DESCRIPTION}
        />
        <Button href={ADMIN_BLOG_NEW_HREF} variant="primary" size="md">
          {POSTS_NEW_LABEL}
        </Button>
      </div>

      <PostList posts={posts} />
    </div>
  );
}
