import Image from "next/image";
import { FadeUp, Stagger } from "@/components/motion";
import { Button, SectionHeading } from "@/components/ui";
import { cn } from "@/lib/utils";
import { OVERLAP, STUDIO, TEAM, type TeamMember } from "./config";

function Portrait({ member }: { member: TeamMember }) {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-white/10 bg-[#090b0e] sm:w-40 sm:shrink-0">
      {member.photo ? (
        <Image
          src={member.photo}
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
          <span className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-muted">
            Photo pending
          </span>
        </div>
      )}
    </div>
  );
}

/** One team member, written for a business reader. */
export function MemberCard({
  member,
  showBackground = false,
  className,
}: {
  member: TeamMember;
  showBackground?: boolean;
  className?: string;
}) {
  return (
    <article
      aria-labelledby={`member-${member.id}-name`}
      className={cn(
        "relative flex h-full flex-col gap-space-4 overflow-hidden rounded-2xl border bg-card p-space-3 sm:p-space-5",
        member.isPlaceholder ? "border-dashed border-accent/35" : "border-hairline",
        className,
      )}
    >
      {member.isPlaceholder ? (
        <span className="absolute right-space-3 top-space-3 rounded-full border border-accent/40 bg-accent/10 px-space-2 py-1 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-accent">
          Editable placeholder
        </span>
      ) : null}

      <div className="flex flex-col gap-space-3 sm:flex-row sm:items-end">
        <Portrait member={member} />
        <div>
          <p className="font-mono text-caption uppercase tracking-[0.18em] text-accent">
            {member.discipline}
          </p>
          <h3
            id={`member-${member.id}-name`}
            className="mt-space-1 font-display text-h3 font-semibold text-text"
          >
            {member.name}
          </h3>
          <p className="mt-space-1 text-pretty font-display text-body-lg leading-snug text-text/90">
            {member.promise}
          </p>
        </div>
      </div>

      <p className="text-pretty text-body leading-relaxed text-muted">
        {member.bio}
      </p>

      <div className="border-t border-hairline pt-space-3">
        <p className="font-mono text-[0.62rem] uppercase tracking-widest text-muted">
          Takes care of
        </p>
        <ul className="mt-space-2 flex flex-col gap-space-1">
          {member.handles.map((item) => (
            <li key={item} className="flex gap-space-2 text-body text-text/90">
              <span aria-hidden="true" className="text-accent">
                →
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-auto font-mono text-[0.62rem] uppercase tracking-widest text-muted">
        {member.experience}
      </p>

      {showBackground ? (
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
            {member.background.map((item) => (
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
 * `Team` — "Two people. One digital product team."
 *
 * Presents the two complementary roles side by side, joined by a "where we
 * meet" band that explains why the pairing matters to a business.
 */
export function Team({
  showBackground = false,
  showStudioLink = true,
  className,
}: {
  showBackground?: boolean;
  showStudioLink?: boolean;
  className?: string;
}) {
  const headingId = "team-heading";

  return (
    <section
      id="team"
      aria-labelledby={headingId}
      className={cn("w-full px-space-2 py-section sm:px-space-4", className)}
    >
      <div className="mx-auto flex max-w-content flex-col gap-space-8">
        <SectionHeading
          id={headingId}
          eyebrow="The team"
          heading={STUDIO.tagline}
          description="One of us builds the product. The other makes sure it's secure, reliable, and looked after. Together, we cover the whole journey — so you don't have to coordinate five different people."
        />

        <Stagger as="div" className="relative grid gap-space-3 lg:grid-cols-2">
          {TEAM.map((member) => (
            <FadeUp key={member.id} className="h-full">
              <MemberCard member={member} showBackground={showBackground} />
            </FadeUp>
          ))}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-accent/50 bg-bg font-display text-h3 text-accent shadow-[0_0_40px_-6px_rgba(212,175,55,0.5)] lg:flex"
          >
            +
          </div>
        </Stagger>

        <FadeUp>
          <div className="relative overflow-hidden rounded-2xl border border-accent/20 bg-accent/[0.045] p-space-4 sm:p-space-6">
            <div
              aria-hidden="true"
              className="programmatic-grid absolute inset-0 opacity-20"
            />
            <div className="relative grid gap-space-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-center">
              <div>
                <p className="font-mono text-caption uppercase tracking-[0.18em] text-accent">
                  {OVERLAP.title}
                </p>
                <p className="mt-space-2 max-w-2xl text-pretty text-body-lg leading-relaxed text-text/90">
                  {OVERLAP.body}
                </p>
              </div>
              <ol className="flex flex-wrap gap-space-2 lg:justify-end">
                {OVERLAP.points.map((point, index) => (
                  <li
                    key={point}
                    className="flex items-center gap-space-2 rounded-full border border-white/10 bg-bg/60 px-space-3 py-space-1 font-display text-body text-text"
                  >
                    <span className="font-mono text-caption text-accent">
                      0{index + 1}
                    </span>
                    {point}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </FadeUp>

        {showStudioLink ? (
          <div className="flex justify-center">
            <Button href="/about" variant="ghost" size="md">
              More about the studio →
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
