import { unlink } from "node:fs/promises";
import path from "node:path";
import { del } from "@vercel/blob";

/**
 * Where uploads go.
 *
 *  - `blob`     — Vercel Blob (production). Browsers upload directly to Blob
 *                 with a short-lived token from `/api/admin/uploads`.
 *  - `local`    — development without a Blob token: files are written to
 *                 `public/uploads/` by `/api/admin/uploads/local`.
 *  - `disabled` — production without a Blob token. Uploads are refused; paste
 *                 URLs instead or configure `BLOB_READ_WRITE_TOKEN`.
 */
export type StorageMode = "blob" | "local" | "disabled";

export function storageMode(): StorageMode {
  if (process.env.BLOB_READ_WRITE_TOKEN) return "blob";
  if (process.env.NODE_ENV !== "production") return "local";
  return "disabled";
}

export const LOCAL_UPLOAD_PREFIX = "/uploads/";
export const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const BLOB_HOST = /^[a-z0-9-]+\.public\.blob\.vercel-storage\.com$/i;

export function isBlobUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && BLOB_HOST.test(parsed.hostname);
  } catch {
    return false;
  }
}

export function isLocalUploadUrl(url: string): boolean {
  return (
    url.startsWith(LOCAL_UPLOAD_PREFIX) &&
    !url.includes("..") &&
    /^\/uploads\/[a-z0-9/_.-]+$/i.test(url)
  );
}

/** True when `url` points at storage this app owns (so we may delete it). */
export function isOwnedUpload(url: string): boolean {
  return isBlobUrl(url) || isLocalUploadUrl(url);
}

/** Best-effort removal of the underlying file. */
export async function deleteStoredFile(url: string): Promise<void> {
  if (isBlobUrl(url) && process.env.BLOB_READ_WRITE_TOKEN) {
    await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
    return;
  }
  if (isLocalUploadUrl(url)) {
    const target = path.join(LOCAL_UPLOAD_DIR, url.slice(LOCAL_UPLOAD_PREFIX.length));
    if (!target.startsWith(LOCAL_UPLOAD_DIR + path.sep)) return;
    await unlink(target).catch(() => undefined);
  }
}

/** Upload folders the CMS uses; anything else is rejected. */
export const UPLOAD_FOLDERS = [
  "projects",
  "team",
  "services",
  "testimonials",
  "technologies",
  "process",
  "settings",
  "media",
] as const;

export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export function isUploadFolder(value: string): value is UploadFolder {
  return (UPLOAD_FOLDERS as readonly string[]).includes(value);
}
