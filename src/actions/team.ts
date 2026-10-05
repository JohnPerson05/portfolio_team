"use server";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import {
  idSchema,
  reorderSchema,
  teamMemberSchema,
  type TeamMemberInput,
} from "@/lib/validation";
import { logActivity } from "@/server/admin/activity";
import {
  nullify,
  persistenceFailure,
  revalidateSite,
  validationFailure,
} from "@/server/admin/mutations";
import type { ActionResult } from "@/types";

export async function saveTeamMember(
  id: string | null,
  input: TeamMemberInput,
): Promise<ActionResult<{ id: string }>> {
  const admin = await requireAdmin();
  if (id !== null && !idSchema.safeParse(id).success) {
    return { success: false, formError: "Missing team member id." };
  }
  const parsed = teamMemberSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  try {
    const data = nullify(parsed.data);
    const row = id
      ? await prisma.teamMember.update({ where: { id }, data })
      : await prisma.teamMember.create({ data });
    await logActivity(admin, {
      action: id ? "team.update" : "team.create",
      entityType: "team",
      entityId: row.id,
      summary: `${id ? "Updated" : "Added"} team member “${row.name}”`,
    });
    revalidateSite();
    return { success: true, data: { id: row.id } };
  } catch (error) {
    return persistenceFailure(error, "team member");
  }
}

export async function setTeamMemberPublished(
  id: string,
  isPublished: boolean,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!idSchema.safeParse(id).success) return { success: false, formError: "Missing id." };
  try {
    const row = await prisma.teamMember.update({
      where: { id },
      data: { isPublished: Boolean(isPublished) },
    });
    await logActivity(admin, {
      action: isPublished ? "team.publish" : "team.unpublish",
      entityType: "team",
      entityId: id,
      summary: `${isPublished ? "Published" : "Unpublished"} team member “${row.name}”`,
    });
    revalidateSite();
    return { success: true };
  } catch (error) {
    return persistenceFailure(error, "team member");
  }
}

export async function trashTeamMember(id: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!idSchema.safeParse(id).success) return { success: false, formError: "Missing id." };
  try {
    const row = await prisma.teamMember.update({
      where: { id },
      data: { deletedAt: new Date(), isPublished: false },
    });
    await logActivity(admin, {
      action: "team.trash",
      entityType: "team",
      entityId: id,
      summary: `Removed team member “${row.name}”`,
    });
    revalidateSite();
    return { success: true };
  } catch (error) {
    return persistenceFailure(error, "team member");
  }
}

export async function restoreTeamMember(id: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!idSchema.safeParse(id).success) return { success: false, formError: "Missing id." };
  try {
    const row = await prisma.teamMember.update({
      where: { id },
      data: { deletedAt: null },
    });
    await logActivity(admin, {
      action: "team.restore",
      entityType: "team",
      entityId: id,
      summary: `Restored team member “${row.name}” (unpublished)`,
    });
    revalidateSite();
    return { success: true };
  } catch (error) {
    return persistenceFailure(error, "team member");
  }
}

export async function deleteTeamMemberPermanently(id: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!idSchema.safeParse(id).success) return { success: false, formError: "Missing id." };
  try {
    const row = await prisma.teamMember.findUnique({ where: { id } });
    if (!row) return { success: true };
    if (!row.deletedAt) {
      return { success: false, formError: "Remove the member first, then delete permanently." };
    }
    await prisma.teamMember.delete({ where: { id } });
    await logActivity(admin, {
      action: "team.delete",
      entityType: "team",
      entityId: id,
      summary: `Permanently deleted team member “${row.name}”`,
    });
    revalidateSite();
    return { success: true };
  } catch (error) {
    return persistenceFailure(error, "team member");
  }
}

export async function reorderTeamMembers(ids: string[]): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = reorderSchema.safeParse(ids);
  if (!parsed.success) return { success: false, formError: "Invalid order." };
  try {
    await prisma.$transaction(
      parsed.data.map((id, index) =>
        prisma.teamMember.update({ where: { id }, data: { displayOrder: index } }),
      ),
    );
    await logActivity(admin, { action: "team.reorder", entityType: "team", summary: "Reordered team" });
    revalidateSite();
    return { success: true };
  } catch (error) {
    return persistenceFailure(error, "team member");
  }
}
