import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { getCurrentAdmin } from "@/lib/auth";
import { ALLOWED_UPLOAD_TYPES, MAX_VIDEO_BYTES } from "@/lib/validation";
import { isUploadFolder, storageMode } from "@/server/media/storage";

/**
 * GET  → which upload mode the browser should use.
 * POST → Vercel Blob client-upload handshake: issues a short-lived token for a
 *        direct browser → Blob upload, only to signed-in admins and only into
 *        known CMS folders with allowed content types.
 */

export async function GET(): Promise<NextResponse> {
  if (!(await getCurrentAdmin())) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  return NextResponse.json({ mode: storageMode() });
}

export async function POST(request: Request): Promise<NextResponse> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Blob storage is not configured." }, { status: 503 });
  }

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  }

  try {
    const response = await handleUpload({
      body,
      request,
      token,
      onBeforeGenerateToken: async (pathname) => {
        const admin = await getCurrentAdmin();
        if (!admin) throw new Error("Authentication required.");

        const [folder, ...rest] = pathname.split("/");
        if (!folder || !isUploadFolder(folder) || rest.length === 0 || pathname.includes("..")) {
          throw new Error("Invalid upload path.");
        }

        return {
          allowedContentTypes: [...ALLOWED_UPLOAD_TYPES],
          maximumSizeInBytes: MAX_VIDEO_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ adminId: admin.id }),
        };
      },
      // The browser registers the file via the `registerMediaAsset` action
      // after upload (this webhook can't reach localhost in development).
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(response);
  } catch (error) {
    console.error("Upload token request failed", error);
    return NextResponse.json({ error: "Unable to upload this file." }, { status: 400 });
  }
}
