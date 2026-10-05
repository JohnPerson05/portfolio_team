// ---------------------------------------------------------------------------
// Seed data — the studio's real content, used to populate a FRESH database.
//
// Plain data, no side effects (imported by `prisma/seed.ts` and by tests).
//
// Sources:
//  - Projects: transcribed from the live portfolio (john-person.vercel.app) on
//    2026-10-05. Production keeps its own exact copy — the migration converts
//    those rows in place; this file is only for new databases.
//  - Team / services / process: the copy previously hardcoded in
//    `src/features/studio/config.ts`.
//
// Rules: nothing invented. Unknown facts (year, client) are left empty, and
// anything that still needs real details is marked "[EDIT ME]" and left
// unpublished. Template placeholder GitHub links are intentionally omitted.
// ---------------------------------------------------------------------------

import { SkillCategory, type Prisma } from "@prisma/client";
import { PROFILE_EXPERIENCES } from "../src/features/experience/profile-data";

export interface SeedProject {
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  problem: string;
  solution: string;
  result: string;
  projectUrl?: string;
  githubUrl?: string;
  status: "PUBLISHED" | "DRAFT";
  featured: boolean;
  images: string[];
  technologies: string[];
}

const BLOB = "https://4ibsdd9mxtanshdm.public.blob.vercel-storage.com/projects";

