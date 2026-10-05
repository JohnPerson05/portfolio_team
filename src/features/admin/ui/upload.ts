"use client";

import { registerMediaAsset } from "@/actions/media";
import { ALLOWED_UPLOAD_TYPES, MAX_IMAGE_BYTES, MAX_VIDEO_BYTES } from "@/lib/validation/cms";
import type { UploadFolder } from "@/server/media/storage";

/**
 * Browser-side upload: sends the file to Vercel Blob (production) or the
 * dev-only local endpoint, then records it in the media library.
 */

type Mode = "blob" | "local" | "disabled";
let modePromise: Promise<Mode> | null = null;

function getMode(): Promise<Mode> {
  modePromise ??= fetch("/api/admin/uploads", { credentials: "same-origin" })
    .then((r) => (r.ok ? r.json() : { mode: "disabled" }))
    .then((body: { mode?: Mode }) => body.mode ?? "disabled")
    .catch(() => "disabled" as Mode);
  return modePromise;
}

export const ACCEPT_IMAGES = "image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml";
export const ACCEPT_MEDIA = `${ACCEPT_IMAGES},video/mp4`;

export class UploadError extends Error {}

function safeName(name: string): string {
  const dot = name.lastIndexOf(".");
  const base = (dot > 0 ? name.slice(0, dot) : name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  return `${base || "file"}${ext ? `.${ext}` : ""}`;
}

async function readDimensions(file: File): Promise<{ width?: number; height?: number }> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") return {};
  try {
    const bitmap = await createImageBitmap(file);
    const dims = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return dims;
  } catch {
    return {};
  }
}

export function validateFile(file: File): string | null {
  if (!(ALLOWED_UPLOAD_TYPES as readonly string[]).includes(file.type)) {
    return "Use JPG, PNG, WEBP, AVIF, GIF, SVG, or MP4.";
  }
  const limit = file.type.startsWith("video/") ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > limit) {
    return `That file is too large (max ${Math.round(limit / 1024 / 1024)} MB).`;
  }
  return null;
}

export async function uploadFile(file: File, folder: UploadFolder): Promise<{ url: string; contentType: string }> {
  const problem = validateFile(file);
  if (problem) throw new UploadError(problem);

  const mode = await getMode();
  let url: string;
  let pathname: string;

  if (mode === "blob") {
    const { upload } = await import("@vercel/blob/client");
    const result = await upload(`${folder}/${safeName(file.name)}`, file, {
      access: "public",
      handleUploadUrl: "/api/admin/uploads",
      contentType: file.type,
    });
    url = result.url;
    pathname = result.pathname;
  } else if (mode === "local") {
    const form = new FormData();
    form.set("file", file);
    form.set("folder", folder);
    const response = await fetch("/api/admin/uploads/local", { method: "POST", body: form });
    const body = (await response.json().catch(() => ({}))) as { url?: string; pathname?: string; error?: string };
    if (!response.ok || !body.url || !body.pathname) {
      throw new UploadError(body.error ?? "Upload failed.");
    }
    url = body.url;
    pathname = body.pathname;
  } else {
    throw new UploadError(
      "Uploads aren't configured on this deployment. Add BLOB_READ_WRITE_TOKEN, or paste an image URL instead.",
    );
  }

  const result = await registerMediaAsset({
    url,
    pathname,
    filename: file.name.slice(0, 255),
    contentType: file.type,
    size: file.size,
    ...(await readDimensions(file)),
  });
  if (!result?.success) {
    throw new UploadError(result?.formError ?? "Uploaded, but couldn't add it to the media library.");
  }
  return { url, contentType: file.type };
}
