import type { ExperienceView } from "@/types";

/**
 * Canonical public career history for John Person Narral.
 *
 * Experience content is intentionally code-owned so the public portfolio never
 * falls back to stale demo rows from an older database seed.
 */
export const PROFILE_EXPERIENCES: readonly ExperienceView[] = [
  {
    id: "john-ing-backend-engineer",
    company: "ING",
    position: "Backend Engineer",
    startDate: "2025-09-01T00:00:00.000Z",
    endDate: null,
    impact:
      "Build and maintain secure enterprise banking services using Java, Spring Boot, microservices, and cloud-native delivery practices.",
    achievements: [
      "Develop and optimize RESTful APIs and backend integrations for scalable banking applications.",
      "Support Azure DevOps CI/CD pipelines and maintain JUnit unit and integration tests.",
      "Contribute to ICHP initiatives, production support, performance optimization, and system reliability improvements.",
      "Collaborate with cross-functional Agile teams through delivery, troubleshooting, and code review.",
    ],
    order: 1,
  },
  {
    id: "john-globalmeet-full-stack",
    company: "GlobalMeet",
    position: "Full Stack Developer",
    startDate: "2025-08-15T00:00:00.000Z",
    endDate: "2025-09-01T00:00:00.000Z",
    impact:
      "Created rapid MVPs and reusable product experiences across modern frontend systems and existing Java and PHP applications.",
    achievements: [
      "Translated product concepts into functional prototypes and reusable React components.",
      "Developed interactive live-meeting features including emoji reactions and sentiment-related reporting interfaces.",
      "Integrated modern UI functionality with legacy applications, existing APIs, and backend services.",
      "Worked with product, design, and engineering teams to evolve validated concepts toward production.",
    ],
    order: 2,
  },
  {
    id: "john-ibm-application-developer",
    company: "IBM Corp.",
    position: "Application Developer",
    startDate: "2024-07-01T00:00:00.000Z",
    endDate: "2025-08-31T00:00:00.000Z",
    impact:
      "Delivered accessible user-facing enhancements and BFF capabilities for enterprise export-import insurance applications.",
    achievements: [
      "Built React.js interface enhancements and resolved production UI issues.",
      "Contributed to Frontend-for-Backend development using React.js and Spring Boot.",
      "Implemented accessibility improvements and pixel-accurate interfaces with UX designers.",
      "Participated in Agile planning, technical collaboration, and frontend code reviews.",
    ],
    order: 3,
  },
  {
    id: "john-accenture-software-engineer",
    company: "Accenture Inc.",
    position: "Software Engineer Analyst",
    startDate: "2021-05-01T00:00:00.000Z",
    endDate: "2024-07-31T00:00:00.000Z",
    impact:
      "Developed and enhanced enterprise applications using React, Java, Spring Boot, and Bootstrap.",
    achievements: [
      "Integrated responsive frontend experiences with APIs and microservices.",
      "Supported application deployment, CI/CD activities, and performance tuning.",
      "Translated design mockups into responsive, user-friendly interfaces.",
      "Participated in UAT, code reviews, and cross-browser testing.",
    ],
    order: 4,
  },
];
