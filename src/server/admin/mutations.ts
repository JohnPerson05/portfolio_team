import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import type { ZodError } from "zod";

import type { ActionFailure } from "@/types";

/**
 * Shared plumbing for admin Server Actions.
 *
 * Every admin action follows the same sequence:
 *   1. `requireAdmin()` / `requireSuperAdmin()` — before anything else.
 *   2. Zod-validate the input (never trust the client).
 *   3. Mutate via Prisma.
 *   4. `logActivity()`.
 *   5. `revalidateSite()` so the public site reflects the change immediately.
 */

/**
 * Invalidate every cached page. The site is small, so revalidating the whole
 * tree is simpler and safer than tracking which pages show which entity.
 */
export function revalidateSite(): void {
  revalidatePath("/", "layout");
}

export function validationFailure(error: ZodError): ActionFailure {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return {
    success: false,
    fieldErrors,
    formError: "Please fix the highlighted fields.",
  };
}

/** Map common Prisma errors to friendly results; rethrow everything else. */
export function persistenceFailure(
  error: unknown,
  entity: string,
  uniqueField = "slug",
): ActionFailure {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return {
        success: false,
        fieldErrors: {
          [uniqueField]: [`Another ${entity} already uses this ${uniqueField}.`],
        },
        formError: `Another ${entity} already uses this ${uniqueField}.`,
      };
    }
    if (error.code === "P2025") {
      return {
        success: false,
        formError: `This ${entity} no longer exists. It may have been deleted.`,
      };
    }
  }
  console.error(`Failed to save ${entity}`, error);
  return {
    success: false,
    formError: `Something went wrong saving the ${entity}. Please try again.`,
  };
}

/** Convert `undefined` optionals to `null` so updates can clear a field. */
type Nullified<T> = {
  [K in keyof T]-?: undefined extends T[K] ? Exclude<T[K], undefined> | null : T[K];
};

export function nullify<T extends Record<string, unknown>>(data: T): Nullified<T> {
  const out = {} as Record<string, unknown>;
  for (const [key, value] of Object.entries(data)) {
    out[key] = value === undefined ? null : value;
  }
  return out as Nullified<T>;
}
