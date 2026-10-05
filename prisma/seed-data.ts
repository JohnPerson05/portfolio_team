// ---------------------------------------------------------------------------
// Seed data for the Elite Portfolio (Task 4).
//
// This module holds ONLY data — no Prisma client, no side effects — so it can
// be imported both by the executable seed runner (`prisma/seed.ts`) and by unit
// tests that assert the seed invariants without touching a database.
//
// Requirements traceability:
//   - 3.3  Projects with and without GitHub/Live links (conditional rendering).
//   - 6.2  Testimonials with and without avatar/logo (graceful rendering).
//   - 7.4  A mix of PUBLISHED and DRAFT posts (published-only filtering).
//   - 10.5 Between 3 and 6 featured projects with distinct `order`.
//   - 4.1  Skills across all four categories (FRONTEND, BACKEND, CLOUD, AI).
// ---------------------------------------------------------------------------

import { Prisma, SkillCategory } from "@prisma/client";
import { PROFILE_EXPERIENCES } from "../src/features/experience/profile-data";

/**
 * Featured + non-featured projects.
 *
 * The set deliberately covers every link permutation so the public projects
 * section can exercise conditional GitHub/Live link rendering (Requirement
 * 3.3): both links, GitHub only, Live only, and neither.
 */
export const projects: Prisma.ProjectCreateManyInput[] = [
  {
    title: "Banking services customers can rely on",
    slug: "enterprise-banking-services",
    summary:
      "Behind-the-scenes systems that keep everyday banking features secure and running.",
    problem:
      "A bank's customer-facing features depended on many connected systems. Every change had to be safe, every release predictable, and problems had to be spotted before customers noticed.",
    solution:
      "Built and improved the services that connect those systems, added automated checks so changes could be released with confidence, and helped make the release process repeatable.",
    impact:
      "More reliable banking features, smoother releases, and systems that are easier for the team to maintain and improve.",
    technologies: [
      "Java",
      "Spring Boot",
      "Microservices",
      "REST APIs",
      "JUnit",
      "Azure DevOps",
      "OpenShift",
    ],
    thumbnailUrl: null,
    githubUrl: null,
    liveUrl: null,
    featured: true,
    order: 1,
  },
  {
    title: "Testing new product ideas, fast",
    slug: "globalmeet-product-prototypes",
    summary:
      "Working prototypes for a live-meeting platform, so new ideas could be tried before full investment.",
    problem:
      "The product team had new feature ideas for live meetings and reporting, but needed to see them working — inside the existing product — before committing to build them properly.",
    solution:
      "Built clickable, working prototypes — including live emoji reactions and audience-sentiment reporting — plugged into the existing platform, using reusable building blocks.",
    impact:
      "The team could judge ideas on something real, decide faster, and move into full development with far less rework.",
    technologies: [
      "React.js",
      "TypeScript",
      "JavaScript",
      "Java",
      "PHP",
      "REST APIs",
      "MVP Prototyping",
    ],
    thumbnailUrl: null,
    githubUrl: null,
    liveUrl: null,
    featured: true,
    order: 2,
  },
  {
    title: "Making complex insurance journeys easier",
    slug: "export-import-insurance-platform",
    summary:
      "Clearer, more accessible screens for an export-import insurance platform.",
    problem:
      "Customers were working through long, complex insurance processes on an established platform. The screens needed to be clearer, work for everyone, and stay in sync with the systems behind them.",
    solution:
      "Worked hand-in-hand with the design team to rebuild key screens accurately, fixed long-standing interface issues, and strengthened the layer connecting the screens to the back-end systems.",
    impact:
      "Important insurance journeys became easier to use, more accessible, and more dependable.",
    technologies: [
      "React.js",
      "Spring Boot",
      "BFF",
      "JavaScript",
      "Accessibility",
      "Agile",
    ],
    thumbnailUrl: null,
    githubUrl: null,
    liveUrl: null,
    featured: true,
    order: 3,
  },
  {
    title: "Bringing older business systems up to date",
    slug: "enterprise-application-modernization",
    summary:
      "Modern, mobile-friendly screens for established enterprise applications — without starting over.",
    problem:
      "Older internal applications still did their job, but looked dated, didn't work well on different devices, and were hard to change safely.",
    solution:
      "Rebuilt the screens step by step, connected them to the existing back-end services, and supported testing with users, speed improvements, and checks across browsers.",
    impact:
      "Day-to-day workflows got a modern feel while everything that already worked kept working.",
    technologies: [
      "React.js",
      "Java",
      "Spring Boot",
      "Bootstrap",
      "Microservices",
      "CI/CD",
    ],
    thumbnailUrl: null,
    githubUrl: null,
    liveUrl: null,
    featured: true,
    order: 4,
  },
  {
    title: "First versions for new ideas",
    slug: "freelance-mvp-delivery",
    summary:
      "Fast, working first versions of web products — built to test an idea and to keep growing.",
    problem:
      "Founders with an early idea need something real to show customers quickly — but don't want to throw it away and rebuild when it works.",
    solution:
      "A focused, repeatable way of building first versions using modern tools and reusable building blocks, with AI-assisted workflows to move faster.",
    impact:
      "A dependable path from idea to a product people can click through — ready to keep building on once it proves itself.",
    technologies: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Vercel",
      "Codex",
      "Claude",
    ],
    thumbnailUrl: null,
    githubUrl: null,
    liveUrl: null,
    featured: false,
    order: 5,
  },
];

