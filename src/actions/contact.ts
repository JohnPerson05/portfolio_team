"use server";

import { headers } from "next/headers";
import { EventType } from "@prisma/client";

import { recordEvent } from "@/actions/analytics";
import { getClientIp } from "@/lib/client-ip";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  HONEYPOT_FIELD,
  parseContactFormData,
} from "@/lib/validation/contact";
import type { ActionResult } from "@/types";

/**
 * Contact submission Server Action (Requirements 8.2, 8.3, 8.5, 8.6, 8.7, 13.4;
 * Properties 4 & 5).
 *
 * Order of operations (mirrors the "Contact submission" sequence in design.md):
 *   1. Honeypot check (anti-abuse, Req 8.7).
 *   2. Per-IP rate-limit check (anti-abuse, Req 8.7).
 *   3. Zod validation incl. email format (Req 8.3, 8.6).
 *   4. Persist the submission, then record a CONTACT_SUBMISSION event
 *      (Req 8.2, 13.4 — Property 4 "validated persistence" & Property 5
 *      "event completeness").
 *
 * A `ContactSubmission` row is written if and only if input clears all of the
 * gates above (Property 4); for any rejection no row is written and no event is
 * recorded.
 */

/**
 * HONEYPOT DECISION: when the honeypot is filled we treat the submission as
 * spam and return a *soft success* (`{ success: true }`) without persisting or
 * recording an event. Returning success (rather than an error) avoids tipping
 * off naive bots that their submission was rejected, while still guaranteeing
 * no row is written (Property 4, Req 8.7). The human-facing form never fills
 * this hidden field, so legitimate users are unaffected.
 */
const HONEYPOT_SOFT_RESULT: ActionResult = { success: true };

export async function submitContact(
  formData: FormData,
): Promise<ActionResult> {
  // 1. Honeypot (Req 8.7). Filled => spam: do not persist, do not record.
  const honeypotValue = formData.get(HONEYPOT_FIELD);
  if (typeof honeypotValue === "string" && honeypotValue.trim() !== "") {
    return HONEYPOT_SOFT_RESULT;
  }

  // 2. Rate limit by client IP (Req 8.7). `next/headers` is isolated here so
  //    tests can mock it; IP derivation is delegated to a pure helper.
  const requestHeaders = await headers();
  const clientIp = getClientIp(requestHeaders);
  const { allowed } = checkRateLimit(`contact:${clientIp}`);
  if (!allowed) {
    return {
      success: false,
      formError: "Too many requests, please try again later.",
    };
  }

  // 3. Validate (Req 8.3, 8.6). On failure return field errors; persist nothing.
  const parsed = parseContactFormData(formData);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, email, company, message, attachmentUrls } = parsed.data;

  // 4. Persist, then record the event (Req 8.2, 13.4; Properties 4 & 5).
  try {
    await prisma.contactSubmission.create({
      data: { name, email, company, message, attachmentUrls },
    });
  } catch (error) {
    // Unexpected DB failure: surface a form-level error so the client can keep
    // the visitor's entered data (Req 8.5). Never reject.
    console.error("Failed to persist contact submission", error);
    return {
      success: false,
      formError: "Something went wrong sending your message. Please try again.",
    };
  }

  // Non-blocking analytics: recordEvent swallows its own errors (Property 6).
  await recordEvent({ type: EventType.CONTACT_SUBMISSION, path: "/#contact" });

  return { success: true };
}
