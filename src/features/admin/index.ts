// Admin CMS feature barrel: the shell, login form, and shared admin config.
// Page-level admin components live in their own folders (projects/, team/,
// …) and the CMS design system in ui/.

export { AdminShell } from "./AdminShell";
export type { AdminShellProps } from "./AdminShell";

export { LoginForm } from "./LoginForm";
export type { LoginFormProps } from "./LoginForm";

export {
  ADMIN_BRAND_NAME,
  ADMIN_LOGIN_HREF,
  ADMIN_DASHBOARD_HREF,
  ADMIN_LOGOUT_LABEL,
} from "./config";
