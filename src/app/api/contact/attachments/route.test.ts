import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@vercel/blob/client", () => ({
  handleUpload: vi.fn(),
}));

import { handleUpload } from "@vercel/blob/client";
import { __resetRateLimit } from "@/lib/rate-limit";
import { POST } from "./route";

const mockedHandleUpload = vi.mocked(handleUpload);
const originalBlobToken = process.env.BLOB_READ_WRITE_TOKEN;

function uploadRequest(ip = "203.0.113.10"): Request {
  return new Request("http://localhost/api/contact/attachments", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify({ type: "blob.generate-client-token" }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  __resetRateLimit();
  process.env.BLOB_READ_WRITE_TOKEN = "test_blob_token";
});

afterEach(() => {
  if (originalBlobToken === undefined) {
    delete process.env.BLOB_READ_WRITE_TOKEN;
  } else {
    process.env.BLOB_READ_WRITE_TOKEN = originalBlobToken;
  }
});

describe("contact attachment upload route", () => {
  it("returns 503 when Blob storage is not configured", async () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;

    const response = await POST(uploadRequest());

    expect(response.status).toBe(503);
    expect(mockedHandleUpload).not.toHaveBeenCalled();
  });

  it("issues a constrained public upload token", async () => {
    mockedHandleUpload.mockImplementation(async (options) => {
      const constraints = await options.onBeforeGenerateToken(
        "contact-ideas/brief.pdf",
        null,
        false,
      );
      expect(constraints.allowedContentTypes).toContain("application/pdf");
      expect(constraints.allowedContentTypes).toContain("image/webp");
      expect(constraints.maximumSizeInBytes).toBe(8 * 1024 * 1024);
      expect(options.token).toBe("test_blob_token");
      return { type: "blob.generate-client-token", clientToken: "signed" };
    });

    const response = await POST(uploadRequest());

    expect(response.status).toBe(200);
  });

  it("rejects token generation outside the contact-ideas prefix", async () => {
    mockedHandleUpload.mockImplementation(async (options) => {
      await options.onBeforeGenerateToken("projects/secret.webp", null, false);
      return { type: "blob.generate-client-token", clientToken: "unreachable" };
    });
    vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await POST(uploadRequest());

    expect(response.status).toBe(400);
  });
});
