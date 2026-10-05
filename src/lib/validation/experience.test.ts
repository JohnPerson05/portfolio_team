import { describe, expect, it } from "vitest";

import { experienceSchema } from "./experience";

const validInput = {
  company: "Vercel",
  position: "Senior Engineer",
  startDate: new Date("2021-01-01T00:00:00.000Z"),
  endDate: new Date("2023-01-01T00:00:00.000Z"),
  impact: "Led the edge runtime initiative.",
  achievements: ["Shipped edge functions", "Reduced cold starts 40%"],
  order: 0,
};

describe("experienceSchema — valid input", () => {
  it("accepts a complete entry", () => {
    expect(experienceSchema.safeParse(validInput).success).toBe(true);
  });

  it("accepts a current role with null endDate (present)", () => {
    expect(
      experienceSchema.safeParse({ ...validInput, endDate: null }).success,
    ).toBe(true);
  });

  it("accepts an omitted endDate (present)", () => {
    const { endDate: _endDate, ...rest } = validInput;
    expect(experienceSchema.safeParse(rest).success).toBe(true);
  });

  it("accepts endDate equal to startDate", () => {
    expect(
      experienceSchema.safeParse({
        ...validInput,
        endDate: validInput.startDate,
      }).success,
    ).toBe(true);
  });
});

describe("experienceSchema — date ordering refinement", () => {
  it("rejects an endDate before the startDate", () => {
    const result = experienceSchema.safeParse({
      ...validInput,
      startDate: new Date("2023-01-01T00:00:00.000Z"),
      endDate: new Date("2021-01-01T00:00:00.000Z"),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.endDate).toBeDefined();
    }
  });
});

describe("experienceSchema — invalid input", () => {
  it("rejects an empty company", () => {
    expect(
      experienceSchema.safeParse({ ...validInput, company: "   " }).success,
    ).toBe(false);
  });

  it("rejects an empty impact", () => {
    expect(
      experienceSchema.safeParse({ ...validInput, impact: "" }).success,
    ).toBe(false);
  });

  it("rejects an achievement with an empty entry", () => {
    expect(
      experienceSchema.safeParse({
        ...validInput,
        achievements: ["Good", ""],
      }).success,
    ).toBe(false);
  });
});