/** Live portfolio projects, in their current public order. */
export const projects: SeedProject[] = [
  {
    title: "Donbbang — Interactive Web Prototype",
    slug: "donbbang-interactive-web-prototype",
    category: "Product prototype",
    shortDescription:
      "A high-fidelity web prototype created to visualize the concept, user experience, and interface direction for a modern digital product.",
    problem:
      "Early-stage product ideas are often difficult to evaluate without a tangible interface. Static wireframes can communicate structure but do not fully demonstrate navigation, interactions, visual hierarchy, or the intended user experience.",
    solution:
      "An interactive prototype that translates the product concept into a working web experience — modern UI composition, responsive layouts, interactive navigation, visual storytelling, and realistic user flows.",
    result:
      "Provided a realistic representation of the proposed product experience, making it easier to communicate the concept, evaluate UI/UX decisions, and identify improvements before investing in a full production implementation.",
    projectUrl: "https://prototype-donbbang.vercel.app/",
    status: "PUBLISHED",
    featured: true,
    images: [
      `${BLOB}/donbbang-interactive-web-prototype/1787050806774-0-ChatGPT-Image-Aug-18-2026-06_59_50-PM-CSLquWQVNBiUFmxeQ4H4VR8Cw3qxyM.png`,
      `${BLOB}/donbbang-interactive-web-prototype/1787050813467-0-ChatGPT-Image-Aug-18-2026-06_59_51-PM-MCqBabp6NiMOYa8Te6b9vmbacZhmJL.png`,
      `${BLOB}/donbbang-interactive-web-prototype/1787050820087-0-ChatGPT-Image-Aug-18-2026-06_59_53-PM-oSMQhIhAgEKnam7M04cZTidoWxL08x.png`,
      `${BLOB}/donbbang-interactive-web-prototype/1787050826185-0-ChatGPT-Image-Aug-18-2026-06_59_56-PM-iQQlkmrg3kzroNVyesC9EfWTUX3lec.png`,
      `${BLOB}/donbbang-interactive-web-prototype/1787050934505-0-ChatGPT-Image-Aug-18-2026-07_02_08-PM-8ZcecaXfqngrFVQgh4YAgkkw5NqjMK.png`,
    ],
    technologies: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Vercel",
      "Responsive Web Design",
      "Interactive Prototyping",
      "UI/UX Design",
    ],
  },
  {
    title: "PetCury — Veterinary Clinic Management System",
    slug: "petcury-veterinary-clinic-management-system",
    category: "Business system",
    shortDescription:
      "A modern multi-branch veterinary clinic management platform that centralizes pet care, appointments, digital medical records, services, inventory, and day-to-day clinic operations in one system.",
    problem:
      "Veterinary clinics juggle disconnected processes for scheduling, records, inventory, and branch operations, making it hard for staff to get the patient information they need when they need it.",
    solution:
      "A centralized digital platform with online booking, digital pet and medical records, service management, branch administration, and streamlined day-to-day workflows.",
    result:
      "Improves clinic efficiency by reducing manual processes and centralizing operational data. Pet owners get a faster booking experience and easier access to their pets' care information, while clinic staff gain better visibility across appointments, patient records, inventory, transactions, and branch operations.",
    projectUrl: "https://petcury.vercel.app/",
    status: "PUBLISHED",
    featured: true,
    images: [
      `${BLOB}/petcury-veterinary-clinic-management-system/1787047228194-0-ChatGPT-Image-Aug-18-2026-06_00_14-PM-45DmT97PcnlwN1p1GyYYCNf9mdjC5E.png`,
    ],
    technologies: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Node.js",
      "PostgreSQL",
      "Neon",
      "Vercel",
      "REST APIs",
    ],
  },
  {
    title: "Owshie Tattoo x Celeste Nail — Creative Beauty Studio",
    slug: "owshie-tattoo-celeste-nail",
    category: "Web experience",
    shortDescription:
      "A premium creative studio website combining custom tattoo artistry and refined nail design, featuring curated portfolios, artist profiles, studio services, booking, and an elegant visual experience for clients.",
    problem:
      "Independent artists often rely on social media or scattered booking channels, which makes it hard for customers to explore styles and book an appointment with confidence.",
    solution:
      "One unified experience that showcases featured work, introduces the artists, explains the process, builds credibility, and gives tattoo and nail clients a direct path to booking.",
    result:
      "Creates a stronger online presence while turning portfolio visitors into potential bookings. The experience makes it easier for clients to discover the studio's artistic style, understand the service process, build trust through social proof, and move directly from inspiration to appointment.",
    projectUrl: "https://tattoo-xnails.vercel.app/",
    status: "PUBLISHED",
    featured: true,
    images: [
      `${BLOB}/owshie-tattoo-celeste-nail/1787047754318-0-ChatGPT-Image-Aug-18-2026-06_09_01-PM-NJ9EgvWsS8IC5vnhqU7GJEc3c1Cn3I.png`,
    ],
    technologies: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Vercel",
      "Responsive Web Design",
      "Modern UI/UX",
      "Animation",
    ],
  },
  {
    title: "Ace Motorshop — POS & Inventory",
    slug: "ace-motorshop-pos-inventory",
    category: "Business system",
    shortDescription:
      "A web app for a motorcycle parts retailer covering point of sale, inventory, purchasing, customers, and reporting, with three scoped roles: Admin, Cashier, and Inventory Staff.",
    problem:
      "The business ran on paper: slow manual checkout, stock levels nobody trusted, overselling, reactive reordering, margins that couldn't be measured, no accountability, no backups, and no way to track which parts fit which motorcycles.",
    solution:
      "A transactional system with validated checkout and automatic VAT/discount calculation, an append-only inventory ledger with row-level locking, low-stock alerts, a Draft → Ordered → Received purchase-order flow with partial deliveries, motorcycle-aware product records, 13 exportable reports (PDF/CSV), role-based access, audit logging, and automated backups.",
    result:
      "Faster, consistent checkout; overselling prevented by design; traceable stock discrepancies; proactive reordering; accurate historical profit figures; and protected business records.",
    githubUrl: "https://github.com/leyahn/Ace-Motorshop-POS-Inventory",
    status: "PUBLISHED",
    featured: true,
    images: [
      `${BLOB}/ace-motorshop-pos-inventory/1787051705870-0-Ace-POS-Inv-y1xamyTQEspJIrmmk6AKLO0vfpRCsb.png`,
    ],
    technologies: [
      "PHP 8.1+",
      "Laravel 10",
      "MySQL 8/MariaDB",
      "Bootstrap 5.3",
      "jQuery with AJAX",
    ],
  },
  {
    title: "Barangay Rosario Digital Portal",
    slug: "barangay-rosario-digital-portal",
    category: "Web experience",
    shortDescription:
      "A modern digital barangay portal designed to make local government services, announcements, community information, and resident transactions more accessible through a centralized online platform.",
    problem:
      "Residents had to visit in person or rely on scattered channels to see announcements, request documents, and stay informed — creating delays and manual work for everyone.",
    solution:
      "A central portal where residents find announcements, community programs, available services, and barangay information, with a structured admin side for staff to manage content and communications.",
    result:
      "Improves accessibility to barangay information and reduces reliance on manual, in-person processes. The platform provides a more transparent and convenient digital experience for residents while giving barangay staff a foundation for modernizing community services and communications.",
    projectUrl: "https://barangay-six.vercel.app/",
    status: "PUBLISHED",
    featured: true,
    images: [
      `${BLOB}/barangay-rosario-digital-portal/1787048664037-0-ChatGPT-Image-Aug-18-2026-06_23_58-PM-84TORFDuLrjOoJmZrebe2L8SAn82pE.png`,
    ],
    technologies: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Vercel",
      "Responsive Web Design",
      "Modern UI/UX",
    ],
  },
  {
    title: "GlobalMeet — Live Webcasting & Audience Engagement",
    slug: "globalmeet-live-webcasting-audience-engagement",
    category: "Enterprise product",
    shortDescription:
      "Contributed to GlobalMeet, an enterprise webcasting platform used for large-scale virtual events, by developing reusable interactive components and real-time audience engagement features integrated into the existing Java-based platform.",
    problem:
      "Large-scale webcasts need engaging, responsive audience interactions while staying reliable during live events — and new capabilities had to fit into established workflows without disrupting them.",
    solution:
      "Reusable front-end components, including live emoji reactions and real-time audience-sentiment visualizations, built to plug into the existing Java back end and work across different areas of the platform.",
    result:
      "Improved the platform's live audience engagement capabilities by giving attendees a lightweight way to react during webcasts while providing event teams with real-time visual feedback on audience sentiment. The component approach also reduced duplicated code and made new features easier to integrate.",
    projectUrl: "https://www.globalmeet.com/",
    status: "PUBLISHED",
    featured: true,
    images: [
      `${BLOB}/globalmeet-live-webcasting-audience-engagement/1787049037183-0-ChatGPT-Image-Aug-18-2026-06_30_29-PM-cU4B8XUMZFxIvmBA5DQquV4YnEW9eh.png`,
    ],
    technologies: [
      "Java",
      "J2EE",
      "React",
      "Reusable UI Components",
      "Real-Time Data Visualization",
      "Live Sentiment Tracking",
      "Webcasting",
      "REST APIs",
    ],
  },
];

