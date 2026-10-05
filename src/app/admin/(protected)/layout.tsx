import type { ReactNode } from "react";

import { requireSession } from "@/lib/auth";
import { AdminNav } from "@/features/admin";

/**
 * Guarded admin shell (Requirement 9.1; Property 7).
 *
 * STRUCTURE — why a `(protected)` route group:
 * The login page must stay reachable while unauthenticated, so it CANNOT be
 * wrapped by a guard. Putting the guard on `app/admin/layout.tsx` would also
 * wrap `app/admin/login`, causing a redirect loop. Instead, every guarded admin
 * page lives under `app/admin/(protected)/…` (this layout), while the login
 * page is a sibling at `app/admin/login/page.tsx` that this layout never wraps.
 * The route group `(protected)` does not affect the URL, so the dashboard still
 * resolves to `/admin`, projects to `/admin/projects`, etc. This mirrors how
 * `middleware.ts` excludes `/admin/login` from the Edge guard.
 *
 * DEFENSE-IN-DEPTH (Property 7): `middleware.ts` already redirects
 * unauthenticated `/admin/*` requests at the edge, but this layout independently
 * calls {@link requireSession} so the protected tree is never rendered without a
 * valid session even if the matcher changes or middleware is bypassed.
 * `requireSession` redirects to `/admin/login` (throwing `NEXT_REDIRECT`) when no
 * session is present, so no protected content is exposed.
 *
 * LANDMARKS / a11y (Req 15.2): renders a `<header>` containing the
 * `<nav aria-label="Admin">` (Dashboard/Projects/Blog/Contacts + logout). The
 * single `<main>` landmark is owned by the root layout, so this shell does not
 * introduce a second one; page content renders inside a constrained container.
 *
 * The shell stays a Server Component (only the small {@link AdminNav} island is
 * client) to keep the admin client bundle minimal (Performance Plan).
 */
export default async function AdminProtectedLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  // Server-side guard: redirects to /admin/login when unauthenticated.
  await requireSession();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 w-full border-b border-hairline bg-bg/90 backdrop-blur-md supports-[backdrop-filter]:bg-bg/60">
        <AdminNav />
      </header>

      <div className="mx-auto w-full max-w-content px-space-2 py-section sm:px-space-4">
        {children}
      </div>
    </div>
  );
}
