import { describe, expect, it } from "vitest";

import { testimonialSchema } from "./testimonial";

const validInput = {
  quote: "An exceptional engineer who elevates every team.",
  author: "Grace Hopper",
  role: "VP of Engineering",
  company: "Navy",
  avatarUrl: "https://example.com/avatar.png",
  logoUrl: "https://example.com/logo.png",
  order: 0,
};

describe("testimonialSchema — valid input", () => {
  it("accepts a complete testimonial", () => {
    expect(testimonialSchema.safeParse(validInput).success).toBe(true);
  });

  it("accepts a minimal testimonial without optional media or company", () => {
    const result = testimonialSchema.safeParse({
      quote: validInput.quote,
      author: validInput.author,
      role: validInput.role,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.company).toBeUndefined();
      expect(result.data.avatarUrl).toBeUndefined();
      expect(result.data.logoUrl).toBeUndefined();
      expect(result.data.order).toBe(0);
    }
  });

  it("normalizes empty media URLs to undefined", () => {
    const result = testimonialSchema.safeParse({
      ...validInput,
      avatarUrl: "",
      logoUrl: "",
      company: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.avatarUrl).toBeUndefined();
      expect(result.data.logoUrl).toBeUndefined();
      expect(result.data.company).toBeUndefined();
    }
  });
});

describe("testimonialSchema — invalid input", () => {
  it("rejects a malformed avatarUrl", () => {
    expect(
      testimonialSchema.safeParse({ ...validInput, avatarUrl: "not-a-url" })
        .success,
    ).toBe(false);
  });

  it("rejects a malformed logoUrl", () => {
    expect(
      testimonialSchema.safeParse({ ...validInput, logoUrl: "not-a-url" })
        .success,
    ).toBe(false);
  });

  it("rejects an empty quote", () => {
    expect(
      testimonialSchema.safeParse({ ...validInput, quote: "   " }).success,
    ).toBe(false);
  });

  it("rejects an empty author", () => {
    expect(
      testimonialSchema.safeParse({ ...validInput, author: "" }).success,
    ).toBe(false);
  });
});