/** Groups for the technology library (only for names that appear above). */
export const technologyCategories: Record<string, string> = {
  "Next.js": "Frontend",
  React: "Frontend",
  TypeScript: "Language",
  "Tailwind CSS": "Frontend",
  "Bootstrap 5.3": "Frontend",
  "jQuery with AJAX": "Frontend",
  "Node.js": "Backend",
  Java: "Backend",
  J2EE: "Backend",
  "PHP 8.1+": "Backend",
  "Laravel 10": "Backend",
  "REST APIs": "Backend",
  PostgreSQL: "Database",
  Neon: "Database",
  "MySQL 8/MariaDB": "Database",
  Vercel: "Cloud",
};

export interface SeedTeamMember {
  name: string;
  slug: string;
  role: string;
  shortBio: string;
  bio: string;
  profileImage?: string;
  responsibilities: string[];
  skills: string[];
  experience: string;
  isPublished: boolean;
  isFeatured: boolean;
}

export const teamMembers: SeedTeamMember[] = [
  {
    name: "John Person Narral",
    slug: "john-person-narral",
    role: "Backend / Full Stack Engineer",
    shortBio: "Backend depth and full-stack execution in one engineer.",
    bio: "A backend and full-stack engineer and freelancer with approximately six years of experience across banking, insurance, live-meeting products, enterprise modernization, and rapid MVP delivery.",
    profileImage: "/images/profile.png",
    responsibilities: [
      "Java, Spring Boot & microservices",
      "REST APIs & system integration",
      "React, Next.js & TypeScript",
      "Azure DevOps CI/CD & cloud delivery",
      "Rapid MVP prototyping",
    ],
    skills: [],
    experience: "~6 years building enterprise and web applications",
    isPublished: true,
    isFeatured: true,
  },
  {
    // Profile supplied by the owner. Name and photo not provided yet —
    // update them in Admin → Team.
    name: "IAM & IT Operations Specialist",
    slug: "second-team-member",
    role: "Identity & Access Management · IT Operations",
    shortBio: "Enterprise IT operations and Identity & Access Management.",
    bio: "Results-driven IT professional with 5+ years of experience in enterprise technology and Identity & Access Management. Experienced in supporting technology operations, managing identity-related processes, troubleshooting technical issues, and delivering reliable IT services within a corporate environment.",
    responsibilities: [
      "Identity and Access Management (IAM)",
      "IT Operations and Technical Support",
      "Enterprise Application Support",
      "User Access Administration",
      "Incident and Problem Resolution",
      "Systems Administration",
      "IT Service Management",
      "Troubleshooting and Root-Cause Analysis",
      "Process Improvement",
      "Enterprise Technology Support",
    ],
    skills: [],
    experience: "5+ years in enterprise technology & IAM",
    isPublished: true,
    isFeatured: true,
  },
];

