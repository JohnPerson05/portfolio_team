import { describe, expect, it } from "vitest";
import { SkillCategory } from "@prisma/client";

import {
  experiences,
  processSteps,
  projects,
  services,
  skills,
  teamMembers,
} from "../../prisma/seed-data";
import { SETTING_DEFINITIONS } from "../server/settings/registry";
import { HOMEPAGE_SECTION_DEFAULTS, NAVIGATION_DEFAULTS } from "../server/content/defaults";

// Invariants for the fresh-database seed. They run against the exported data
// only — no database needed.

describe("seed projects", () => {
  it("contains the live portfolio's projects with unique slugs", () => {
    expect(projects.length).toBeGreaterThanOrEqual(3);
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs).toEqual(
      expect.arrayContaining([
        "petcury-veterinary-clinic-management-system",
        "barangay-rosario-digital-portal",
        "globalmeet-live-webcasting-audience-engagement",
      ]),
    );
  });

  it("never seeds template placeholder links", () => {
    for (const project of projects) {
      expect(project.githubUrl ?? "").not.toMatch(/github\.com\/example\//);
      expect(project.projectUrl ?? "").not.toMatch(/example\.com/);
    }
  });

  it("gives every published project the full story (publishable)", () => {
    for (const p of projects.filter((x) => x.status === "PUBLISHED")) {
      expect(p.shortDescription.trim()).not.toBe("");
      expect(p.problem.trim()).not.toBe("");
      expect(p.solution.trim()).not.toBe("");
      expect(p.result.trim()).not.toBe("");
      expect(p.technologies.length).toBeGreaterThan(0);
    }
  });

  it("uses https images only", () => {
    for (const p of projects) for (const url of p.images) expect(url).toMatch(/^https:\/\//);
  });
});

describe("seed team", () => {
  it("leaves any member still marked [EDIT ME] unpublished", () => {
    for (const member of teamMembers) {
      if (member.name.includes("[EDIT ME]")) expect(member.isPublished).toBe(false);
    }
    expect(teamMembers.some((m) => m.isPublished)).toBe(true);
  });
});

describe("seed services & process", () => {
  it("has unique service slugs and contiguous process steps", () => {
    const slugs = services.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(processSteps.length).toBeGreaterThan(0);
    for (const step of processSteps) expect(step.description.trim()).not.toBe("");
  });
});

describe("site structure defaults", () => {
  it("defines every setting once with a group and label", () => {
    const keys = SETTING_DEFINITIONS.map((d) => d.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const def of SETTING_DEFINITIONS) {
      expect(def.label).not.toBe("");
      expect(def.group).not.toBe("");
    }
  });

  it("has unique homepage section keys and valid nav links", () => {
    const keys = HOMEPAGE_SECTION_DEFAULTS.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const item of NAVIGATION_DEFAULTS) expect(item.href.startsWith("/")).toBe(true);
  });
});

describe("seed skills", () => {
  it("covers all four skill categories (Requirement 4.1)", () => {
    const categories = new Set(skills.map((s) => s.category));
    expect(categories).toEqual(
      new Set([
        SkillCategory.FRONTEND,
        SkillCategory.BACKEND,
        SkillCategory.CLOUD,
        SkillCategory.AI,
      ]),
    );
  });

  it("keeps every proficiency within 0–100", () => {
    for (const s of skills) {
      expect(s.proficiency).toBeGreaterThanOrEqual(0);
      expect(s.proficiency).toBeLessThanOrEqual(100);
    }
  });

  it("includes the headline technologies named in the requirements", () => {
    const names = new Set(skills.map((s) => s.name));
    for (const expected of [
      "Java",
      "Spring Boot",
      "Microservices Architecture",
      "REST APIs",
      "JUnit Testing",
      "Azure DevOps CI/CD",
      "OpenShift",
      "Datadog",
      "Grafana",
      "React.js",
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Reusable UI Components",
      "MVP Prototyping",
      "Vercel",
      "Codex",
      "Claude",
      "Lovable",
      "v0 by Vercel",
      "Agile Scrum",
      "Jira",
      "Confluence",
      "Postman API",
    ]) {
      expect(names.has(expected)).toBe(true);
    }
  });
});

describe("seed experience", () => {
  it("provides 3–4 entries", () => {
    expect(experiences.length).toBeGreaterThanOrEqual(3);
    expect(experiences.length).toBeLessThanOrEqual(4);
  });

  it("has exactly one current role (null endDate)", () => {
    const current = experiences.filter((e) => e.endDate === null);
    expect(current.length).toBe(1);
  });

  it("matches John Person Narral's verified career history", () => {
    expect(
      experiences.map(({ company, position }) => ({ company, position })),
    ).toEqual([
      { company: "ING", position: "Backend Engineer" },
      { company: "GlobalMeet", position: "Full Stack Developer" },
      { company: "IBM Corp.", position: "Application Developer" },
      {
        company: "Accenture Inc.",
        position: "Software Engineer Analyst",
      },
    ]);
  });

  it("lists achievements for every entry", () => {
    for (const e of experiences) {
      const achievements = e.achievements as string[] | undefined;
      expect(achievements && achievements.length).toBeGreaterThan(0);
    }
  });
});

