// ---------------------------------------------------------------------------
// Database seed runner (Task 4).
//
// Populates the Neon PostgreSQL database with premium, realistic sample content
// for local development and demos. The runner is idempotent: it clears the
// content tables it owns and re-inserts the canonical dataset, so it can be run
// repeatedly with `npx prisma db seed` without producing duplicates.
//
// The actual data lives in `./seed-data` (no side effects) so it can be unit
// tested independently of a live database.
//
// NOTE: This requires a reachable `DATABASE_URL` (Neon). In environments without
// a database connection the script will fail to connect — that is expected; run
// it once the database is provisioned.
// ---------------------------------------------------------------------------

import { PrismaClient } from "@prisma/client";

import {
  experiences,
  posts,
  projects,
  skills,
  testimonials,
} from "./seed-data";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log("🌱 Seeding database…");

  // Idempotency: clear the content tables this seed owns before re-inserting.
  // AnalyticsEvent references Project, so delete it first to satisfy the FK.
  await prisma.analyticsEvent.deleteMany();
  await prisma.project.deleteMany();
  await prisma.post.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.contactSubmission.deleteMany();

  const [
    projectResult,
    skillResult,
    experienceResult,
    testimonialResult,
    postResult,
  ] = await prisma.$transaction([
    prisma.project.createMany({ data: projects }),
    prisma.skill.createMany({ data: skills }),
    prisma.experience.createMany({ data: experiences }),
    prisma.testimonial.createMany({ data: testimonials }),
    prisma.post.createMany({ data: posts }),
  ]);

  console.log(`  • Projects:     ${projectResult.count}`);
  console.log(`  • Skills:       ${skillResult.count}`);
  console.log(`  • Experience:   ${experienceResult.count}`);
  console.log(`  • Testimonials: ${testimonialResult.count}`);
  console.log(`  • Posts:        ${postResult.count}`);
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
