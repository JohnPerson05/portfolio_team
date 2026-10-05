import { PrismaClient } from "@prisma/client";
import {
  experiences,
  posts,
  projects,
  skills,
  testimonials,
} from "../prisma/seed-data";

const prisma = new PrismaClient();

async function syncProfileContent(): Promise<void> {
  await prisma.$transaction([
    prisma.skill.deleteMany(),
    prisma.experience.deleteMany(),
    prisma.project.deleteMany(),
    prisma.testimonial.deleteMany(),
    prisma.post.deleteMany(),
  ]);

  const [skillResult, experienceResult, projectResult] =
    await prisma.$transaction([
      prisma.skill.createMany({ data: skills }),
      prisma.experience.createMany({ data: experiences }),
      prisma.project.createMany({ data: projects }),
    ]);

  if (testimonials.length > 0) {
    await prisma.testimonial.createMany({ data: testimonials });
  }
  if (posts.length > 0) {
    await prisma.post.createMany({ data: posts });
  }

  console.log(
    `Public content synced: ${skillResult.count} skills, ${experienceResult.count} experience entries, ${projectResult.count} projects.`,
  );
}

syncProfileContent()
  .catch((error) => {
    console.error("Profile content sync failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
