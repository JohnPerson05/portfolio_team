import { PostForm } from "@/features/admin/blog";

/**
 * New-article page (`/admin/blog/new`) — renders the create form
 * (Requirement 11.1). Lives under the `(protected)` route group so it inherits
 * the guarded admin layout (Property 7). The {@link PostForm} calls the
 * `createPost` Server Action, which re-validates, re-checks the session, and
 * always persists the new article as a draft.
 */
export default function AdminNewPostPage() {
  return <PostForm />;
}
