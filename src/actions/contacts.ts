"use server";

import { revalidatePath } from "next/cache";

import { requireSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { ActionResult } from "@/types";

const ADMIN_CONTACTS_PATH = "/admin/contacts";

/**
 * Admin contact-inbox mutations. Every write re-checks {@link requireSession}
 * so an unauthenticated caller never reaches Prisma.
 */

function revalidateContactSurfaces(id?: string): void {
  revalidatePath(ADMIN_CONTACTS_PATH);
  if (id) {
    revalidatePath(`${ADMIN_CONTACTS_PATH}/${id}`);
  }
}

/** Mark an inquiry as read when the owner opens the detail view. */
export async function markContactRead(id: string): Promise<ActionResult> {
  await requireSession();

  if (typeof id !== "string" || id.trim() === "") {
    return { success: false, formError: "Missing inquiry id." };
  }

  try {
    const existing = await prisma.contactSubmission.findUnique({
      where: { id },
      select: { id: true, readAt: true },
    });
    if (!existing) {
      return { success: false, formError: "Inquiry not found." };
    }
    if (!existing.readAt) {
      await prisma.contactSubmission.update({
        where: { id },
        data: { readAt: new Date() },
      });
    }
    revalidateContactSurfaces(id);
    return { success: true };
  } catch (error) {
    console.error("Failed to mark contact as read", error);
    return {
      success: false,
      formError: "Something went wrong updating this inquiry.",
    };
  }
}

/** Permanently remove an inquiry from the inbox. */
export async function deleteContact(id: string): Promise<ActionResult> {
  await requireSession();

  if (typeof id !== "string" || id.trim() === "") {
    return { success: false, formError: "Missing inquiry id." };
  }

  try {
    await prisma.contactSubmission.delete({ where: { id } });
    revalidateContactSurfaces(id);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete contact submission", error);
    return {
      success: false,
      formError: "Something went wrong deleting this inquiry. Please try again.",
    };
  }
}
