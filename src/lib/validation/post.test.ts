import { PostStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { postSchema } from "./post";

const validInput = {
  title: "Shipping fast with Server Actions",
  slug: "shipping-fast-with-server-actions",
  excerpt: "How we cut our API surface in half.",
  content: "The full article body goes here.",
  status: PostStatus.PUBLISHED,
  publishedAt: new Date("2024-01-15T00:00:00.000Z"),
};

describe("postSchema — valid input", () => {
  it("accepts a published post", () => {
    expect(postSchema.safeParse(validInput).success).toBe(true);
  });

  it("accepts a DRAFT post", () => {
    expect(
      postSchema.safeParse({ ...validInput, status: PostStatus.DRAFT })
        .success,
    ).toBe(true);
  });

  it("defaults status to DRAFT when omitted", () => {
    const { status: _status, ...rest } = validInput;
    const result = postSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(PostStatus.DRAFT);
    }
  });

  it("accepts a null publishedAt", () => {
    expect(
      postSchema.safeParse({ ...validInput, publishedAt: null }).success,
    ).toBe(true);
  });

  it("coerces an ISO date string for publishedAt", () => {
    const result = postSchema.safeParse({
      ...validInput,
      publishedAt: "2024-02-01T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.publishedAt).toBeInstanceOf(Date);
    }
  });
});

describe("postSchema — invalid input", () => {
  it("rejects an invalid status", () => {
    expect(
      postSchema.safeParse({ ...validInput, status: "ARCHIVED" }).success,
    ).toBe(false);
  });

  it("rejects an empty content field", () => {
    expect(
      postSchema.safeParse({ ...validInput, content: "   " }).success,
    ).toBe(false);
  });

  it("rejects a non-URL-safe slug", () => {
    expect(
      postSchema.safeParse({ ...validInput, slug: "Bad Slug" }).success,
    ).toBe(false);
  });

  it("rejects a malformed coverUrl", () => {
    expect(
      postSchema.safeParse({ ...validInput, coverUrl: "not-a-url" }).success,
    ).toBe(false);
  });
});
