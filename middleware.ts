import { NextResponse, type NextRequest } from "next/server";

import {
  ADMIN_LOGIN_PATH,
  isAuthorizedRequest,
  SESSION_COOKIE_NAME,
} from "@/lib/session-token";

/**
 * Edge auth guard for the admin area (Requirement 9.1; Property 7).
 *
 * Runs in the Edge runtime, so it uses ONLY the Edge-safe
 * `@/lib/session-token` helpers (Web Crypto), never `node:crypto` or
 * `next/headers`. It performs a light-but-real check: the session cookie must
 * be present, correctly signed, and unexpired. Full credential logic lives in
 * the Node-only login path; admin Server Actions additionally re-verify the
 * session for defense-in-depth.
 *
 * The `matcher` (below) already scopes this to `/admin/*` and excludes
 * `/admin/login` plus Next internals/static assets, but we re-check the login
 * path here defensively so the guard is correct even if the matcher changes.
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Never guard the login page itself (would cause a redirect loop).
  if (pathname === ADMIN_LOGIN_PATH) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const authorized = await isAuthorizedRequest(token);

  if (!authorized) {
    const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
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
