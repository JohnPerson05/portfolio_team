// ---------------------------------------------------------------------------
// Database seed runner — NON-DESTRUCTIVE.
//
// Safe to run against any database, including production:
//  - Content (projects, technologies, team, services, process, navigation,
//    skills, experience) is only seeded into EMPTY tables, so content you
//    deleted in the CMS never comes back.
//  - Settings and homepage sections are created per missing key (so newly
//    added settings get their defaults); existing values are never changed.
//
// Admin account: if no AdminUser exists, one SUPER_ADMIN is created from
//   ADMIN_EMAIL + ADMIN_PASSWORD_HASH   (existing deployments), or
//   ADMIN_EMAIL + ADMIN_SEED_PASSWORD   (plaintext, hashed here).
//
//   npx prisma migrate deploy && npm run db:seed
// ---------------------------------------------------------------------------

import { PrismaClient } from "@prisma/client";

import { hashPassword } from "../src/lib/password";
import { SETTING_DEFINITIONS } from "../src/server/settings/registry";
import {
  HOMEPAGE_SECTION_DEFAULTS,
  NAVIGATION_DEFAULTS,
} from "../src/server/content/defaults";
import {
  experiences,
  processSteps,
  projects,
  services,
  skills,
  teamMembers,
  technologyCategories,
} from "./seed-data";

const prisma = new PrismaClient();

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const created: Record<string, number> = {};
const bump = (key: string, n = 1) => (created[key] = (created[key] ?? 0) + n);

async function seedAdmin(): Promise<void> {
  if ((await prisma.adminUser.count()) > 0) return;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) {
    console.log("  ! No admin created — set ADMIN_EMAIL and ADMIN_SEED_PASSWORD (or ADMIN_PASSWORD_HASH).");
    return;
  }
  let passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!passwordHash?.startsWith("scrypt$")) {
    const plain = process.env.ADMIN_SEED_PASSWORD ?? "";
    if (plain.length < 12) {
      console.log("  ! No admin created — ADMIN_SEED_PASSWORD must be at least 12 characters.");
      return;
    }
    passwordHash = await hashPassword(plain);
  }
  await prisma.adminUser.create({
    data: { email, passwordHash, name: email.split("@")[0] ?? "Owner", role: "SUPER_ADMIN" },
  });
  bump("admin users");
}

async function seedTechnologies(): Promise<Map<string, string>> {
  if ((await prisma.project.count()) > 0) return new Map();
  const names = [...new Set(projects.flatMap((p) => p.technologies))];
  const ids = new Map<string, string>();
  let order = await prisma.technology.count();
  for (const name of names) {
    const slug = slugify(name);
    const existing = await prisma.technology.findFirst({
      where: { OR: [{ slug }, { name }] },
    });
    if (existing) {
      ids.set(name, existing.id);
      continue;
    }
    const row = await prisma.technology.create({
      data: { name, slug, category: technologyCategories[name] ?? null, displayOrder: order++ },
    });
    ids.set(name, row.id);
    bump("technologies");
  }
  return ids;
}

async function seedProjects(techIds: Map<string, string>): Promise<void> {
  if ((await prisma.project.count()) > 0) return;
  for (const [index, p] of projects.entries()) {
    if (await prisma.project.findUnique({ where: { slug: p.slug } })) continue;
    const { images, technologies, ...fields } = p;
    await prisma.project.create({
      data: {
        ...fields,
        displayOrder: index,
        coverImage: images[0] ?? null,
        publishedAt: p.status === "PUBLISHED" ? new Date() : null,
        media: {
          create: images.map((url, i) => ({
            url,
            altText: `${p.title} — screenshot ${i + 1}`,
            displayOrder: i,
          })),
        },
        technologies: {
          create: technologies
            .map((name) => techIds.get(name))
            .filter((id): id is string => !!id)
            .map((technologyId) => ({ technologyId })),
        },
      },
    });
    bump("projects");
  }
}

async function seedTeam(): Promise<void> {
  if ((await prisma.teamMember.count()) > 0) return;
  for (const [index, member] of teamMembers.entries()) {
    if (await prisma.teamMember.findUnique({ where: { slug: member.slug } })) continue;
    await prisma.teamMember.create({ data: { ...member, displayOrder: index } });
    bump("team members");
  }
}

async function seedServices(): Promise<void> {
  if ((await prisma.service.count()) > 0) return;
  for (const [index, service] of services.entries()) {
    if (await prisma.service.findUnique({ where: { slug: service.slug } })) continue;
    await prisma.service.create({ data: { ...service, displayOrder: index } });
    bump("services");
  }
}

async function seedProcess(): Promise<void> {
  if ((await prisma.processStep.count()) > 0) return;
  await prisma.processStep.createMany({
    data: processSteps.map((step, index) => ({
      ...step,
      stepNumber: index + 1,
      displayOrder: index,
      isPublished: true,
    })),
  });
  bump("process steps", processSteps.length);
}

async function seedSiteStructure(): Promise<void> {
  for (const def of SETTING_DEFINITIONS) {
    if (await prisma.siteSetting.findUnique({ where: { key: def.key } })) continue;
    await prisma.siteSetting.create({
      data: { key: def.key, type: def.type, value: def.defaultValue as never },
    });
    bump("settings");
  }

  const sectionCount = await prisma.homepageSection.count();
  for (const [index, section] of HOMEPAGE_SECTION_DEFAULTS.entries()) {
    if (await prisma.homepageSection.findUnique({ where: { key: section.key } })) continue;
    await prisma.homepageSection.create({
      data: { ...section, displayOrder: sectionCount + index, isEnabled: true },
    });
    bump("homepage sections");
  }

  if ((await prisma.navigationItem.count()) === 0) {
    await prisma.navigationItem.createMany({
      data: NAVIGATION_DEFAULTS.map((item, index) => ({ ...item, displayOrder: index })),
    });
    bump("navigation items", NAVIGATION_DEFAULTS.length);
  }
}

async function seedBackground(): Promise<void> {
  if ((await prisma.skill.count()) === 0) {
    const { count } = await prisma.skill.createMany({ data: skills });
    bump("skills", count);
  }
  if ((await prisma.experience.count()) === 0) {
    const { count } = await prisma.experience.createMany({ data: experiences });
    bump("experience entries", count);
  }
}

async function main(): Promise<void> {
  console.log("🌱 Seeding missing content (existing rows are never changed)…");
  await seedAdmin();
  const techIds = await seedTechnologies();
  await seedProjects(techIds);
  await seedTeam();
  await seedServices();
  await seedProcess();
  await seedSiteStructure();
  await seedBackground();

  const entries = Object.entries(created);
  if (entries.length === 0) console.log("  Nothing to add — database already has all seed content.");
  for (const [label, n] of entries) console.log(`  + ${n} ${label}`);
  console.log("✅ Seed complete.");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
