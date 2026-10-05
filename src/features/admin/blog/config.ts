/**
 * Admin blog-management copy + routes (Task 23, Requirement 11).
 *
 * Centralizes the labels and hrefs used by the admin blog list/new/edit UI, the
 * draft/publish toggle, and the delete dialog so the components stay focused on
 * behavior, mirroring the admin projects config.
 */

/** Base route of the admin blog section. */
export const ADMIN_BLOG_HREF = "/admin/blog" as const;
/** Route of the "new article" form. */
export const ADMIN_BLOG_NEW_HREF = "/admin/blog/new" as const;

/** Build the edit route for a given post id. */
export function adminPostEditHref(id: string): string {
  return `/admin/blog/${id}`;
}

// --- List page copy ---------------------------------------------------------

export const POSTS_LIST_EYEBROW = "Blog" as const;
export const POSTS_LIST_HEADING = "Manage articles" as const;
export const POSTS_LIST_DESCRIPTION =
  "Write, edit, publish, and unpublish the articles shown on your public site." as const;

export const POSTS_NEW_LABEL = "New article" as const;

export const POSTS_EMPTY_TITLE = "No articles yet" as const;
export const POSTS_EMPTY_DESCRIPTION =
  "Write your first article to start sharing your thought leadership." as const;

// --- Status copy ------------------------------------------------------------

export const STATUS_PUBLISHED_LABEL = "Published" as const;
export const STATUS_DRAFT_LABEL = "Draft" as const;

/** Toggle button labels — the action the owner is about to perform. */
export const PUBLISH_ACTION_LABEL = "Publish" as const;
export const UNPUBLISH_ACTION_LABEL = "Move to draft" as const;
export const STATUS_UPDATING_LABEL = "Updating…" as const;

// --- Form copy --------------------------------------------------------------

export const POST_NEW_HEADING = "New article" as const;
export const POST_EDIT_HEADING = "Edit article" as const;
export const POST_FORM_EYEBROW = "Blog" as const;

export const POST_CREATE_SUBMIT = "Create article" as const;
export const POST_UPDATE_SUBMIT = "Save changes" as const;
export const POST_SUBMITTING_LABEL = "Saving…" as const;

export const POST_GENERIC_ERROR =
  "Something went wrong. Please try again." as const;

/**
 * Hint shown on the new-article form: a new post is always created as a draft
 * and only becomes public once explicitly published (Req 11.1).
 */
export const POST_NEW_DRAFT_HINT =
  "New articles are saved as drafts. Publish them from the article list when you're ready." as const;

// --- Delete dialog copy -----------------------------------------------------

export const POST_DELETE_LABEL = "Delete" as const;
export const POST_DELETE_TITLE = "Delete this article?" as const;
export const POST_DELETE_DESCRIPTION =
  "This permanently removes the article and hides it from your public site. This cannot be undone." as const;
export const POST_DELETE_CONFIRM = "Delete article" as const;
export const POST_DELETE_CANCEL = "Cancel" as const;
export const POST_DELETING_LABEL = "Deleting…" as const;
