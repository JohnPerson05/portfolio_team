import type { Metadata } from "next";
import { FadeUp, Stagger } from "@/components/motion";
import { Button, Card, PageHero, SectionHeading, Tag } from "@/components/ui";
import { PROFILE_EXPERIENCES } from "@/features/experience";
import { Team } from "@/features/studio";
import { TrustStats, toTrustStats } from "@/features/trust";
import {
  getSectionCopy,
  getSiteSettings,
  getTeamMembers,
} from "@/server/public/queries";
import { createPageMetadata } from "@/lib/seo";

const EXPERTISE = [
  {
    number: "01",
    title: "Backend Engineering",
    description:
      "Enterprise services, scalable integrations, architecture, and automated testing.",
    skills: [
      "Java",
      "Spring Boot",
      "Microservices Architecture",
      "REST APIs",
      "JUnit Testing",
      "SQL",
      "OOP Principles",
      "XML",
      "Backend Integration",
    ],
  },
  {
    number: "02",
    title: "Frontend & Full Stack",
    description:
      "Modern product interfaces, reusable systems, and legacy application modernization.",
    skills: [
      "React.js",
      "Next.js",
      "TypeScript",
      "JavaScript",
      "Tailwind CSS",
      "Bootstrap",
      "jQuery & AJAX",
      "JSP / JSTL",
      "Reusable UI Components",
      "MVP Prototyping",
    ],
  },
  {
    number: "03",
    title: "Cloud, Delivery & Observability",
    description:
      "Reliable delivery pipelines, cloud platforms, deployment, and production visibility.",
    skills: [
      "Azure DevOps CI/CD",
      "OpenShift",
      "GitLab",
      "Bitbucket",
      "Vercel",
      "Kibana",
      "Datadog",
      "Grafana",
    ],
  },
  {
    number: "04",
    title: "AI-Assisted Development",
    description:
      "Faster prototyping and focused implementation with modern engineering assistants.",
    skills: ["Codex", "Claude", "Lovable", "v0 by Vercel"],
  },
  {
    number: "05",
    title: "Tools & Methodologies",
    description:
      "Collaborative planning, API validation, and delivery across structured environments.",
    skills: ["Agile Scrum", "Waterfall", "Jira", "Confluence", "Postman API"],
  },
  {
    number: "06",
    title: "Identity, Access & IT Operations",
    description:
      "Secure user access, dependable enterprise operations, and fast, root-cause incident resolution.",
    skills: [
      "Identity & Access Management",
      "User Access Administration",
      "IT Operations & Support",
      "Enterprise Application Support",
      "Systems Administration",
      "IT Service Management",
      "Incident & Problem Resolution",
      "Root-Cause Analysis",
      "Process Improvement",
    ],
  },
] as const;

/** At-a-glance facts for the studio profile card. */
const STUDIO_FACTS = [
  ["Team", "2 specialists"],
  ["Combined experience", "11+ years"],
  ["Engineering", "Backend / Full Stack"],
  ["Operations", "IAM & IT Operations"],
  ["Delivery", "Enterprise & MVP"],
  ["Engagement", "Freelance / Global"],
] as const;

const PRINCIPLES = [
  {
    number: "01",
    title: "Clarity before code",
    body: "Align the product goal, user need, and technical constraints before increasing delivery speed.",
  },
  {
    number: "02",
    title: "Interaction with purpose",
    body: "Motion and detail should explain state, create confidence, and make the product easier to use.",
  },
  {
    number: "03",
    title: "Built to keep working",
    body: "Maintainability, performance, accessibility, and observability are product features—not cleanup.",
  },
  {
    number: "04",
    title: "Secure access from day one",
    body: "Roles, permissions, and user access are designed in before launch—so onboarding is easy and offboarding is instant.",
  },
] as const;

function formatRolePeriod(
  company: string,
  startDate: string,
  endDate: string | null,
): string {
  if (company === "GlobalMeet") return "Project experience";
  if (!endDate) return "Current";

  const format = new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  return `${format.format(new Date(startDate))} — ${format.format(new Date(endDate))}`;
}

export const metadata: Metadata = createPageMetadata({
  title: "About",
  description:
    "A two-person team pairing backend and full-stack engineering with Identity & Access Management and enterprise IT operations.",
  path: "/about",
});

