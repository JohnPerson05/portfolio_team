import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

import { getCurrentAdmin } from "@/lib/auth";
import { ALLOWED_UPLOAD_TYPES, MAX_IMAGE_BYTES, MAX_VIDEO_BYTES } from "@/lib/validation";
import {
  isUploadFolder,
  LOCAL_UPLOAD_DIR,
  LOCAL_UPLOAD_PREFIX,
  storageMode,
} from "@/server/media/storage";

/**
 * Development-only upload target used when no Blob token is configured.
 * Writes into `public/uploads/<folder>/`. Disabled in production.
 */

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/svg+xml": "svg",
  "video/mp4": "mp4",
};

function safeBaseName(name: string): string {
  return (
    name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "file"
  );
}

/** Reject SVGs that could execute script when opened directly. */
function isUnsafeSvg(content: string): boolean {
  return /<script|javascript:|\son[a-z]+\s*=|<foreignObject/i.test(content);
}

export async function POST(request: Request): Promise<NextResponse> {
  if (storageMode() !== "local") {
    return NextResponse.json({ error: "Local uploads are disabled." }, { status: 404 });
  }
  if (!(await getCurrentAdmin())) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const file = form.get("file");
  const folder = String(form.get("folder") ?? "");
  if (!(file instanceof File) || !isUploadFolder(folder)) {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }
  if (!(ALLOWED_UPLOAD_TYPES as readonly string[]).includes(file.type)) {
    return NextResponse.json({ error: "This file type isn't supported." }, { status: 415 });
  }
  const limit = file.type.startsWith("video/") ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > limit) {
    return NextResponse.json({ error: "This file is too large." }, { status: 413 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  if (file.type === "image/svg+xml" && isUnsafeSvg(bytes.toString("utf8"))) {
    return NextResponse.json({ error: "This SVG contains scripts and can't be uploaded." }, { status: 415 });
  }

  const filename = `${safeBaseName(file.name)}-${randomBytes(4).toString("hex")}.${EXTENSIONS[file.type]}`;
  const dir = path.join(LOCAL_UPLOAD_DIR, folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), bytes);

  const pathname = `${folder}/${filename}`;
  return NextResponse.json({ url: `${LOCAL_UPLOAD_PREFIX}${pathname}`, pathname });
}
