import { describe, expect, it } from "vitest";
import type { TestimonialView } from "@/types";
import { hasMedia, hasReferencePhoto, orderTestimonials } from "./config";

/** Build a TestimonialView with overridable fields. */
function makeTestimonial(
  order: number,
  overrides: Partial<TestimonialView> = {},
): TestimonialView {
  return {
    id: `t-${order}`,
    quote: `Quote ${order}`,
    author: `Author ${order}`,
    role: `Role ${order}`,
    company: `Company ${order}`,
    avatarUrl: undefined,
    logoUrl: undefined,
    order,
    ...overrides,
  };
}

describe("orderTestimonials (Req 6.1 — display ordering by `order`)", () => {
  it("orders testimonials by `order` ascending regardless of input order", () => {
    const result = orderTestimonials([
      makeTestimonial(3),
      makeTestimonial(1),
      makeTestimonial(2),
    ]);
    expect(result.map((t) => t.order)).toEqual([1, 2, 3]);
  });

  it("does not mutate the input array", () => {
    const input = [makeTestimonial(2), makeTestimonial(1)];
    const snapshot = input.map((t) => t.order);
    orderTestimonials(input);
    expect(input.map((t) => t.order)).toEqual(snapshot);
  });

  it("is idempotent — re-ordering already ordered entries is stable", () => {
    const first = orderTestimonials([
      makeTestimonial(3),
      makeTestimonial(1),
      makeTestimonial(2),
    ]);
    const second = orderTestimonials(first);
    expect(second.map((t) => t.id)).toEqual(first.map((t) => t.id));
  });
});

describe("hasMedia — optional media guard (Req 6.2)", () => {
  it("is true only for non-empty, non-whitespace strings", () => {
    expect(hasMedia("/images/testimonials/dana.jpg")).toBe(true);
  });

  it("is false for undefined, null, empty, and whitespace-only URLs", () => {
    expect(hasMedia(undefined)).toBe(false);
    expect(hasMedia(null)).toBe(false);
    expect(hasMedia("")).toBe(false);
    expect(hasMedia("   ")).toBe(false);
  });
});

describe("hasReferencePhoto", () => {
  it("rejects generic seeded portraits and accepts supplied photos", () => {
    expect(hasReferencePhoto("/images/testimonials/marcus.jpg")).toBe(false);
    expect(hasReferencePhoto("https://images.example.com/marcus.jpg")).toBe(
      true,
    );
  });
});
