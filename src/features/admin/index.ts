// Admin CMS feature barrel (Task 21): the guarded shell's navigation, the
// owner login form, and shared admin config/copy. Later admin tasks
// (projects/blog/contacts CRUD, analytics dashboard) append their composite UI
// here.

export { AdminNav } from "./AdminNav";
export type { AdminNavProps } from "./AdminNav";

export { LoginForm } from "./LoginForm";
export type { LoginFormProps } from "./LoginForm";

export {
  ADMIN_BRAND_NAME,
  ADMIN_NAV_LINKS,
  ADMIN_LOGIN_HREF,
  ADMIN_DASHBOARD_HREF,
  ADMIN_LOGOUT_LABEL,
} from "./config";
export type { AdminNavLink } from "./config";
