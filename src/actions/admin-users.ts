"use server";

import prisma from "@/lib/prisma";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  adminUserCreateSchema,
  adminUserUpdateSchema,
  idSchema,
  passwordSchema,
} from "@/lib/validation";
import { logActivity } from "@/server/admin/activity";
import { persistenceFailure, validationFailure } from "@/server/admin/mutations";
import type { ActionResult } from "@/types";

/**
 * Admin user management. Only SUPER_ADMINs can manage other admins; every
 * admin can change their own password. Guards prevent locking the studio out
 * (the last active super admin can't be demoted, deactivated, or deleted).
 */

async function activeSuperAdminCount(excludeId?: string): Promise<number> {
  return prisma.adminUser.count({
    where: { role: "SUPER_ADMIN", isActive: true, ...(excludeId ? { id: { not: excludeId } } : {}) },
  });
}

export async function createAdminUser(input: unknown): Promise<ActionResult<{ id: string }>> {
  const admin = await requireSuperAdmin();
  const parsed = adminUserCreateSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  try {
    const { password, ...rest } = parsed.data;
    const user = await prisma.adminUser.create({
      data: { ...rest, passwordHash: await hashPassword(password) },
    });
    await logActivity(admin, {
      action: "admin.create",
      entityType: "admin",
      entityId: user.id,
      summary: `Added admin ${user.email} (${user.role === "SUPER_ADMIN" ? "super admin" : "editor"})`,
    });
    return { success: true, data: { id: user.id } };
  } catch (error) {
    return persistenceFailure(error, "admin", "email");
  }
}

export async function updateAdminUser(id: string, input: unknown): Promise<ActionResult> {
  const admin = await requireSuperAdmin();
  if (!idSchema.safeParse(id).success) return { success: false, formError: "Missing id." };
  const parsed = adminUserUpdateSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  const losingSuper = parsed.data.role !== "SUPER_ADMIN" || !parsed.data.isActive;
  if (losingSuper) {
    const target = await prisma.adminUser.findUnique({ where: { id }, select: { role: true, isActive: true } });
    if (target?.role === "SUPER_ADMIN" && target.isActive && (await activeSuperAdminCount(id)) === 0) {
      return { success: false, formError: "Keep at least one active super admin." };
    }
  }

  try {
    const user = await prisma.adminUser.update({ where: { id }, data: parsed.data });
    await logActivity(admin, {
      action: "admin.update",
      entityType: "admin",
      entityId: id,
      summary: `Updated admin ${user.email}`,
    });
    return { success: true };
  } catch (error) {
    return persistenceFailure(error, "admin");
  }
}

export async function resetAdminPassword(id: string, password: string): Promise<ActionResult> {
  const admin = await requireSuperAdmin();
  if (!idSchema.safeParse(id).success) return { success: false, formError: "Missing id." };
  const parsed = passwordSchema.safeParse(password);
  if (!parsed.success) return { success: false, fieldErrors: { password: parsed.error.issues.map((i) => i.message) } };
  try {
    const user = await prisma.adminUser.update({
      where: { id },
      data: { passwordHash: await hashPassword(parsed.data) },
    });
    await logActivity(admin, {
      action: "admin.reset-password",
      entityType: "admin",
      entityId: id,
      summary: `Reset password for ${user.email}`,
    });
    return { success: true };
  } catch (error) {
    return persistenceFailure(error, "admin");
  }
}

export async function deleteAdminUser(id: string): Promise<ActionResult> {
  const admin = await requireSuperAdmin();
  if (!idSchema.safeParse(id).success) return { success: false, formError: "Missing id." };
  if (id === admin.id) return { success: false, formError: "You can't delete your own account." };
  try {
    const target = await prisma.adminUser.findUnique({ where: { id } });
    if (!target) return { success: true };
    if (target.role === "SUPER_ADMIN" && target.isActive && (await activeSuperAdminCount(id)) === 0) {
      return { success: false, formError: "Keep at least one active super admin." };
    }
    await prisma.adminUser.delete({ where: { id } });
    await logActivity(admin, {
      action: "admin.delete",
      entityType: "admin",
      entityId: id,
      summary: `Removed admin ${target.email}`,
    });
    return { success: true };
  } catch (error) {
    return persistenceFailure(error, "admin");
  }
}

/** Any admin: change your own password (requires the current one). */
export async function changeOwnPassword(current: string, next: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = passwordSchema.safeParse(next);
  if (!parsed.success) return { success: false, fieldErrors: { next: parsed.error.issues.map((i) => i.message) } };
  if (typeof current !== "string" || current.length > 256) {
    return { success: false, fieldErrors: { current: ["Current password is incorrect."] } };
  }
  try {
    const user = await prisma.adminUser.findUnique({ where: { id: admin.id } });
    if (!user || !(await verifyPassword(current, user.passwordHash))) {
      return { success: false, fieldErrors: { current: ["Current password is incorrect."] } };
    }
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { passwordHash: await hashPassword(parsed.data) },
    });
    await logActivity(admin, {
      action: "admin.change-password",
      entityType: "admin",
      entityId: admin.id,
      summary: `${admin.name} changed their password`,
    });
    return { success: true };
  } catch (error) {
    return persistenceFailure(error, "admin");
  }
}
