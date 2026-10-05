import { z } from "zod";

import {
  CONTACT_ATTACHMENT_MAX_FILES,
  isContactAttachmentUrl,
} from "@/lib/contact-attachments";

/**
 * Contact form validation (Requirement 8.3, 8.6, 8.7; Property 4).
 *
 * This schema is the single gate for persisting a {@link ContactSubmission}:
 * a row is created if and only if input satisfies it (valid email, required
 * fields within bounds, empty honeypot).
 */

/** Anti-abuse honeypot field name. Hidden from humans; bots tend to fill it. */
export const HONEYPOT_FIELD = "website" as const;

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or fewer"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  // Optional: empty/whitespace input is normalized to `undefined`.
  company: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z
      .string()
      .trim()
      .max(100, "Company must be 100 characters or fewer")
      .optional(),
  ),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be 2000 characters or fewer"),
  attachmentUrls: z.preprocess(
    (value) => {
      if (value === undefined || value === null) return [];
      if (Array.isArray(value)) {
        return value.filter(
          (item): item is string => typeof item === "string" && item.length > 0,
        );
      }
      return typeof value === "string" && value.length > 0 ? [value] : [];
    },
    z
      .array(
        z.string().refine(isContactAttachmentUrl, {
          message: "Each attachment must be a valid uploaded file.",
        }),
      )
      .max(
        CONTACT_ATTACHMENT_MAX_FILES,
        `You can attach up to ${CONTACT_ATTACHMENT_MAX_FILES} files.`,
      ),
  ),
  // Honeypot: must be empty or absent. Any value signals an automated submission.
  [HONEYPOT_FIELD]: z
    .string()
    .optional()
    .refine((value) => value === undefined || value === "", {
      message: "Spam detected",
    }),
});

export type ContactInput = z.infer<typeof contactSchema>;

/**
 * Convenience helper to validate a `FormData` payload (as submitted from the
 * contact form) against {@link contactSchema}. Returns the standard Zod
 * `SafeParseReturnType` so callers can branch on `success` and surface
 * `error.flatten().fieldErrors`.
 */
export function parseContactFormData(formData: FormData) {
  return contactSchema.safeParse({
    name: formData.get("name") ?? undefined,
    email: formData.get("email") ?? undefined,
    company: formData.get("company") ?? undefined,
    message: formData.get("message") ?? undefined,
    attachmentUrls: formData
      .getAll("attachmentUrls")
      .filter((value): value is string => typeof value === "string"),
    [HONEYPOT_FIELD]: formData.get(HONEYPOT_FIELD) ?? undefined,
  });
}