export default async function AboutPage() {
  const [team, teamCopy, settings] = await Promise.all([
    getTeamMembers(),
    getSectionCopy("team"),
    getSiteSettings(),
  ]);
  return (
    <>
      <PageHero
        index="00"
        eyebrow="About us"
        title="Engineering depth. Secure operations. One team."
        description="We are a two-person team: a backend and full-stack engineer with approximately six years of enterprise delivery, and an IT professional with 5+ years in Identity & Access Management and enterprise IT operations."
      />

      <Team
        members={team}
        eyebrow={teamCopy?.eyebrow}
        heading={teamCopy?.title ?? "The team"}
        description={teamCopy?.description}
        showBackground
        showStudioLink={false}
      />

      <section className="border-t border-hairline px-space-2 py-section sm:px-space-4">
        <div className="mx-auto grid max-w-content gap-space-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.55fr)] lg:items-start">
          <FadeUp>
            <div>
              <span className="font-mono text-caption uppercase tracking-[0.18em] text-accent">
                Studio profile
              </span>
              <h2 className="mt-space-3 max-w-4xl text-balance font-display text-h2 font-semibold text-text">
                We build it, secure it, and keep it running.
              </h2>
              <p className="mt-space-4 max-w-4xl text-pretty text-body-lg leading-relaxed text-muted">
                Most products fail in the gaps between building and running
                them. We close those gaps: one of us designs and ships the
                system, the other makes sure the right people have the right
                access and that it stays dependable once real users arrive.
              </p>
              <p className="mt-space-3 max-w-4xl text-pretty text-body leading-relaxed text-muted">
                Together our work spans secure banking services, export-import
                insurance applications, live-meeting products, enterprise
                integrations, identity and access administration, IT service
                management, and production support—from architecture and API
                design to user access, incident resolution, and process
                improvement.
              </p>
              <div className="mt-space-5 flex flex-wrap gap-space-2">
                <Button href="/projects" variant="primary" size="md">
                  View project work
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  disabled
                  aria-disabled="true"
                  title="Résumé download is currently unavailable"
                >
                  Download résumé
                </Button>
              </div>
            </div>
          </FadeUp>

          <FadeUp>
            <aside className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0d10]">
              <div
                aria-hidden="true"
                className="programmatic-grid absolute inset-0 opacity-20"
              />
              <div className="relative p-space-4">
                <div className="flex items-center gap-space-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-accent">
                  <span className="status-pulse h-2 w-2 rounded-full bg-emerald-400" />
                  Studio at a glance
                </div>
                <dl className="mt-space-4 divide-y divide-white/10">
                  {STUDIO_FACTS.map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-start justify-between gap-space-3 py-space-3 first:pt-0 last:pb-0"
                    >
                      <dt className="font-mono text-[0.62rem] uppercase tracking-wider text-muted">
                        {label}
                      </dt>
                      <dd className="text-right font-sans text-body font-medium text-text">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </aside>
          </FadeUp>
        </div>
      </section>

      <TrustStats
        stats={toTrustStats(settings["home.stats"])}
        showDetailLink={false}
        className="bg-transparent"
      />

      <section className="border-t border-hairline bg-bg-secondary px-space-2 py-section sm:px-space-4">
        <div className="mx-auto max-w-content">
          <SectionHeading
            eyebrow="Expertise map"
            heading="One team, a complete delivery toolkit"
            description="Technologies and practices across backend systems, full-stack products, cloud delivery, observability, rapid prototyping, identity & access, and IT operations."
          />
          <Stagger
            as="ul"
            className="mt-space-8 grid gap-space-3 md:grid-cols-2"
          >
            {EXPERTISE.map((group, index) => (
              <FadeUp
                as="li"
                key={group.title}
                // An odd final card spans the row so the grid never ends ragged.
                className={`list-none ${
                  index === EXPERTISE.length - 1 && EXPERTISE.length % 2 === 1
                    ? "md:col-span-2"
                    : ""
                }`}
              >
                <Card className="h-full p-space-4 sm:p-space-5">
                  <div className="flex items-start gap-space-3">
                    <span className="font-mono text-caption text-accent">
                      {group.number}
                    </span>
                    <div>
                      <h3 className="font-display text-h3 font-semibold text-text">
                        {group.title}
                      </h3>
                      <p className="mt-space-1 text-pretty text-caption leading-relaxed text-muted">
                        {group.description}
                      </p>
                    </div>
                  </div>
                  <ul className="mt-space-4 flex flex-wrap gap-space-1">
                    {group.skills.map((skill) => (
                      <li key={skill}>
                        <Tag>{skill}</Tag>
                      </li>
                    ))}
                  </ul>
                </Card>
              </FadeUp>
            ))}
          </Stagger>
          <div className="mt-space-6 flex justify-end">
            <Button href="/skills" variant="ghost" size="md">
              Explore detailed capabilities →
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-hairline px-space-2 py-section sm:px-space-4">
        <div className="mx-auto max-w-content">
          <SectionHeading
            eyebrow="Engineering career snapshot"
            heading="Experience across enterprise delivery"
            description="The engineering roles and product environments behind the build side of the team."
          />
          <Stagger
            as="ol"
            className="mt-space-8 grid gap-space-3 lg:grid-cols-2"
          >
            {PROFILE_EXPERIENCES.map((experience) => (
              <FadeUp as="li" key={experience.id} className="h-full list-none">
                <Card className="flex h-full flex-col p-space-4 sm:p-space-5">
                  <div className="flex flex-wrap items-start justify-between gap-space-3">
                    <div>
                      <span className="font-mono text-[0.62rem] uppercase tracking-widest text-accent">
                        {experience.company}
                      </span>
                      <h3 className="mt-space-1 font-display text-h3 font-semibold text-text">
                        {experience.position}
                      </h3>
                    </div>
                    <span className="rounded-full border border-hairline bg-bg-secondary px-space-2 py-space-1 font-mono text-[0.6rem] uppercase tracking-wider text-muted">
                      {formatRolePeriod(
                        experience.company,
                        experience.startDate,
                        experience.endDate,
                      )}
                    </span>
                  </div>
                  <p className="mt-space-4 text-pretty text-body leading-relaxed text-muted">
                    {experience.impact}
                  </p>
                  <ul className="mt-space-4 space-y-space-2 border-t border-hairline pt-space-3">
                    {experience.achievements.slice(0, 2).map((achievement) => (
                      <li
                        key={achievement}
                        className="flex gap-space-2 text-caption leading-relaxed text-muted"
                      >
                        <span aria-hidden="true" className="text-accent">
                          /
                        </span>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </Card>
              </FadeUp>
            ))}
          </Stagger>
          <div className="mt-space-6 flex justify-end">
            <Button href="/experience" variant="ghost" size="md">
              View complete experience →
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-hairline px-space-2 py-section sm:px-space-4">
        <div className="mx-auto max-w-content">
          <SectionHeading
            eyebrow="How we work"
            heading="Delivery principles"
            description="The operating principles we share to make delivery clearer, more secure, and more reliable."
          />
          <Stagger
            as="ul"
            className="mt-space-8 grid gap-space-3 md:grid-cols-2 lg:grid-cols-4"
          >
            {PRINCIPLES.map((principle) => (
              <FadeUp
                as="li"
                key={principle.number}
                className="h-full list-none"
              >
                <Card className="h-full p-space-4">
                  <span className="font-mono text-caption text-accent">
                    {principle.number}
                  </span>
                  <h3 className="mt-space-6 font-display text-h3 font-semibold text-text">
                    {principle.title}
                  </h3>
                  <p className="mt-space-2 text-pretty text-body text-muted">
                    {principle.body}
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
                  Work together
                </span>
                <h2 className="mt-space-2 max-w-3xl text-balance font-display text-h2 font-semibold text-text">
                  Need it built, secured, and supported—by one team?
                </h2>
                <p className="mt-space-3 max-w-2xl text-pretty text-body leading-relaxed text-muted">
                  We are available for focused freelance engagements, enterprise
                  product work, integrations, modernization, MVP delivery,
                  identity & access setup, and ongoing IT support.
                </p>
              </div>
              <Button href="/contact" variant="primary" size="lg">
                Start a conversation
              </Button>
            </div>
          </div>
        </FadeUp>
      </section>
    </>
  );
}
