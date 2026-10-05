import { NextResponse, type NextRequest } from "next/server";

import {
  ADMIN_LOGIN_PATH,
  isAuthorizedRequest,
  SESSION_COOKIE_NAME,
} from "@/lib/session-token";

/**
 * Auth guard for the admin area (Next 16 "proxy", formerly middleware).
 *
 * Lives in `src/` because the app uses the `src/app` layout — Next only picks
 * up the proxy file at the same level as `app/`. It uses ONLY the
 * runtime-agnostic `@/lib/session-token` helpers (Web Crypto), never
 * `node:crypto` or `next/headers`. It performs a light-but-real check: the session cookie must
 * be present, correctly signed, and unexpired. Full credential logic lives in
 * the Node-only login path; admin Server Actions additionally re-verify the
 * session for defense-in-depth.
 *
 * The `matcher` (below) already scopes this to `/admin/*` and excludes
 * `/admin/login` plus Next internals/static assets, but we re-check the login
 * path here defensively so the guard is correct even if the matcher changes.
 */
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Never guard the login page itself (would cause a redirect loop).
  if (pathname === ADMIN_LOGIN_PATH) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const authorized = await isAuthorizedRequest(token);

  if (!authorized) {
    const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
    // Return to the requested CMS page after sign-in (validated client-side
    // to /admin paths only, so this can't become an open redirect).
    if (pathname !== "/admin") loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

/**
 * Match every `/admin` route EXCEPT `/admin/login`, and exclude Next internals
 * and common static asset extensions. The negative lookahead keeps the login
 * page reachable while guarding everything else under `/admin`.
 */
export const config = {
  matcher: [
    "/admin/((?!login$|login/).*)",
    "/admin",
  ],
};
