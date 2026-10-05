"use server";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import {
  idSchema,
  processStepSchema,
  reorderSchema,
  serviceSchema,
  technologySchema,
  testimonialSchema,
  type ProcessStepInput,
  type ServiceInput,
  type TechnologyInput,
  type TestimonialInput,
} from "@/lib/validation";
import { logActivity } from "@/server/admin/activity";
import {
  nullify,
  persistenceFailure,
  revalidateSite,
  validationFailure,
} from "@/server/admin/mutations";
import type { ActionResult } from "@/types";

/**
 * CMS actions for the smaller content types: services, process steps,
 * testimonials, and technologies. These are hard-deleted (no trash).
 */

const MISSING_ID: ActionResult = { success: false, formError: "Missing id." };
const BAD_ORDER: ActionResult = { success: false, formError: "Invalid order." };

/* -------------------------------------------------------------------------- */
/* Services                                                                   */
/* -------------------------------------------------------------------------- */

export async function saveService(
  id: string | null,
  input: ServiceInput,
): Promise<ActionResult<{ id: string }>> {
  const admin = await requireAdmin();
  if (id !== null && !idSchema.safeParse(id).success) return MISSING_ID;
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  try {
    const data = nullify(parsed.data);
    const row = id
      ? await prisma.service.update({ where: { id }, data })
      : await prisma.service.create({
          data: { ...data, displayOrder: await prisma.service.count() },
        });
    await logActivity(admin, {
      action: id ? "service.update" : "service.create",
      entityType: "service",
      entityId: row.id,
      summary: `${id ? "Updated" : "Added"} service “${row.title}”`,
    });
    revalidateSite();
    return { success: true, data: { id: row.id } };
  } catch (error) {
    return persistenceFailure(error, "service");
  }
}

export async function setServicePublished(id: string, isPublished: boolean): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!idSchema.safeParse(id).success) return MISSING_ID;
  try {
    const row = await prisma.service.update({ where: { id }, data: { isPublished: Boolean(isPublished) } });
    await logActivity(admin, {
      action: isPublished ? "service.publish" : "service.unpublish",
      entityType: "service",
      entityId: id,
      summary: `${isPublished ? "Published" : "Unpublished"} service “${row.title}”`,
    });
    revalidateSite();
    return { success: true };
  } catch (error) {
    return persistenceFailure(error, "service");
  }
}

export async function deleteService(id: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!idSchema.safeParse(id).success) return MISSING_ID;
  try {
    const row = await prisma.service.delete({ where: { id } });
    await logActivity(admin, {
      action: "service.delete",
      entityType: "service",
      entityId: id,
      summary: `Deleted service “${row.title}”`,
    });
    revalidateSite();
    return { success: true };
  } catch (error) {
    return persistenceFailure(error, "service");
  }
}

export async function reorderServices(ids: string[]): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = reorderSchema.safeParse(ids);
  if (!parsed.success) return BAD_ORDER;
  try {
    await prisma.$transaction(
      parsed.data.map((id, index) => prisma.service.update({ where: { id }, data: { displayOrder: index } })),
    );
    await logActivity(admin, { action: "service.reorder", entityType: "service", summary: "Reordered services" });
    revalidateSite();
    return { success: true };
  } catch (error) {
    return persistenceFailure(error, "service");
  }
}

/* -------------------------------------------------------------------------- */
/* Process                                                                    */
/* -------------------------------------------------------------------------- */

export async function saveProcessStep(
  id: string | null,
  input: ProcessStepInput,
): Promise<ActionResult<{ id: string }>> {
  const admin = await requireAdmin();
  if (id !== null && !idSchema.safeParse(id).success) return MISSING_ID;
  const parsed = processStepSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  try {
    const data = nullify(parsed.data);
    let row;
    if (id) {
      row = await prisma.processStep.update({ where: { id }, data });
    } else {
      const count = await prisma.processStep.count();
      row = await prisma.processStep.create({
        data: { ...data, stepNumber: count + 1, displayOrder: count },
      });
    }
    await logActivity(admin, {
      action: id ? "process.update" : "process.create",
      entityType: "process",
      entityId: row.id,
      summary: `${id ? "Updated" : "Added"} process step “${row.title}”`,
    });
    revalidateSite();
    return { success: true, data: { id: row.id } };
  } catch (error) {
    return persistenceFailure(error, "process step");
  }
}

