import type { Metadata } from "next";
import { FadeUp, Stagger } from "@/components/motion";
import { Button, Card, PageHero, SectionHeading, Tag } from "@/components/ui";
import { Skills } from "@/features/skills";
import { createPageMetadata } from "@/lib/seo";

const CAPABILITY_LAYERS = [
  {
    number: "01",
    title: "Architecture & APIs",
    description:
      "Designing maintainable backend services, secure integrations, and scalable communication between enterprise systems.",
    focus: ["Java", "Spring Boot", "Microservices", "REST APIs", "SQL"],
    signal: "Backend-first",
  },
  {
    number: "02",
    title: "Product Interfaces",
    description:
      "Building responsive experiences and reusable components that connect cleanly to modern and legacy backends.",
    focus: ["React.js", "Next.js", "TypeScript", "Tailwind CSS", "JSP / JSTL"],
    signal: "Full-stack",
  },
  {
    number: "03",
    title: "Cloud Delivery",
    description:
      "Automating delivery, supporting production systems, and improving reliability through monitoring and observability.",
    focus: ["Azure DevOps", "OpenShift", "Vercel", "Datadog", "Grafana"],
    signal: "Production-ready",
  },
  {
    number: "04",
    title: "Rapid Product Validation",
    description:
      "Turning product ideas into functional MVPs, interactive prototypes, and reusable features that can evolve into production.",
    focus: ["Codex", "Claude", "Lovable", "v0 by Vercel", "MVP Prototyping"],
    signal: "AI-assisted",
  },
] as const;

const DELIVERY_TOOLKIT = [
  {
    label: "Engineering quality",
    values: [
      "JUnit Testing",
      "Code Reviews",
      "Accessibility",
      "Performance Tuning",
      "Cross-browser Testing",
    ],
  },
  {
    label: "Collaboration",
    values: [
      "Agile Scrum",
      "Waterfall",
      "Jira",
      "Confluence",
      "Cross-functional Delivery",
    ],
  },
  {
    label: "Integration & operations",
    values: [
      "Postman API",
      "GitLab",
      "Bitbucket",
      "Kibana",
      "Production Support",
    ],
  },
] as const;

const DELIVERY_DOMAINS = [
  {
    organization: "ING",
    domain: "Enterprise banking",
    detail:
      "Secure backend services, REST APIs, CI/CD, integrations, testing, and system reliability.",
  },
  {
    organization: "GlobalMeet",
    domain: "Live-meeting products",
    detail:
      "Rapid MVPs, reusable components, interactive meeting features, and legacy platform integration.",
  },
  {
    organization: "IBM Corp.",
    domain: "Export-import insurance",
    detail:
      "Accessible React interfaces, Spring Boot BFF development, UX collaboration, and production issue resolution.",
  },
  {
    organization: "Accenture Inc.",
    domain: "Enterprise modernization",
    detail:
      "React and Java delivery, API integration, responsive interfaces, deployment support, and quality validation.",
  },
] as const;

export const metadata: Metadata = createPageMetadata({
  title: "Capabilities",
  description:
    "John Person Narral's engineering capabilities across Java, Spring Boot, microservices, React, Next.js, cloud delivery, observability, and AI-assisted MVP development.",
  path: "/skills",
});

