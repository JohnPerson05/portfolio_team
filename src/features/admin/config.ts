/**
 * Admin CMS content + navigation (Task 21, Requirement 9).
 *
 * Centralizes the admin shell's navigation model and the login screen copy so
 * the shell/login components stay focused on behavior. Keeping the nav links in
 * one place means the guarded shell, the active-link logic, and future admin
 * sections (projects/blog/contacts/dashboard) never drift out of sync.
 */

/** A navigation entry in the guarded admin shell. */
export interface AdminNavLink {
  readonly label: string;
  readonly href: string;
}

/** Wordmark shown in the admin shell header. */
export const ADMIN_BRAND_NAME = "Portfolio Admin" as const;

/**
 * Primary admin navigation. `exact` marks links that should only be considered
 * active on an exact pathname match (the Dashboard root), so visiting
 * `/admin/projects` does not also light up `/admin`.
 */
export const ADMIN_NAV_LINKS: readonly (AdminNavLink & { exact?: boolean })[] = [
  { label: "Dashboard", href: "/admin", exact: true },
  { label: "Projects", href: "/admin/projects" },
  { label: "Blog", href: "/admin/blog" },
  { label: "Contacts", href: "/admin/contacts" },
];

/** Path of the admin login page (mirrors `ADMIN_LOGIN_PATH` in lib/session-token). */
export const ADMIN_LOGIN_HREF = "/admin/login" as const;

/** Where a successful login lands the owner. */
export const ADMIN_DASHBOARD_HREF = "/admin" as const;

/** Label for the logout control in the shell. */
export const ADMIN_LOGOUT_LABEL = "Log out" as const;
export const ADMIN_LOGGING_OUT_LABEL = "Logging out…" as const;

// --- Login screen copy ------------------------------------------------------

export const LOGIN_EYEBROW = "Admin" as const;
export const LOGIN_HEADING = "Sign in" as const;
export const LOGIN_DESCRIPTION =
  "Enter your owner credentials to manage portfolio content." as const;

export const LOGIN_EMAIL_LABEL = "Email" as const;
export const LOGIN_PASSWORD_LABEL = "Password" as const;

export const LOGIN_SUBMIT_LABEL = "Sign in" as const;
export const LOGIN_SUBMITTING_LABEL = "Signing in…" as const;

/**
 * Generic authentication error (Requirement 9.3). The `login` action returns
 * its own identical generic message; this is the client-side fallback so the
 * UI never reveals whether the email or the password was wrong (no user
 * enumeration).
 */
export const LOGIN_GENERIC_ERROR = "Invalid email or password." as const;