export const services: Prisma.ServiceCreateInput[] = [
  {
    title: "Launch a new product",
    slug: "launch-a-new-product",
    shortDescription:
      "You have an idea and need a real, working first version — not a slide deck.",
    description:
      "We shape the idea, design the essentials, and ship something your customers can actually use, so you can learn fast and grow from there.",
    leadLabel: "Both of us",
    isPublished: true,
    isFeatured: true,
  },
  {
    title: "Replace the spreadsheets",
    slug: "replace-the-spreadsheets",
    shortDescription:
      "Your team runs on spreadsheets, email threads, and copy-paste.",
    description:
      "We turn those manual steps into a simple internal tool that saves hours every week and keeps everyone working from the same information.",
    leadLabel: "Led by John",
    isPublished: true,
  },
  {
    title: "Customer portals & web apps",
    slug: "customer-portals-web-apps",
    shortDescription:
      "Customers keep calling or emailing for things they should be able to do themselves.",
    description:
      "We build a clean, self-serve experience — bookings, requests, account details, documents — that feels effortless for your customers.",
    leadLabel: "Led by John",
    isPublished: true,
  },
  {
    title: "Modernise an outdated system",
    slug: "modernise-an-outdated-system",
    shortDescription:
      "The system works, but it's slow, fragile, and nobody wants to touch it.",
    description:
      "We rebuild it step by step, without disrupting your day-to-day, so it becomes faster, easier to use, and easier to change.",
    leadLabel: "Both of us",
    isPublished: true,
  },
  {
    title: "Secure logins & user access",
    slug: "secure-logins-user-access",
    shortDescription:
      "You're not sure who can see what — or onboarding new staff and clients is a headache.",
    description:
      "We set up proper sign-in, roles, and permissions so the right people get the right access, and removing access is just as easy.",
    leadLabel: "Led by Systems, Access & Operations",
    isPublished: true,
  },
  {
    title: "Launch support & ongoing care",
    slug: "launch-support-ongoing-care",
    shortDescription:
      "You need someone to call when something breaks — and to stop it breaking again.",
    description:
      "We keep your product healthy after launch, fix issues at their root, and put simple support processes in place.",
    leadLabel: "Led by Systems, Access & Operations",
    isPublished: true,
  },
];

export const processSteps: Pick<
  Prisma.ProcessStepCreateInput,
  "title" | "headline" | "description"
>[] = [
  {
    title: "Understand",
    headline: "We start with your business, not the code",
    description:
      "A focused conversation about what's slowing you down, who the product is for, and what success looks like. You get a clear plan in plain language.",
  },
  {
    title: "Shape & build",
    headline: "You see real progress, early and often",
    description:
      "We design the essentials and build in short steps, sharing working versions as we go — so there are no surprises at the end.",
  },
  {
    title: "Launch safely",
    headline: "Secure, tested, and ready for real people",
    description:
      "Logins, permissions, and access are set up properly before go-live, and we handle the launch with you so day one is calm.",
  },
  {
    title: "Look after it",
    headline: "We don't disappear after launch",
    description:
      "We keep the product healthy, fix what comes up, and help it grow as your business does.",
  },
];

/** Career history (background page). Seeded only into an empty table. */
export const experiences: Prisma.ExperienceCreateManyInput[] =
  PROFILE_EXPERIENCES.map(({ id: _id, startDate, endDate, ...entry }) => ({
    ...entry,
    startDate: new Date(startDate),
    endDate: endDate ? new Date(endDate) : null,
  }));

/** Toolkit (background page). Seeded only into an empty table. */
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
