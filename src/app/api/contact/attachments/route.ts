import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { getClientIp } from "@/lib/client-ip";
import {
  CONTACT_ATTACHMENT_CONTENT_TYPES,
  CONTACT_ATTACHMENT_MAX_BYTES,
  CONTACT_ATTACHMENT_PREFIX,
} from "@/lib/contact-attachments";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request): Promise<NextResponse> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "File storage is not configured." },
      { status: 503 },
    );
  }

  const clientIp = getClientIp(request.headers);
  const { allowed } = checkRateLimit(`contact-upload:${clientIp}`, {
    limit: 20,
    windowMs: 15 * 60 * 1000,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many uploads. Please try again later." },
      { status: 429 },
    );
  }

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid upload request." },
      { status: 400 },
    );
  }

  try {
    const response = await handleUpload({
      body,
      request,
      token,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith(CONTACT_ATTACHMENT_PREFIX)) {
          throw new Error("Invalid attachment path.");
        }

        return {
          allowedContentTypes: [...CONTACT_ATTACHMENT_CONTENT_TYPES],
          maximumSizeInBytes: CONTACT_ATTACHMENT_MAX_BYTES,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // The contact form persists the returned public URL with the inquiry.
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Contact attachment upload failed", error);
    return NextResponse.json(
      { error: "Unable to upload this file." },
      { status: 400 },
    );
  }
}
