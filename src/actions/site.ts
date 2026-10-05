"use server";

import { z } from "zod";
import type { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import {
  assetSchema,
  homepageSectionsSchema,
  linkSchema,
  navigationSchema,
} from "@/lib/validation";
import { logActivity } from "@/server/admin/activity";
import {
  persistenceFailure,
  revalidateSite,
  validationFailure,
} from "@/server/admin/mutations";
import {
  isSettingKey,
  SETTINGS_REGISTRY,
  type SettingType,
} from "@/server/settings/registry";
import { HOMEPAGE_SECTION_KEYS } from "@/server/content/defaults";
import type { ActionResult } from "@/types";

/* -------------------------------------------------------------------------- */
/* Settings                                                                   */
/* -------------------------------------------------------------------------- */

const emptyOr = <T extends z.ZodTypeAny>(schema: T) =>
  z.union([z.literal(""), schema]);

const VALUE_SCHEMAS: Record<SettingType, z.ZodTypeAny> = {
  text: z.string().trim().max(300, "Keep this under 300 characters"),
  textarea: z.string().trim().max(5_000, "Keep this under 5,000 characters"),
  url: emptyOr(linkSchema),
  email: emptyOr(z.string().trim().email("Enter a valid email").max(254)),
  image: emptyOr(assetSchema),
  list: z
    .array(z.string().trim().min(1, "Remove empty rows").max(200))
    .max(30, "No more than 30 entries"),
  items: z
    .array(
      z.object({
        title: z.string().trim().min(1, "Each item needs a title").max(200),
        body: z.string().trim().max(1_000),
      }),
    )
    .max(20),
  chapters: z
    .array(
      z.object({
        label: z.string().trim().min(1, "Each chapter needs a label").max(80),
        title: z.string().trim().min(1, "Each chapter needs a title").max(200),
        body: z.string().trim().max(1_000),
      }),
    )
    .max(8),
  stats: z
    .array(
      z.object({
        label: z.string().trim().min(1, "Each number needs a label").max(100),
        value: z.number({ invalid_type_error: "Enter a number" }).finite().min(0).max(1_000_000),
        suffix: z.string().trim().max(8).optional(),
      }),
    )
    .max(12),
};

/** Save any subset of settings. Unknown keys are rejected. */
export async function saveSettings(
  values: Record<string, unknown>,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  if (!values || typeof values !== "object" || Array.isArray(values)) {
    return { success: false, formError: "Invalid settings payload." };
  }

  const fieldErrors: Record<string, string[]> = {};
  const writes: { key: string; value: Prisma.InputJsonValue; type: string }[] = [];

  for (const [key, raw] of Object.entries(values)) {
    if (!isSettingKey(key)) {
      fieldErrors[key] = ["Unknown setting."];
      continue;
    }
    const def = SETTINGS_REGISTRY[key];
    const parsed = VALUE_SCHEMAS[def.type].safeParse(raw);
    if (!parsed.success) {
      fieldErrors[key] = parsed.error.issues.map((i) => i.message);
      continue;
    }
    writes.push({ key, value: parsed.data as Prisma.InputJsonValue, type: def.type });
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors, formError: "Please fix the highlighted fields." };
  }

  try {
    await prisma.$transaction(
      writes.map(({ key, value, type }) =>
        prisma.siteSetting.upsert({
          where: { key },
          create: { key, value, type },
          update: { value, type },
        }),
      ),
    );
    await logActivity(admin, {
      action: "settings.update",
      entityType: "settings",
      summary: `Updated ${writes.length} setting${writes.length === 1 ? "" : "s"}`,
    });
    revalidateSite();
    return { success: true };
  } catch (error) {
    return persistenceFailure(error, "settings");
  }
}

/* -------------------------------------------------------------------------- */
/* Homepage sections                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Save the homepage section list. The array order IS the display order; only
 * keys that have a renderer are accepted.
 */
export async function saveHomepageSections(input: unknown): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = homepageSectionsSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  const unknown = parsed.data.filter((s) => !HOMEPAGE_SECTION_KEYS.includes(s.key));
  if (unknown.length > 0) {
    return { success: false, formError: `Unknown section: ${unknown.map((s) => s.key).join(", ")}` };
  }

  try {
    await prisma.$transaction(
      parsed.data.map((section, index) => {
        const data = {
          label: section.label,
          eyebrow: section.eyebrow ?? null,
          title: section.title ?? null,
          description: section.description ?? null,
          isEnabled: section.isEnabled,
          displayOrder: index,
        };
        return prisma.homepageSection.upsert({
          where: { key: section.key },
          create: { key: section.key, ...data },
          update: data,
        });
      }),
    );
    await logActivity(admin, {
      action: "homepage.update",
      entityType: "homepage",
      summary: "Updated homepage sections",
    });
    revalidateSite();
    return { success: true };
  } catch (error) {
    return persistenceFailure(error, "homepage");
  }
}

/* -------------------------------------------------------------------------- */
/* Navigation                                                                 */
/* -------------------------------------------------------------------------- */

/** Replace the navigation with the given ordered list. */
export async function saveNavigation(input: unknown): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = navigationSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  try {
    await prisma.$transaction([
      prisma.navigationItem.deleteMany(),
      prisma.navigationItem.createMany({
        data: parsed.data.map((item, index) => ({ ...item, displayOrder: index })),
      }),
    ]);
    await logActivity(admin, {
      action: "navigation.update",
      entityType: "navigation",
      summary: "Updated navigation",
    });
    revalidateSite();
    return { success: true };
  } catch (error) {
    return persistenceFailure(error, "navigation");
  }
}
