import Image from "next/image";
import { FadeUp, Stagger } from "@/components/motion";
import { Button, SectionHeading } from "@/components/ui";
import { imageSource } from "@/lib/images";
import { cn } from "@/lib/utils";
import type { TeamMemberView } from "@/types";

/** The "where we meet" band under the team cards (CMS: home.overlap*). */
export interface TeamOverlap {
  title: string;
  body: string;
  points: readonly string[];
}

function Portrait({ member }: { member: TeamMemberView }) {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-white/10 bg-[#090b0e] sm:w-40 sm:shrink-0">
      {member.profileImage ? (
        <Image
          {...imageSource(member.profileImage)}
          alt={member.name}
          fill
          sizes="(max-width: 640px) 90vw, 10rem"
          className="object-cover object-[center_12%]"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-space-1 bg-[radial-gradient(circle_at_30%_20%,rgba(114,215,255,0.16),transparent_55%),radial-gradient(circle_at_80%_90%,rgba(212,175,55,0.14),transparent_50%)]">
          <span className="font-display text-h1 font-semibold text-text/85">
            {member.initials}
          </span>
        </div>
      )}
    </div>
  );
}

/** Public contact/profile links for a member, when provided. */
function MemberLinks({ member }: { member: TeamMemberView }) {
  const links = [
    member.linkedin ? { label: "LinkedIn", href: member.linkedin } : null,
    member.github ? { label: "GitHub", href: member.github } : null,
    member.website ? { label: "Website", href: member.website } : null,
    member.email ? { label: "Email", href: `mailto:${member.email}` } : null,
  ].filter((link): link is { label: string; href: string } => link !== null);

  if (links.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-x-space-3 gap-y-1">
      {links.map((link) => (
        <li key={link.label}>
          <a
            href={link.href}
            target={link.href.startsWith("mailto:") ? undefined : "_blank"}
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center font-mono text-[0.62rem] uppercase tracking-widest text-muted transition-colors hover:text-accent"
          >
            {link.label} ↗
          </a>
        </li>
      ))}
    </ul>
  );
}

/** One team member, written for a business reader. */
export function MemberCard({
  member,
  showBackground = false,
  className,
}: {
  member: TeamMemberView;
  showBackground?: boolean;
  className?: string;
}) {
  return (
    <article
      aria-labelledby={`member-${member.id}-name`}
      className={cn(
        "relative flex h-full flex-col gap-space-4 overflow-hidden rounded-2xl border border-hairline bg-card p-space-3 sm:p-space-5",
        className,
      )}
    >
      <div className="flex flex-col gap-space-3 sm:flex-row sm:items-end">
        <Portrait member={member} />
        <div>
          <p className="font-mono text-caption uppercase tracking-[0.18em] text-accent">
            {member.role}
          </p>
          <h3
            id={`member-${member.id}-name`}
            className="mt-space-1 font-display text-h3 font-semibold text-text"
          >
            {member.name}
          </h3>
          {member.shortBio ? (
            <p className="mt-space-1 text-pretty font-display text-body-lg leading-snug text-text/90">
              {member.shortBio}
            </p>
          ) : null}
        </div>
      </div>

      {member.bio ? (
        <p className="text-pretty text-body leading-relaxed text-muted">
          {member.bio}
        </p>
      ) : null}

      {member.responsibilities.length > 0 ? (
        <div className="border-t border-hairline pt-space-3">
          <p className="font-mono text-[0.62rem] uppercase tracking-widest text-muted">
            Key areas
          </p>
          <ul className="mt-space-2 flex flex-col gap-space-1">
            {member.responsibilities.map((item) => (
              <li key={item} className="flex gap-space-2 text-body text-text/90">
                <span aria-hidden="true" className="text-accent">
                  →
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {member.experience ? (
        <p className="mt-auto font-mono text-[0.62rem] uppercase tracking-widest text-muted">
          {member.experience}
        </p>
      ) : null}

      <MemberLinks member={member} />

      {showBackground && member.skills.length > 0 ? (
        <details className="group/bg border-t border-hairline pt-space-2">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between font-mono text-[0.62rem] uppercase tracking-widest text-muted transition-colors hover:text-text [&::-webkit-details-marker]:hidden">
            Professional background
            <span
              aria-hidden="true"
              className="text-accent transition-transform group-open/bg:rotate-45"
            >
              +
            </span>
          </summary>
          <ul className="flex flex-wrap gap-space-1 pb-space-1 pt-space-1">
            {member.skills.map((item) => (
              <li
                key={item}
                className="rounded-full border border-hairline px-space-2 py-1 text-caption text-muted"
              >
                {item}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </article>
  );
}

/**
 * `Team` — the studio's people, side by side, joined by a "where we meet"
 * band that explains why the pairing matters to a business. Renders nothing
 * when no team member is published.
 */
export function Team({
  members,
  eyebrow = "The team",
  heading,
  description,
  overlap,
  showBackground = false,
  showStudioLink = true,
  className,
}: {
  members: readonly TeamMemberView[];
  eyebrow?: string;
  heading: string;
  description?: string;
  overlap?: TeamOverlap;
  showBackground?: boolean;
  showStudioLink?: boolean;
  className?: string;
}) {
  const headingId = "team-heading";
  if (members.length === 0) return null;

  return (
    <section
      id="team"
      aria-labelledby={headingId}
      className={cn("w-full px-space-2 py-section sm:px-space-4", className)}
    >
      <div className="mx-auto flex max-w-content flex-col gap-space-8">
        <SectionHeading
          id={headingId}
          eyebrow={eyebrow}
          heading={heading}
          description={description}
        />

        <Stagger
          as="div"
          className={cn(
            "relative grid gap-space-3",
            members.length > 1 ? "lg:grid-cols-2" : "mx-auto w-full max-w-2xl",
          )}
        >
          {members.map((member) => (
            <FadeUp key={member.id} className="h-full">
              <MemberCard member={member} showBackground={showBackground} />
            </FadeUp>
          ))}
          {members.length === 2 ? (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-accent/50 bg-bg font-display text-h3 text-accent shadow-[0_0_40px_-6px_rgba(212,175,55,0.5)] lg:flex"
            >
              +
            </div>
          ) : null}
        </Stagger>

        {overlap && overlap.body ? (
          <FadeUp>
            <div className="relative overflow-hidden rounded-2xl border border-accent/20 bg-accent/[0.045] p-space-4 sm:p-space-6">
              <div
                aria-hidden="true"
                className="programmatic-grid absolute inset-0 opacity-20"
              />
              <div className="relative grid gap-space-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-center">
                <div>
                  <p className="font-mono text-caption uppercase tracking-[0.18em] text-accent">
                    {overlap.title}
                  </p>
                  <p className="mt-space-2 max-w-2xl text-pretty text-body-lg leading-relaxed text-text/90">
                    {overlap.body}
                  </p>
                </div>
                {overlap.points.length > 0 ? (
                  <ol className="flex flex-wrap gap-space-2 lg:justify-end">
                    {overlap.points.map((point, index) => (
                      <li
                        key={point}
                        className="flex items-center gap-space-2 rounded-full border border-white/10 bg-bg/60 px-space-3 py-space-1 font-display text-body text-text"
                      >
                        <span className="font-mono text-caption text-accent">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {point}
                      </li>
                    ))}
                  </ol>
                ) : null}
              </div>
            </div>
          </FadeUp>
        ) : null}

        {showStudioLink ? (
          <div className="flex justify-center">
            <Button href="/about" variant="ghost" size="md">
              More about us →
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
