// ---------------------------------------------------------------------------
// Push team profiles from `prisma/seed-data.ts` into an EXISTING database.
//
// The seed never touches rows that already exist, so use this after editing a
// member's profile in seed-data.ts:
//
//   npm run team:update -- leyahn-mallorca
//
// In PowerShell, quote the separator ('--') or PowerShell swallows it:
//   npm run team:update '--' leyahn-mallorca
//   (or run it directly: npx tsx scripts/update-team-profiles.ts leyahn-mallorca)
//
// Only the slugs you name are touched. Their profile text (name, slug, role,
// bios, key areas, skills, experience, highlights, skill groups, focus) is
// overwritten with the seed copy; photo, links, order, and published/featured
// state are left as they are. A member that doesn't exist yet is created.
//
// Uses DATABASE_URL from the environment, `.env.local`, or `.env`.
// ---------------------------------------------------------------------------

import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { PrismaClient } from "@prisma/client";

import { teamMembers } from "../prisma/seed-data";

/** Slugs a member was previously stored under, so their row is found and renamed. */
const PREVIOUS_SLUGS: Record<string, string[]> = {
  "leyahn-mallorca": ["second-team-member"],
};

function loadEnvironment(): void {
  // Earlier files win: loadEnvFile never overrides variables already set.
  for (const file of [".env.local", ".env"]) {
    const path = resolve(process.cwd(), file);
    if (existsSync(path)) process.loadEnvFile(path);
  }
}

async function main(): Promise<void> {
  loadEnvironment();
  const slugs = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
  if (slugs.length === 0) {
    const known = teamMembers.map((m) => m.slug).join(", ");
    throw new Error(`Name the member(s) to update by slug. Known: ${known}`);
  }

  const prisma = new PrismaClient();
  try {
    for (const slug of slugs) {
      const seed = teamMembers.find((m) => m.slug === slug);
      if (!seed) throw new Error(`No team member with slug "${slug}" in prisma/seed-data.ts.`);

      const profile = {
        name: seed.name,
        slug: seed.slug,
        role: seed.role,
        shortBio: seed.shortBio,
        bio: seed.bio,
        responsibilities: seed.responsibilities,
        skills: seed.skills,
        experience: seed.experience,
        highlights: seed.highlights ?? [],
        skillGroups: seed.skillGroups ?? [],
        focus: seed.focus ?? null,
      };

      const existing = await prisma.teamMember.findFirst({
        where: { slug: { in: [slug, ...(PREVIOUS_SLUGS[slug] ?? [])] } },
        orderBy: { createdAt: "asc" },
      });

      if (existing) {
        await prisma.teamMember.update({
          where: { id: existing.id },
          data: {
            ...profile,
            profileImage: existing.profileImage ?? seed.profileImage ?? null,
          },
        });
        const renamed = existing.slug !== slug ? ` (slug ${existing.slug} → ${slug})` : "";
        console.log(`✔ Updated ${seed.name}${renamed}`);
      } else {
        await prisma.teamMember.create({
          data: {
            ...profile,
            profileImage: seed.profileImage ?? null,
            isPublished: seed.isPublished,
            isFeatured: seed.isFeatured,
            displayOrder: await prisma.teamMember.count(),
          },
        });
        console.log(`✔ Created ${seed.name}`);
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(`✖ ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
});