export async function setProcessStepPublished(id: string, isPublished: boolean): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!idSchema.safeParse(id).success) return MISSING_ID;
  try {
    const row = await prisma.processStep.update({ where: { id }, data: { isPublished: Boolean(isPublished) } });
    await logActivity(admin, {
      action: isPublished ? "process.publish" : "process.unpublish",
      entityType: "process",
      entityId: id,
      summary: `${isPublished ? "Published" : "Hid"} process step “${row.title}”`,
    });
    revalidateSite();
    return { success: true };
  } catch (error) {
    return persistenceFailure(error, "process step");
  }
}

export async function deleteProcessStep(id: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!idSchema.safeParse(id).success) return MISSING_ID;
  try {
    const row = await prisma.processStep.delete({ where: { id } });
    // Keep step numbers contiguous.
    const remaining = await prisma.processStep.findMany({ orderBy: { displayOrder: "asc" } });
    await prisma.$transaction(
      remaining.map((step, index) =>
        prisma.processStep.update({ where: { id: step.id }, data: { stepNumber: index + 1, displayOrder: index } }),
      ),
    );
    await logActivity(admin, {
      action: "process.delete",
      entityType: "process",
      entityId: id,
      summary: `Deleted process step “${row.title}”`,
    });
    revalidateSite();
    return { success: true };
  } catch (error) {
    return persistenceFailure(error, "process step");
  }
}

export async function reorderProcessSteps(ids: string[]): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = reorderSchema.safeParse(ids);
  if (!parsed.success) return BAD_ORDER;
  try {
    await prisma.$transaction(
      parsed.data.map((id, index) =>
        prisma.processStep.update({ where: { id }, data: { displayOrder: index, stepNumber: index + 1 } }),
      ),
    );
    await logActivity(admin, { action: "process.reorder", entityType: "process", summary: "Reordered process steps" });
    revalidateSite();
    return { success: true };
  } catch (error) {
    return persistenceFailure(error, "process step");
  }
}

/* -------------------------------------------------------------------------- */
/* Testimonials                                                               */
/* -------------------------------------------------------------------------- */

export async function saveTestimonial(
  id: string | null,
  input: TestimonialInput,
): Promise<ActionResult<{ id: string }>> {
  const admin = await requireAdmin();
  if (id !== null && !idSchema.safeParse(id).success) return MISSING_ID;
  const parsed = testimonialSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  try {
    if (parsed.data.projectId) {
      const exists = await prisma.project.count({ where: { id: parsed.data.projectId, deletedAt: null } });
      if (!exists) return { success: false, fieldErrors: { projectId: ["That project no longer exists."] } };
    }
    const data = nullify(parsed.data);
    const row = id
      ? await prisma.testimonial.update({ where: { id }, data })
      : await prisma.testimonial.create({ data });
    await logActivity(admin, {
      action: id ? "testimonial.update" : "testimonial.create",
      entityType: "testimonial",
      entityId: row.id,
      summary: `${id ? "Updated" : "Added"} testimonial from ${row.name}`,
    });
    revalidateSite();
    return { success: true, data: { id: row.id } };
  } catch (error) {
    return persistenceFailure(error, "testimonial");
  }
}