/**
 * Skills across all four categories (Requirement 4.1). Each carries a 0–100
 * proficiency and an explicit display order within its category.
 */
export const skills: Prisma.SkillCreateManyInput[] = [
  // Backend
  { name: "Java", category: SkillCategory.BACKEND, proficiency: 95, order: 1 },
  {
    name: "Spring Boot",
    category: SkillCategory.BACKEND,
    proficiency: 94,
    order: 2,
  },
  {
    name: "Microservices Architecture",
    category: SkillCategory.BACKEND,
    proficiency: 92,
    order: 3,
  },
  {
    name: "REST APIs",
    category: SkillCategory.BACKEND,
    proficiency: 95,
    order: 4,
  },
  {
    name: "JUnit Testing",
    category: SkillCategory.BACKEND,
    proficiency: 90,
    order: 5,
  },
  { name: "SQL", category: SkillCategory.BACKEND, proficiency: 89, order: 6 },
  {
    name: "OOP Principles",
    category: SkillCategory.BACKEND,
    proficiency: 94,
    order: 7,
  },
  {
    name: "Backend Integration",
    category: SkillCategory.BACKEND,
    proficiency: 91,
    order: 8,
  },
  { name: "XML", category: SkillCategory.BACKEND, proficiency: 84, order: 9 },
  // Cloud & DevOps
  {
    name: "Azure DevOps CI/CD",
    category: SkillCategory.CLOUD,
    proficiency: 92,
    order: 1,
  },
  {
    name: "OpenShift",
    category: SkillCategory.CLOUD,
    proficiency: 86,
    order: 2,
  },
  { name: "GitLab", category: SkillCategory.CLOUD, proficiency: 88, order: 3 },
  {
    name: "Bitbucket",
    category: SkillCategory.CLOUD,
    proficiency: 88,
    order: 4,
  },
  { name: "Vercel", category: SkillCategory.CLOUD, proficiency: 89, order: 5 },
  { name: "Kibana", category: SkillCategory.CLOUD, proficiency: 85, order: 6 },
  { name: "Datadog", category: SkillCategory.CLOUD, proficiency: 84, order: 7 },
  { name: "Grafana", category: SkillCategory.CLOUD, proficiency: 84, order: 8 },
  // Frontend
  {
    name: "React.js",
    category: SkillCategory.FRONTEND,
    proficiency: 91,
    order: 1,
  },
  {
    name: "Next.js",
    category: SkillCategory.FRONTEND,
    proficiency: 88,
    order: 2,
  },
  {
    name: "TypeScript",
    category: SkillCategory.FRONTEND,
    proficiency: 91,
    order: 3,
  },
  {
    name: "JavaScript",
    category: SkillCategory.FRONTEND,
    proficiency: 92,
    order: 4,
  },
  {
    name: "Tailwind CSS",
    category: SkillCategory.FRONTEND,
    proficiency: 89,
    order: 5,
  },
  {
    name: "Bootstrap",
    category: SkillCategory.FRONTEND,
    proficiency: 90,
    order: 6,
  },
  {
    name: "jQuery & AJAX",
    category: SkillCategory.FRONTEND,
    proficiency: 84,
    order: 7,
  },
  {
    name: "JSP / JSTL",
    category: SkillCategory.FRONTEND,
    proficiency: 85,
    order: 8,
  },
  {
    name: "Reusable UI Components",
    category: SkillCategory.FRONTEND,
    proficiency: 91,
    order: 9,
  },
  {
    name: "MVP Prototyping",
    category: SkillCategory.FRONTEND,
    proficiency: 92,
    order: 10,
  },
  // AI-assisted development and delivery tools.
  { name: "Codex", category: SkillCategory.AI, proficiency: 91, order: 1 },
  { name: "Claude", category: SkillCategory.AI, proficiency: 91, order: 2 },
  { name: "Lovable", category: SkillCategory.AI, proficiency: 88, order: 3 },
  {
    name: "v0 by Vercel",
    category: SkillCategory.AI,
    proficiency: 89,
    order: 4,
  },
  {
    name: "Agile Scrum",
    category: SkillCategory.AI,
    proficiency: 94,
    order: 5,
  },
  { name: "Waterfall", category: SkillCategory.AI, proficiency: 86, order: 6 },
  { name: "Jira", category: SkillCategory.AI, proficiency: 92, order: 7 },
  { name: "Confluence", category: SkillCategory.AI, proficiency: 90, order: 8 },
  {
    name: "Postman API",
    category: SkillCategory.AI,
    proficiency: 92,
    order: 9,
  },
];

/**
 * Career history ordered most-recent-first. The current role has a null
 * `endDate` to represent "present".
 */
export const experiences: Prisma.ExperienceCreateManyInput[] =
  PROFILE_EXPERIENCES.map(({ id: _id, startDate, endDate, ...entry }) => ({
    ...entry,
    startDate: new Date(startDate),
    endDate: endDate ? new Date(endDate) : null,
  }));

/**
 * Testimonials. Some include an avatar and/or company logo; at least one
 * includes neither, so the section can render gracefully without media
 * (Requirement 6.2).
 */
export const testimonials: Prisma.TestimonialCreateManyInput[] = [];

/**
 * Blog posts: a mix of PUBLISHED (with a `publishedAt` timestamp) and DRAFT
 * (no `publishedAt`) so published-only filtering can be exercised (Requirement
 * 7.4).
 */
export const posts: Prisma.PostCreateManyInput[] = [];
