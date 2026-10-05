import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const PROJECT_IMAGE_PREFIX = "projects/";

export async function POST(request: Request): Promise<NextResponse> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Image storage is not configured." },
      { status: 503 },
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
        const session = await getSession();
        if (!session) {
          throw new Error("Authentication required.");
        }
        if (!pathname.startsWith(PROJECT_IMAGE_PREFIX)) {
          throw new Error("Invalid project image path.");
        }

        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/avif",
          ],
          maximumSizeInBytes: MAX_IMAGE_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ owner: session.sub }),
        };
      },
      onUploadCompleted: async () => {
        // The project form persists the returned public URL with the project.
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Project image upload failed", error);
    return NextResponse.json(
      { error: "Unable to upload this image." },
      { status: 400 },
    );
  }
}
