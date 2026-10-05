// Admin blog-management feature barrel (Task 23). Composite admin UI for
// writing, editing, deleting, publishing, and unpublishing articles
// (Requirement 11).

export { PostForm } from "./PostForm";
export type { PostFormProps } from "./PostForm";

export { PostList } from "./PostList";
export type { PostListProps } from "./PostList";

export { DeletePostButton } from "./DeletePostButton";
export type { DeletePostButtonProps } from "./DeletePostButton";

export { PostStatusToggle } from "./PostStatusToggle";
export type { PostStatusToggleProps } from "./PostStatusToggle";

export { getAllPosts, getPostById } from "./data";
export type { AdminPostView } from "./data";

export {
  ADMIN_BLOG_HREF,
  ADMIN_BLOG_NEW_HREF,
  adminPostEditHref,
  POSTS_LIST_EYEBROW,
  POSTS_LIST_HEADING,
  POSTS_LIST_DESCRIPTION,
  POSTS_NEW_LABEL,
} from "./config";
