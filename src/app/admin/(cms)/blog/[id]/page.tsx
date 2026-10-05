import { notFound } from "next/navigation";

import { getPostById, PostForm } from "@/features/admin/blog";

/**
 * Edit-article page (`/admin/blog/[id]`) — renders the edit form
 * (Requirement 11.2). Lives under the `(protected)` route group so it inherits
 * the guarded admin layout (Property 7).
 *
 * Loads the post by id and 404s when it does not exist; the {@link PostForm}
 * (in edit mode) calls the `updatePost` Server Action, which re-validates and
 * re-checks the session. Publish state is managed from the article list, not
 * this form.
 */
export const dynamic = "force-dynamic";

export default async function AdminEditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  return <PostForm post={post} />;
}
