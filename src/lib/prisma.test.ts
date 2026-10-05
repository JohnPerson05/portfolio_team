import { describe, expect, it } from "vitest";
import { PostStatus, SkillCategory, EventType } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";

import prisma, { prisma as namedPrisma } from "./prisma";

// Validates Requirement 17.3: data is accessed through a shared Prisma client
// module. These tests do not touch a live database — they only assert that the
// singleton is wired up and that the generated client exposes the schema's enums.
describe("prisma singleton", () => {
  it("exports a usable PrismaClient instance", () => {
    // Avoid `toBeInstanceOf`/deep serialization here: the generated client is a
    // recursive proxy that can overflow the stack during such checks, and its
    // constructor name is minified. Asserting the characteristic lifecycle
    // methods confirms it is a real PrismaClient.
    expect(prisma).toBeDefined();
    expect(typeof prisma.$connect).toBe("function");
    expect(typeof prisma.$disconnect).toBe("function");
    expect(typeof prisma.$transaction).toBe("function");
  });

  it("exposes the same instance via default and named exports", () => {
    expect(prisma).toBe(namedPrisma);
  });

  it("caches a single instance on globalThis outside production", async () => {
    const cached = (globalThis as unknown as { prisma?: PrismaClient }).prisma;
    expect(cached).toBe(prisma);

    // Re-importing the module must reuse the cached instance rather than
    // constructing a new client (the hot-reload guard).
    const reimported = (await import("./prisma")).default;
    expect(reimported).toBe(prisma);
  });

  it("exposes typed accessors for every model", () => {
    expect(typeof prisma.project.findMany).toBe("function");
    expect(typeof prisma.post.findMany).toBe("function");
    expect(typeof prisma.skill.findMany).toBe("function");
    expect(typeof prisma.experience.findMany).toBe("function");
    expect(typeof prisma.testimonial.findMany).toBe("function");
    expect(typeof prisma.contactSubmission.findMany).toBe("function");
    expect(typeof prisma.analyticsEvent.findMany).toBe("function");
  });
});

describe("generated enums match the design schema", () => {
  it("PostStatus", () => {
    expect(PostStatus).toMatchObject({
      DRAFT: "DRAFT",
      PUBLISHED: "PUBLISHED",
    });
  });

  it("SkillCategory", () => {
    expect(SkillCategory).toMatchObject({
      FRONTEND: "FRONTEND",
      BACKEND: "BACKEND",
      CLOUD: "CLOUD",
      AI: "AI",
    });
  });

  it("EventType", () => {
    expect(EventType).toMatchObject({
      PORTFOLIO_VIEW: "PORTFOLIO_VIEW",
      PROJECT_CLICK: "PROJECT_CLICK",
      RESUME_DOWNLOAD: "RESUME_DOWNLOAD",
      CONTACT_SUBMISSION: "CONTACT_SUBMISSION",
    });
  });
});
