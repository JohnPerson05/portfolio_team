import { FadeUp, Stagger } from "@/components/motion";
import { Button, Card, SectionHeading, Tag } from "@/components/ui";
import type { TeamMemberView } from "@/types";
import { MemberPortrait } from "./Team";

/**
 * `MemberProfile` — one person's own page: bio, responsibilities &
 * contributions, grouped skills, and professional focus. Sections without
 * content are skipped, so a sparse profile still reads cleanly.
 */
export function MemberProfile({ member }: { member: TeamMemberView }) {
  const skillGroups =
    member.skillGroups.length > 0
      ? member.skillGroups
      : member.skills.length > 0
        ? [{ label: "Skills & background", items: member.skills }]
        : [];

  return (
    <>
      <section
        aria-labelledby="member-profile-name"
        className="relative overflow-hidden border-b border-hairline px-space-2 pb-space-12 pt-space-10 sm:px-space-4 sm:pt-space-16"
      >
        <div aria-hidden="true" className="programmatic-grid absolute inset-0 opacity-30" />
        <div className="relative mx-auto grid max-w-content gap-space-6 md:grid-cols-[14rem_minmax(0,1fr)] md:items-end">
          <MemberPortrait
            member={member}
            priority
            sizes="(max-width: 768px) 90vw, 14rem"
            className="max-w-[14rem]"
          />
          <div>
            <p className="font-mono text-caption uppercase tracking-[0.18em] text-accent">
              {member.role}
            </p>
            <h1
              id="member-profile-name"
              className="mt-space-2 text-balance font-display text-h1 font-semibold text-text"
            >
              {member.name}
            </h1>
            {member.experience ? (
              <p className="mt-space-2 font-mono text-[0.68rem] uppercase tracking-widest text-muted">
                {member.experience}
              </p>
            ) : null}
            {member.bio ? (
              <p className="mt-space-3 max-w-3xl text-pretty text-body-lg leading-relaxed text-muted">
                {member.bio}
              </p>
            ) : null}
            {member.responsibilities.length > 0 ? (
              <ul className="mt-space-4 flex flex-wrap gap-space-1">
                {member.responsibilities.map((area) => (
                  <li key={area}>
                    <Tag>{area}</Tag>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </section>

      {member.highlights.length > 0 ? (
        <section className="px-space-2 py-section sm:px-space-4">
          <div className="mx-auto max-w-content">
            <SectionHeading
              eyebrow="Experience"
              heading="Key responsibilities & contributions"
            />
            <Stagger as="ol" className="mt-space-8 grid gap-space-2 md:grid-cols-2">
              {member.highlights.map((item, index) => (
                <FadeUp as="li" key={item} className="list-none">
                  <Card className="flex h-full gap-space-3 p-space-3">
                    <span className="font-mono text-caption text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="text-pretty text-body leading-relaxed text-text/90">{item}</p>
                  </Card>
                </FadeUp>
              ))}
            </Stagger>
          </div>
        </section>
      ) : null}

      {skillGroups.length > 0 ? (
        <section className="border-y border-hairline bg-bg-secondary px-space-2 py-section sm:px-space-4">
          <div className="mx-auto max-w-content">
            <SectionHeading eyebrow="Skills" heading="Technology & technical skills" />
            <Stagger as="ul" className="mt-space-8 grid gap-space-3 sm:grid-cols-2 lg:grid-cols-3">
              {skillGroups.map((group) => (
                <FadeUp as="li" key={group.label} className="h-full list-none">
                  <Card className="h-full p-space-4">
                    <h3 className="font-display text-body-lg font-semibold text-text">
                      {group.label}
                    </h3>
                    <ul className="mt-space-3 flex flex-wrap gap-space-1">
                      {group.items.map((skill) => (
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
      ) : null}

      {member.focus ? (
        <section className="px-space-2 py-section sm:px-space-4">
          <FadeUp className="mx-auto max-w-content">
            <div className="border-accent/20 bg-accent/[0.045] rounded-2xl border p-space-5 sm:p-space-8">
              <span className="font-mono text-caption uppercase tracking-widest text-accent">
                Professional focus
              </span>
              <p className="mt-space-3 max-w-3xl text-pretty text-body-lg leading-relaxed text-text/90">
                {member.focus}
              </p>
              <div className="mt-space-5 flex flex-wrap gap-space-2">
                <Button href="/contact" variant="primary" size="md">
                  Start a conversation
                </Button>
                <Button href="/about" variant="ghost" size="md">
                  Meet the team
                </Button>
              </div>
            </div>
          </FadeUp>
        </section>
      ) : null}
    </>
  );
}
