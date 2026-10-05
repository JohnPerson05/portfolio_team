"use server";

import { createSession, destroySession, verifyCredentials } from "@/lib/auth";
import type { ActionResult } from "@/types";

/**
 * Authentication Server Actions (Requirement 9.2, 9.3, 9.4; Property 8).
 *
 *  - {@link login}: validates presence, verifies owner credentials, and on
 *    success establishes the session cookie. On any failure it returns a single
 *    GENERIC error so an attacker cannot distinguish "wrong email" from "wrong
 *    password" (no user enumeration, Requirement 9.3).
 *  - {@link logout}: clears the session cookie, revoking access (Requirement 9.4).
 */

/**
 * Generic credentials error. Intentionally identical for missing fields,
 * unknown email, and wrong password to avoid leaking which part was wrong.
 */
const GENERIC_CREDENTIALS_ERROR = "Invalid email or password.";

/**
 * Authenticate the owner from submitted form data (Requirement 9.2, 9.3).
 *
 * On success a session cookie is set and `{ success: true }` is returned (the
 * caller — the login page — performs the post-login navigation). On any failure
 * NO cookie is set and a generic `formError` is returned (Property 8: a failed
 * login never establishes a session).
 */
export async function login(formData: FormData): Promise<ActionResult> {
  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");

  const email = typeof emailValue === "string" ? emailValue.trim() : "";
  const password = typeof passwordValue === "string" ? passwordValue : "";

  // Presence check. Same generic error as a credential mismatch.
  if (email === "" || password === "") {
    return { success: false, formError: GENERIC_CREDENTIALS_ERROR };
  }

  const ok = await verifyCredentials(email, password);
  if (!ok) {
    return { success: false, formError: GENERIC_CREDENTIALS_ERROR };
  }

  await createSession(email);
  return { success: true };
}

/**
 * Log the owner out by clearing the session cookie (Requirement 9.4).
 */
export async function logout(): Promise<void> {
  await destroySession();
}
