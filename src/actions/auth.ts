"use server";

import { headers } from "next/headers";

import { authenticate, createSession, destroySession } from "@/lib/auth";
import { getClientIp } from "@/lib/client-ip";
import { logActivity } from "@/server/admin/activity";
import { checkRateLimit } from "@/lib/rate-limit";
import type { ActionResult } from "@/types";

/**
 * Authentication Server Actions.
 *
 * {@link login} always answers with the same generic error for missing fields,
 * unknown email, inactive account, and wrong password (no user enumeration),
 * and is rate limited per client IP to slow down password guessing.
 */

const GENERIC_CREDENTIALS_ERROR = "Invalid email or password.";
const RATE_LIMITED_ERROR =
  "Too many sign-in attempts. Please wait a minute and try again.";

/** 10 attempts per IP per 5 minutes. */
const LOGIN_RATE_LIMIT = { limit: 10, windowMs: 5 * 60_000 };

export async function login(formData: FormData): Promise<ActionResult> {
  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");
  const remember = formData.get("remember") === "on";

  const email = typeof emailValue === "string" ? emailValue.trim() : "";
  const password = typeof passwordValue === "string" ? passwordValue : "";

  const ip = getClientIp(await headers());
  if (!checkRateLimit(`login:${ip}`, LOGIN_RATE_LIMIT).allowed) {
    return { success: false, formError: RATE_LIMITED_ERROR };
  }

  if (email === "" || password === "" || password.length > 256) {
    return { success: false, formError: GENERIC_CREDENTIALS_ERROR };
  }

  const admin = await authenticate(email, password);
  if (!admin) {
    return { success: false, formError: GENERIC_CREDENTIALS_ERROR };
  }

  await createSession(admin, { remember });
  await logActivity(admin, {
    action: "auth.login",
    entityType: "admin",
    entityId: admin.id,
    summary: `${admin.name} signed in`,
  });
  return { success: true };
}

export async function logout(): Promise<void> {
  await destroySession();
}
