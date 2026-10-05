import { SkillCategory } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { skillSchema } from "./skill";

const validInput = {
  name: "TypeScript",
  category: SkillCategory.FRONTEND,
  proficiency: 90,
  order: 0,
};

describe("skillSchema — valid input", () => {
  it("accepts a complete skill", () => {
    expect(skillSchema.safeParse(validInput).success).toBe(true);
  });

  it.each([
    SkillCategory.FRONTEND,
    SkillCategory.BACKEND,
    SkillCategory.CLOUD,
    SkillCategory.AI,
  ])("accepts category %s", (category) => {
    expect(skillSchema.safeParse({ ...validInput, category }).success).toBe(
      true,
    );
  });
});

describe("skillSchema — proficiency bounds (0–100)", () => {
  it("accepts proficiency at the lower boundary (0)", () => {
    expect(
      skillSchema.safeParse({ ...validInput, proficiency: 0 }).success,
    ).toBe(true);
  });

  it("accepts proficiency at the upper boundary (100)", () => {
    expect(
      skillSchema.safeParse({ ...validInput, proficiency: 100 }).success,
    ).toBe(true);
  });

  it("rejects proficiency below 0 (-1)", () => {
    expect(
      skillSchema.safeParse({ ...validInput, proficiency: -1 }).success,
    ).toBe(false);
  });

  it("rejects proficiency above 100 (101)", () => {
    expect(
      skillSchema.safeParse({ ...validInput, proficiency: 101 }).success,
    ).toBe(false);
  });

  it("rejects a non-integer proficiency", () => {
    expect(
      skillSchema.safeParse({ ...validInput, proficiency: 50.5 }).success,
    ).toBe(false);
  });
});

describe("skillSchema — invalid input", () => {
  it("rejects an invalid category", () => {
    expect(
      skillSchema.safeParse({ ...validInput, category: "DEVOPS" }).success,
    ).toBe(false);
  });

  it("rejects an empty name", () => {
    expect(
      skillSchema.safeParse({ ...validInput, name: "   " }).success,
    ).toBe(false);
  });
});
