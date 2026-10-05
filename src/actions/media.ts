"use server";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { idSchema, mediaAssetSchema, MAX_IMAGE_BYTES } from "@/lib/validation";
import { logActivity } from "@/server/admin/activity";
import { persistenceFailure, revalidateSite, validationFailure } from "@/server/admin/mutations";
import {
  deleteStoredFile,
  isBlobUrl,
  isLocalUploadUrl,
  storageMode,
} from "@/server/media/storage";
import { findMediaUsage } from "@/server/media/usage";
import type { ActionResult } from "@/types";

export interface RegisteredMedia {
  id: string;
  url: string;
}

/**
 * Record a file the browser just uploaded so it appears in the media library.
 * Only URLs that point at this app's own storage are accepted.
 */
export async function registerMediaAsset(input: unknown): Promise<ActionResult<RegisteredMedia>> {
  const admin = await requireAdmin();
  const parsed = mediaAssetSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  const data = parsed.data;

  const mode = storageMode();
  const owned = mode === "blob" ? isBlobUrl(data.url) : mode === "local" && isLocalUploadUrl(data.url);
  if (!owned) return { success: false, formError: "That file did not come from this site's storage." };
  if (!data.contentType.startsWith("video/") && data.size > MAX_IMAGE_BYTES) {
    return { success: false, formError: "Images must be 10 MB or smaller." };
  }

  try {
    const row = await prisma.mediaAsset.upsert({
      where: { url: data.url },
      create: { ...data, uploadedById: admin.id },
      update: {},
    });
    await logActivity(admin, {
      action: "media.upload",
      entityType: "media",
      entityId: row.id,
      summary: `Uploaded ${row.filename}`,
    });
    return { success: true, data: { id: row.id, url: row.url } };
  } catch (error) {
    return persistenceFailure(error, "file");
  }
}

/**
 * Delete a file from the library and from storage. Refuses while the file is
 * still referenced unless `force` is set (the UI asks first).
 */
export async function deleteMediaAsset(
  id: string,
  { force = false }: { force?: boolean } = {},
): Promise<ActionResult<{ usedBy?: string[] }>> {
  const admin = await requireAdmin();
  if (!idSchema.safeParse(id).success) return { success: false, formError: "Missing id." };

  try {
    const asset = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) return { success: true };

    const usedBy = (await findMediaUsage([asset.url])).get(asset.url) ?? [];
    if (usedBy.length > 0 && !force) {
      return {
        success: false,
        formError: `Still used by: ${usedBy.join(", ")}`,
      };
    }

    await deleteStoredFile(asset.url).catch((error) => {
      console.error("Failed to delete stored file", error);
    });
    await prisma.mediaAsset.delete({ where: { id } });
    await logActivity(admin, {
      action: "media.delete",
      entityType: "media",
      entityId: id,
      summary: `Deleted ${asset.filename}`,
    });
    revalidateSite();
    return { success: true };
  } catch (error) {
    return persistenceFailure(error, "file");
  }
}
