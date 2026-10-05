import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EventType } from "@prisma/client";
import { Readable } from "node:stream";

/**
 * Resume Route Handler tests (Requirements 1.5, 13.3; Properties 5 & 6).
 *
 * The filesystem is mocked via `@/lib/fs` (a thin project wrapper around
 * node:fs / node:fs/promises) so the test controls whether the resume "exists"
 * without depending on a real file. The analytics action is mocked so the
 * download event is observable without a database.
 *
 * Mocking `@/lib/fs` rather than the Node.js built-ins directly avoids the
 * ESM non-configurable-property limitation: project modules are fully
 * replaceable in Vitest's module registry, whereas `node:fs/promises.stat` is
 * a non-configurable export that cannot be spied on.
 */

vi.mock("@/actions/analytics", () => ({
  __esModule: true,
  recordEvent: vi.fn(async () => undefined),
}));

vi.mock("@/lib/fs", () => ({
  stat: vi.fn(),
  createReadStream: vi.fn(),
}));

import { recordEvent } from "@/actions/analytics";
import { stat, createReadStream } from "@/lib/fs";
import { GET } from "./route";

const mockedRecordEvent = recordEvent as unknown as ReturnType<typeof vi.fn>;
const mockedStat = stat as unknown as ReturnType<typeof vi.fn>;
const mockedCreateReadStream = createReadStream as unknown as ReturnType<
  typeof vi.fn
>;

/** A tiny readable Node stream standing in for the file contents. */
function fakeReadStream(contents = "%PDF-1.4 fake") {
  // The route converts this Node stream to a web stream via Readable.toWeb;
  // returning a real Node Readable keeps that path exercised.
  return Readable.from([Buffer.from(contents)]);
}

beforeEach(() => {
  mockedStat.mockReset();
  mockedCreateReadStream.mockReset();
  mockedRecordEvent.mockReset();
  mockedRecordEvent.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GET /resume — happy path (Req 1.5, 13.3; Property 5)", () => {
  it("streams the PDF with download headers and records a RESUME_DOWNLOAD event", async () => {
    mockedStat.mockResolvedValueOnce({ isFile: () => true, size: 4242 });
    mockedCreateReadStream.mockReturnValueOnce(fakeReadStream());

    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/pdf");
    expect(response.headers.get("content-disposition")).toContain("attachment");
    expect(response.headers.get("content-disposition")).toContain("resume.pdf");
    expect(response.headers.get("content-length")).toBe("4242");

    // Exactly one RESUME_DOWNLOAD event recorded (Property 5).
    expect(mockedRecordEvent).toHaveBeenCalledTimes(1);
    expect(mockedRecordEvent).toHaveBeenCalledWith({
      type: EventType.RESUME_DOWNLOAD,
      path: "/resume",
    });

    // Body is the streamed file contents.
    const body = await response.text();
    expect(body).toContain("%PDF-1.4");
  });
});

describe("GET /resume — missing file (design error strategy)", () => {
  it("returns 404 and records no event when the file does not exist", async () => {
    mockedStat.mockRejectedValueOnce(
      Object.assign(new Error("ENOENT"), { code: "ENOENT" }),
    );

    const response = await GET();

    expect(response.status).toBe(404);
    expect(await response.text()).toMatch(/not found/i);
    // No download happened, so no analytics event is recorded.
    expect(mockedRecordEvent).not.toHaveBeenCalled();
    expect(mockedCreateReadStream).not.toHaveBeenCalled();
  });

  it("returns 404 when the path exists but is not a regular file", async () => {
    mockedStat.mockResolvedValueOnce({ isFile: () => false, size: 0 });

    const response = await GET();

    expect(response.status).toBe(404);
    expect(mockedRecordEvent).not.toHaveBeenCalled();
  });
});

describe("GET /resume — non-blocking analytics (Property 6; Req 13.7)", () => {
  it("still serves the download when recording the event rejects", async () => {
    mockedStat.mockResolvedValueOnce({ isFile: () => true, size: 303 });
    mockedCreateReadStream.mockReturnValueOnce(fakeReadStream());
    mockedRecordEvent.mockRejectedValueOnce(new Error("db down"));

    const response = await GET();

    // The visitor still gets their file even though analytics failed.
    expect(response.status).toBe(200);
    expect(mockedRecordEvent).toHaveBeenCalledTimes(1);
  });
});
