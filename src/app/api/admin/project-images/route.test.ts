import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@vercel/blob/client", () => ({
  handleUpload: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getSession: vi.fn(),
}));

import { handleUpload } from "@vercel/blob/client";
import { getSession } from "@/lib/auth";
import { POST } from "./route";

const mockedHandleUpload = vi.mocked(handleUpload);
const mockedGetSession = vi.mocked(getSession);
const originalBlobToken = process.env.BLOB_READ_WRITE_TOKEN;

function uploadRequest(): Request {
  return new Request("http://localhost/api/admin/project-images", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ type: "blob.generate-client-token" }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.BLOB_READ_WRITE_TOKEN = "test_blob_token";
});

afterEach(() => {
  if (originalBlobToken === undefined) {
    delete process.env.BLOB_READ_WRITE_TOKEN;
  } else {
    process.env.BLOB_READ_WRITE_TOKEN = originalBlobToken;
  }
});

describe("project image upload route", () => {
  it("returns 503 when Blob storage is not configured", async () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;

    const response = await POST(uploadRequest());

    expect(response.status).toBe(503);
    expect(mockedHandleUpload).not.toHaveBeenCalled();
  });

  it("issues a constrained upload token to an authenticated owner", async () => {
    mockedGetSession.mockResolvedValue({
      sub: "owner@example.com",
      iat: 1,
      exp: 2,
    });
    mockedHandleUpload.mockImplementation(async (options) => {
      const constraints = await options.onBeforeGenerateToken(
        "projects/example/cover.webp",
        null,
        false,
      );
      expect(constraints.allowedContentTypes).toContain("image/webp");
      expect(constraints.maximumSizeInBytes).toBe(10 * 1024 * 1024);
      expect(options.token).toBe("test_blob_token");
      return { type: "blob.generate-client-token", clientToken: "signed" };
    });

    const response = await POST(uploadRequest());

    expect(response.status).toBe(200);
    expect(mockedGetSession).toHaveBeenCalledOnce();
  });

  it("rejects token generation without an authenticated session", async () => {
    mockedGetSession.mockResolvedValue(null);
    mockedHandleUpload.mockImplementation(async (options) => {
      await options.onBeforeGenerateToken(
        "projects/example/cover.webp",
        null,
        false,
      );
      return { type: "blob.generate-client-token", clientToken: "unreachable" };
    });
    vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await POST(uploadRequest());

    expect(response.status).toBe(400);
  });
});