export default function SkillsPage() {
  return (
    <>
      <PageHero
        index="02"
        eyebrow="Capabilities"
        title="Backend depth. Full-stack delivery. Production discipline."
        description="A practical engineering capability set shaped by approximately six years of enterprise delivery—spanning Java services, modern product interfaces, cloud pipelines, observability, and rapid MVP development."
      />

      <section className="px-space-2 py-section sm:px-space-4">
        <div className="mx-auto max-w-content">
          <SectionHeading
            eyebrow="Capability architecture"
            heading="How the stack fits together"
            description="Each capability layer supports the next—from dependable services and integrations to polished interfaces, reliable delivery, and fast product validation."
          />
          <Stagger
            as="ol"
            className="mt-space-8 grid gap-space-3 md:grid-cols-2"
          >
            {CAPABILITY_LAYERS.map((capability) => (
              <FadeUp
                as="li"
                key={capability.number}
                className="h-full list-none"
              >
                <Card className="relative flex h-full flex-col overflow-hidden p-space-4 sm:p-space-5">
                  <span
                    aria-hidden="true"
                    className="absolute right-space-3 top-space-2 font-mono text-hero font-semibold text-white/[0.025]"
                  >
                    {capability.number}
                  </span>
                  <div className="relative flex items-start justify-between gap-space-3">
                    <span className="border-accent/20 bg-accent/10 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border font-mono text-caption font-semibold text-accent">
                      {capability.number}
                    </span>
                    <span className="rounded-full border border-hairline bg-bg-secondary px-space-2 py-space-1 font-mono text-[0.6rem] uppercase tracking-wider text-muted">
                      {capability.signal}
                    </span>
                  </div>
                  <h2 className="relative mt-space-5 font-display text-h3 font-semibold text-text">
                    {capability.title}
                  </h2>
                  <p className="relative mt-space-2 text-pretty text-body leading-relaxed text-muted">
                    {capability.description}
                  </p>
                  <ul className="relative mt-space-4 flex flex-wrap gap-space-1">
                    {capability.focus.map((skill) => (
                      <li key={skill}>
                        <Tag>{skill}</Tag>
                      </li>
                    ))}
                  </ul>
                </Card>
              </FadeUp>
            ))}
          </Stagger>
        </div>
      </section>

      <Skills
        eyebrow="Engineering matrix"
        heading="Detailed skills & proficiency"
        showDetailLink={false}
        className="border-y border-hairline bg-bg-secondary"
      />

      <section className="px-space-2 py-section sm:px-space-4">
        <div className="mx-auto grid max-w-content gap-space-8 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
          <FadeUp>
            <div>
              <span className="font-mono text-caption uppercase tracking-[0.18em] text-accent">
                Delivery toolkit
              </span>
              <h2 className="mt-space-3 text-balance font-display text-h2 font-semibold text-text">
                More than a technology list
              </h2>
              <p className="mt-space-3 max-w-xl text-pretty text-body-lg leading-relaxed text-muted">
                Strong delivery also depends on testing, accessibility,
                collaboration, observability, production support, and clear
                communication across product and engineering teams.
              </p>
              <div className="mt-space-5 flex flex-wrap gap-space-2">
                <Button href="/experience" variant="outline" size="md">
                  See experience
                </Button>
                <Button href="/projects" variant="ghost" size="md">
                  View project work
                </Button>
              </div>
            </div>
          </FadeUp>

          <Stagger as="ul" className="grid gap-space-3">
            {DELIVERY_TOOLKIT.map((group, index) => (
              <FadeUp as="li" key={group.label} className="list-none">
                <Card className="p-space-4">
                  <div className="flex flex-col gap-space-3 sm:flex-row sm:items-start">
                    <span className="font-mono text-caption text-accent">
                      0{index + 1}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-display text-body-lg font-semibold text-text">
                        {group.label}
                      </h3>
                      <ul className="mt-space-3 flex flex-wrap gap-space-1">
                        {group.values.map((value) => (
                          <li key={value}>
                            <Tag>{value}</Tag>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              </FadeUp>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="border-t border-hairline bg-bg-secondary px-space-2 py-section sm:px-space-4">
        <div className="mx-auto max-w-content">
          <SectionHeading
            eyebrow="Applied expertise"
            heading="Capabilities backed by delivery context"
            description="The skill set has been applied across regulated enterprise systems, product experiences, integrations, and modernization initiatives."
          />
          <Stagger
            as="ul"
            className="mt-space-8 grid gap-space-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            {DELIVERY_DOMAINS.map((item, index) => (
              <FadeUp
                as="li"
                key={item.organization}
                className="h-full list-none"
              >
                <Card className="flex h-full flex-col p-space-4">
                  <div className="flex items-center justify-between gap-space-2">
                    <span className="font-mono text-caption uppercase tracking-widest text-accent">
                      {item.organization}
                    </span>
                    <span className="font-mono text-caption text-muted">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-space-5 font-display text-h3 font-semibold text-text">
                    {item.domain}
                  </h3>
                  <p className="mt-space-2 text-pretty text-caption leading-relaxed text-muted">
                    {item.detail}
                  </p>
                </Card>
              </FadeUp>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="border-t border-hairline px-space-2 py-section sm:px-space-4">
        <FadeUp className="mx-auto max-w-content">
          <div className="border-accent/20 bg-accent/[0.045] relative overflow-hidden rounded-2xl border p-space-5 sm:p-space-8">
            <div
              aria-hidden="true"
              className="programmatic-grid absolute inset-0 opacity-20"
            />
            <div className="relative flex flex-col gap-space-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="font-mono text-caption uppercase tracking-widest text-accent">
                  Capability fit
                </span>
                <h2 className="mt-space-2 max-w-3xl text-balance font-display text-h2 font-semibold text-text">
                  Have a system, integration, or product challenge?
                </h2>
                <p className="mt-space-3 max-w-2xl text-pretty text-body leading-relaxed text-muted">
                  Share the context and I can help identify the right
                  architecture, delivery path, and capability mix.
                </p>
              </div>
              <Button href="/contact" variant="primary" size="lg">
                Discuss your project
              </Button>
            </div>
          </div>
        </FadeUp>
      </section>
    </>
  );
}
