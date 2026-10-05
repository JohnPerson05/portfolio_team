import type { Metadata } from "next";

import { LoginForm } from "@/features/admin";

export const metadata: Metadata = {
  title: "Admin sign in",
  // Keep the admin login out of search indexes (public SEO disallows /admin too).
  robots: { index: false, follow: false },
};

/**
 * Admin login page (`/admin/login`) — Requirement 9.2, 9.3.
 *
 * Deliberately a SIBLING of the `(protected)` route group, so it is NOT wrapped
 * by the guarded admin layout and stays reachable while unauthenticated (no
 * redirect loop). `middleware.ts` likewise excludes this exact path from the
 * Edge guard. It renders the client {@link LoginForm}, which calls the `login`
 * Server Action and, on success, navigates to the dashboard.
 */
export default function AdminLoginPage() {
  return <LoginForm />;
}
