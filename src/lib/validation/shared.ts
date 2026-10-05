import { z } from "zod";

/**
 * Shared Zod building blocks reused across the validation schemas.
 *
 * Keeping these primitives in one place guarantees the public forms, the
 * admin CMS, and the server actions all enforce identical rules (Requirement
 * 17.2, 17.4) and that "validated persistence" (Property 4) has a single,
 * auditable gate.
 */

/** A trimmed, required string. */
export function requiredText(label = "This field") {
  return z.string().trim().min(1, `${label} is required`);
}

/**
 * An optional free-text field. Whitespace-only or empty input is normalized to
 * `undefined` so callers never persist meaningless blank strings. Values that
 * survive trimming are length-checked against `max`.
 */
export function optionalText(max: number, label = "This field") {
  return z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z
      .string()
      .trim()
      .max(max, `${label} must be ${max} characters or fewer`)
      .optional(),
  );
}

/**
 * An optional URL. Empty/whitespace input becomes `undefined`; any non-empty
 * value must be a valid URL, otherwise validation fails (Requirement 10.4).
 */
export const optionalUrl = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().trim().url("Must be a valid URL").optional(),
);

/**
 * A URL-safe slug: lowercase alphanumerics separated by single hyphens
 * (e.g. `my-first-project`). No leading/trailing/double hyphens.
 */
export const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Must be a URL-safe slug (lowercase letters, numbers, single hyphens)",
  );

/** A non-negative integer ordering value (defaults to 0, matching Prisma). */
export const orderSchema = z
  .number({ invalid_type_error: "Order must be a number" })
  .int("Order must be an integer")
  .min(0, "Order must be 0 or greater")
  .default(0);

/** An array of non-empty, trimmed strings (e.g. technologies, achievements). */
export const nonEmptyStringArray = z.array(
  z.string().trim().min(1, "Entries cannot be empty"),
);