export async function setTestimonialFlags(
  id: string,
  flags: { isPublished?: boolean; isFeatured?: boolean },
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!idSchema.safeParse(id).success) return MISSING_ID;
  const data: { isPublished?: boolean; isFeatured?: boolean } = {};
  if (typeof flags?.isPublished === "boolean") data.isPublished = flags.isPublished;
  if (typeof flags?.isFeatured === "boolean") data.isFeatured = flags.isFeatured;
  try {
    const row = await prisma.testimonial.update({ where: { id }, data });
    await logActivity(admin, {
      action: "testimonial.update",
      entityType: "testimonial",
      entityId: id,
      summary: `Updated visibility of testimonial from ${row.name}`,
    });
    revalidateSite();
    return { success: true };
  } catch (error) {
    return persistenceFailure(error, "testimonial");
  }
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!idSchema.safeParse(id).success) return MISSING_ID;
  try {
    const row = await prisma.testimonial.delete({ where: { id } });
    await logActivity(admin, {
      action: "testimonial.delete",
      entityType: "testimonial",
      entityId: id,
      summary: `Deleted testimonial from ${row.name}`,
    });
    revalidateSite();
    return { success: true };
  } catch (error) {
    return persistenceFailure(error, "testimonial");
  }
}

export async function reorderTestimonials(ids: string[]): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = reorderSchema.safeParse(ids);
  if (!parsed.success) return BAD_ORDER;
  try {
    await prisma.$transaction(
      parsed.data.map((id, index) => prisma.testimonial.update({ where: { id }, data: { displayOrder: index } })),
    );
    await logActivity(admin, { action: "testimonial.reorder", entityType: "testimonial", summary: "Reordered testimonials" });
    revalidateSite();
    return { success: true };
  } catch (error) {
    return persistenceFailure(error, "testimonial");
  }
}

/* -------------------------------------------------------------------------- */
/* Technologies                                                               */
/* -------------------------------------------------------------------------- */

export async function saveTechnology(
  id: string | null,
  input: TechnologyInput,
): Promise<ActionResult<{ id: string }>> {
  const admin = await requireAdmin();
  if (id !== null && !idSchema.safeParse(id).success) return MISSING_ID;
  const parsed = technologySchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  try {
    const data = nullify(parsed.data);
    const row = id
      ? await prisma.technology.update({ where: { id }, data })
      : await prisma.technology.create({
          data: { ...data, displayOrder: await prisma.technology.count() },
        });
    await logActivity(admin, {
      action: id ? "technology.update" : "technology.create",
      entityType: "technology",
      entityId: row.id,
      summary: `${id ? "Updated" : "Added"} technology “${row.name}”`,
    });
    revalidateSite();
    return { success: true, data: { id: row.id } };
  } catch (error) {
    // Name and slug are both unique; report against the name field.
    return persistenceFailure(error, "technology", "name");
  }
}

export async function setTechnologyActive(id: string, isActive: boolean): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!idSchema.safeParse(id).success) return MISSING_ID;
  try {
    const row = await prisma.technology.update({ where: { id }, data: { isActive: Boolean(isActive) } });
    await logActivity(admin, {
      action: isActive ? "technology.activate" : "technology.deactivate",
      entityType: "technology",
      entityId: id,
      summary: `${isActive ? "Activated" : "Deactivated"} technology “${row.name}”`,
    });
    revalidateSite();
    return { success: true };
  } catch (error) {
    return persistenceFailure(error, "technology");
  }
}

export async function deleteTechnology(id: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!idSchema.safeParse(id).success) return MISSING_ID;
  try {
    const row = await prisma.technology.delete({ where: { id } });
    await logActivity(admin, {
      action: "technology.delete",
      entityType: "technology",
      entityId: id,
      summary: `Deleted technology “${row.name}”`,
    });
    revalidateSite();
    return { success: true };
  } catch (error) {
    return persistenceFailure(error, "technology");
  }
}

export async function reorderTechnologies(ids: string[]): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = reorderSchema.safeParse(ids);
  if (!parsed.success) return BAD_ORDER;
  try {
    await prisma.$transaction(
      parsed.data.map((id, index) => prisma.technology.update({ where: { id }, data: { displayOrder: index } })),
    );
    await logActivity(admin, { action: "technology.reorder", entityType: "technology", summary: "Reordered technologies" });
    revalidateSite();
    return { success: true };
  } catch (error) {
    return persistenceFailure(error, "technology");
  }
}
