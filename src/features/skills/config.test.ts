import { SkillCategory } from "@prisma/client";
import { describe, expect, it } from "vitest";
import type { SkillView } from "@/types";
import {
  MAX_PROFICIENCY,
  MIN_PROFICIENCY,
  SKILL_CATEGORY_LABELS,
  SKILL_CATEGORY_ORDER,
  clampProficiency,
  groupSkills,
} from "./config";

/** Build a SkillView with overridable fields. */
function makeSkill(overrides: Partial<SkillView> = {}): SkillView {
  return {
    id: overrides.id ?? `skill-${overrides.name ?? "x"}`,
    name: overrides.name ?? "Skill",
    category: overrides.category ?? SkillCategory.FRONTEND,
    proficiency: overrides.proficiency ?? 80,
    order: overrides.order ?? 0,
  };
}

describe("groupSkills (Req 4.1)", () => {
  it("always returns the four categories in canonical order", () => {
    const groups = groupSkills([]);
    expect(groups.map((g) => g.category)).toEqual([
      SkillCategory.BACKEND,
      SkillCategory.CLOUD,
      SkillCategory.FRONTEND,
      SkillCategory.AI,
    ]);
    expect(groups.map((g) => g.label)).toEqual([
      "Backend Engineering",
      "Cloud & DevOps",
      "Frontend Development",
      "AI-Assisted Development & Delivery",
    ]);
  });

  it("assigns each skill to the matching category group", () => {
    const groups = groupSkills([
      makeSkill({ id: "fe", category: SkillCategory.FRONTEND }),
      makeSkill({ id: "be", category: SkillCategory.BACKEND }),
      makeSkill({ id: "cl", category: SkillCategory.CLOUD }),
      makeSkill({ id: "ai", category: SkillCategory.AI }),
    ]);
    const byCategory = Object.fromEntries(
      groups.map((g) => [g.category, g.skills.map((s) => s.id)]),
    );
    expect(byCategory[SkillCategory.FRONTEND]).toEqual(["fe"]);
    expect(byCategory[SkillCategory.BACKEND]).toEqual(["be"]);
    expect(byCategory[SkillCategory.CLOUD]).toEqual(["cl"]);
    expect(byCategory[SkillCategory.AI]).toEqual(["ai"]);
  });

  it("orders skills within a group by `order` ascending", () => {
    const groups = groupSkills([
      makeSkill({ id: "c", category: SkillCategory.FRONTEND, order: 3 }),
      makeSkill({ id: "a", category: SkillCategory.FRONTEND, order: 1 }),
      makeSkill({ id: "b", category: SkillCategory.FRONTEND, order: 2 }),
    ]);
    const frontend = groups.find((g) => g.category === SkillCategory.FRONTEND);
    expect(frontend?.skills.map((s) => s.id)).toEqual(["a", "b", "c"]);
  });

  it("yields an empty skills array for a category with no skills", () => {
    const groups = groupSkills([
      makeSkill({ category: SkillCategory.FRONTEND }),
    ]);
    const ai = groups.find((g) => g.category === SkillCategory.AI);
    expect(ai?.skills).toEqual([]);
  });

  it("has a label for every category in the display order", () => {
    for (const category of SKILL_CATEGORY_ORDER) {
      expect(SKILL_CATEGORY_LABELS[category]).toBeTruthy();
    }
  });
});

describe("clampProficiency (0–100)", () => {
  it("passes through in-range values", () => {
    expect(clampProficiency(0)).toBe(0);
    expect(clampProficiency(50)).toBe(50);
    expect(clampProficiency(100)).toBe(100);
  });

  it("clamps out-of-range values to the 0–100 bounds", () => {
    expect(clampProficiency(-20)).toBe(MIN_PROFICIENCY);
    expect(clampProficiency(140)).toBe(MAX_PROFICIENCY);
  });

  it("falls back to the minimum for non-finite values", () => {
    expect(clampProficiency(Number.NaN)).toBe(MIN_PROFICIENCY);
    expect(clampProficiency(Number.POSITIVE_INFINITY)).toBe(MIN_PROFICIENCY);
  });
});
