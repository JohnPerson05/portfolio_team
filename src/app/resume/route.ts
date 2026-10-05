import { join } from "node:path";
import { Readable } from "node:stream";
import { EventType } from "@prisma/client";
import { recordEvent } from "@/actions/analytics";
import { createReadStream, stat } from "@/lib/fs";

/**
 * `/resume` — the resume download Route Handler (Requirements 1.5, 13.3;
 * Correctness Properties 5 & 6).
 *
 * On `GET` it streams the resume PDF from `public/resume.pdf` with headers that
 * prompt a download (`Content-Disposition: attachment`) and records a single
 * `RESUME_DOWNLOAD` analytics event. If the file is missing it returns a 404
 * with a plain-text message rather than a broken/empty download
 * (design "Resume route" error strategy).
 *
 * Runtime: forced to Node.js because it reads from the filesystem and streams a
 * `node:fs` read stream — the Edge runtime has no filesystem access.
 *
 * Analytics (Properties 5 & 6 / Requirement 13.7): the event is recorded via
 * {@link recordEvent}, which already swallows its own failures, and we
 * additionally fire-and-forget (no `await`) and defensively catch, so analytics
 * can never block or break the download. The event is only recorded on the
 * success path — a missing file (404) records nothing.
 */
export const runtime = "nodejs";

/** Absolute path to the resume file served by this route. */
const RESUME_PATH = join(process.cwd(), "public", "resume.pdf");

/** Filename suggested to the browser when downloading. */
const DOWNLOAD_FILENAME = "resume.pdf";

export async function GET(): Promise<Response> {
  let fileSize: number;
  try {
    const stats = await stat(RESUME_PATH);
    if (!stats.isFile()) {
      return resumeNotFound();
    }
    fileSize = stats.size;
  } catch {
    // ENOENT (or any stat failure) → the resume is unavailable.
    return resumeNotFound();
  }

  // Record the download without blocking the response (Properties 5 & 6).
  void Promise.resolve(
    recordEvent({ type: EventType.RESUME_DOWNLOAD, path: "/resume" }),
  ).catch(() => {
    /* analytics must never disrupt the visitor experience */
  });

  // Stream the file rather than buffering it fully into memory.
  const nodeStream = createReadStream(RESUME_PATH);
  const webStream = Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;

  return new Response(webStream, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${DOWNLOAD_FILENAME}"`,
      "Content-Length": String(fileSize),
      // The resume rarely changes; allow caching while permitting revalidation.
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}

/** A consistent 404 response for when the resume file is absent. */
function resumeNotFound(): Response {
  return new Response("Resume not found.", {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
