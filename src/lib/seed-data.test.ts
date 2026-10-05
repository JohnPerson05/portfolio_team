import { describe, expect, it } from "vitest";
import { SkillCategory } from "@prisma/client";

import {
  experiences,
  posts,
  projects,
  skills,
  testimonials,
} from "../../prisma/seed-data";

// These tests assert the invariants the seed dataset must uphold so that the
// downstream feature sections (and their own tests) have data that exercises
// every branch. They run against the exported data only — no database needed.

describe("seed projects", () => {
  it("provides between 5 and 6 projects total", () => {
    expect(projects.length).toBeGreaterThanOrEqual(5);
    expect(projects.length).toBeLessThanOrEqual(6);
  });

  it("has between 3 and 6 featured projects (Requirement 10.5 / Property 1)", () => {
    const featured = projects.filter((p) => p.featured === true);
    expect(featured.length).toBeGreaterThanOrEqual(3);
    expect(featured.length).toBeLessThanOrEqual(6);
  });

  it("includes at least one non-featured project", () => {
    const nonFeatured = projects.filter((p) => !p.featured);
    expect(nonFeatured.length).toBeGreaterThanOrEqual(1);
  });

  it("gives featured projects distinct order values", () => {
    const orders = projects
      .filter((p) => p.featured === true)
      .map((p) => p.order);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it("uses unique slugs across all projects", () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("does not publish placeholder external project links", () => {
    for (const project of projects) {
      expect(project.githubUrl).toBeNull();
      expect(project.liveUrl).toBeNull();
    }
  });

  it("populates the narrative fields for every project", () => {
    for (const p of projects) {
      expect(p.title.length).toBeGreaterThan(0);
      expect(p.summary.length).toBeGreaterThan(0);
      expect(p.problem.length).toBeGreaterThan(0);
      expect(p.solution.length).toBeGreaterThan(0);
      expect(p.impact.length).toBeGreaterThan(0);
      const technologies = p.technologies as string[] | undefined;
      expect(technologies && technologies.length).toBeGreaterThan(0);
    }
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

describe("seed testimonials", () => {
  it("does not publish invented professional endorsements", () => {
    expect(testimonials).toEqual([]);
  });
});

describe("seed posts", () => {
  it("does not publish writing that has not been supplied by the owner", () => {
    expect(posts).toEqual([]);
  });
});
