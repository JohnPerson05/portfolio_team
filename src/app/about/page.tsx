import type { Metadata } from "next";
import Link from "next/link";
import { FadeUp, Stagger } from "@/components/motion";
import { Button, Card, PageHero, SectionHeading } from "@/components/ui";
import { JOHN, PARTNER, STUDIO, Team } from "@/features/studio";
import { TrustStats } from "@/features/trust";
import { createPageMetadata } from "@/lib/seo";

/** Display name for a member in running copy (falls back while a placeholder). */
function who(member: typeof JOHN): string {
  return member.isPlaceholder ? member.discipline : member.firstName;
}

/** How the two roles share each stage of a project. */
const WHO_DOES_WHAT = [
  {
    stage: "Understand",
    john: "Maps your idea or process into a clear, buildable plan.",
    partner: "Spots who needs access to what, and any security or support needs early.",
  },
  {
    stage: "Shape & build",
    john: "Designs and builds the product in short, visible steps.",
    partner: "Sets up sign-in, user roles, and permissions as the product takes shape.",
  },
  {
    stage: "Launch",
    john: "Gets the product live and makes sure everything works end to end.",
    partner: "Checks access is correct, onboards your users, and keeps launch day calm.",
  },
  {
    stage: "Look after it",
    john: "Improves and extends the product as your business grows.",
    partner: "Monitors health, fixes issues at the root, and runs simple support routines.",
  },
] as const;

const PRINCIPLES = [
  {
    number: "01",
    title: "Clarity before code",
    body: "We make sure we understand the business problem — and agree what success looks like — before anything gets built.",
  },
  {
    number: "02",
    title: "Secure by default",
    body: "Who can sign in and what they can see is designed from the start, not patched on after launch.",
  },
  {
    number: "03",
    title: "Built to keep working",
    body: "Fast, reliable, and easy to change. A product is only finished when it keeps doing its job on an ordinary Tuesday.",
  },
] as const;

export const metadata: Metadata = createPageMetadata({
  title: "The Studio",
  description: `${STUDIO.name} is a two-person digital product team: one of us builds the product, the other keeps it secure, reliable, and supported.`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageHero
        index="00"
        eyebrow="The studio"
        title={STUDIO.tagline}
        description="We're a deliberately small studio. One of us turns ideas into working products; the other makes sure they're secure, reliable, and looked after once real people start using them. You work directly with both of us — from first conversation to long after launch."
        status="Taking on new projects"
      />

      <Team showBackground showStudioLink={false} />

      <section className="border-t border-hairline bg-bg-secondary px-space-2 py-section sm:px-space-4">
        <div className="mx-auto max-w-content">
          <SectionHeading
            eyebrow="Who does what"
            heading="Two roles, every stage covered."
            description="Here's how the work is shared on a typical project — so you always know who to talk to."
          />

          <div className="mt-space-8 overflow-hidden rounded-2xl border border-hairline">
            <div className="hidden grid-cols-[10rem_minmax(0,1fr)_minmax(0,1fr)] border-b border-hairline bg-card md:grid">
              <span className="p-space-3 font-mono text-[0.62rem] uppercase tracking-widest text-muted">
                Stage
              </span>
              <span className="border-l border-hairline p-space-3 font-mono text-[0.62rem] uppercase tracking-widest text-accent">
                {who(JOHN)} · {JOHN.discipline}
              </span>
              <span className="border-l border-hairline p-space-3 font-mono text-[0.62rem] uppercase tracking-widest text-accent">
                {who(PARTNER)} · {PARTNER.discipline}
              </span>
            </div>
            <Stagger as="ol">
              {WHO_DOES_WHAT.map((row, index) => (
                <FadeUp
                  as="li"
                  key={row.stage}
                  className="grid list-none border-b border-hairline last:border-b-0 md:grid-cols-[10rem_minmax(0,1fr)_minmax(0,1fr)]"
                >
                  <div className="flex items-baseline gap-space-2 p-space-3">
                    <span className="font-mono text-caption text-accent">
                      0{index + 1}
                    </span>
                    <span className="font-display text-body-lg font-semibold text-text">
                      {row.stage}
                    </span>
                  </div>
                  <div className="px-space-3 pb-space-2 md:border-l md:border-hairline md:py-space-3">
                    <span className="font-mono text-[0.58rem] uppercase tracking-widest text-muted md:hidden">
                      {who(JOHN)}
                    </span>
                    <p className="text-pretty text-body text-muted">{row.john}</p>
                  </div>
                  <div className="px-space-3 pb-space-3 md:border-l md:border-hairline md:py-space-3">
                    <span className="font-mono text-[0.58rem] uppercase tracking-widest text-muted md:hidden">
                      {who(PARTNER)}
                    </span>
                    <p className="text-pretty text-body text-muted">{row.partner}</p>
                  </div>
                </FadeUp>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      <TrustStats showDetailLink={false} className="bg-transparent" />

      <section className="border-t border-hairline px-space-2 py-section sm:px-space-4">
        <div className="mx-auto max-w-content">
          <SectionHeading
            eyebrow="How we think"
            heading="Three principles we don't compromise on"
          />
          <Stagger as="ul" className="mt-space-8 grid gap-space-3 md:grid-cols-3">
            {PRINCIPLES.map((principle) => (
              <FadeUp as="li" key={principle.number} className="h-full list-none">
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

          <p className="mt-space-6 text-pretty text-caption text-muted">
            Want the technical detail?{" "}
            <Link href="/skills" className="text-accent underline-offset-4 hover:underline">
              See the toolkit
            </Link>{" "}
            or{" "}
            <Link href="/experience" className="text-accent underline-offset-4 hover:underline">
              John&apos;s enterprise background
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="border-t border-hairline px-space-2 py-section sm:px-space-4">
        <FadeUp className="mx-auto max-w-content">
          <div className="relative overflow-hidden rounded-2xl border border-accent/20 bg-accent/[0.045] p-space-5 sm:p-space-8">
            <div
              aria-hidden="true"
              className="programmatic-grid absolute inset-0 opacity-20"
            />
            <div className="relative flex flex-col gap-space-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="font-mono text-caption uppercase tracking-widest text-accent">
                  Work with us
                </span>
                <h2 className="mt-space-2 max-w-3xl text-balance font-display text-h2 font-semibold text-text">
                  Have an idea, or a process that&apos;s holding your business back?
                </h2>
                <p className="mt-space-3 max-w-2xl text-pretty text-body leading-relaxed text-muted">
                  Tell us about it in plain language. We&apos;ll come back with
                  honest thoughts on what to build first — and what not to
                  build at all.
                </p>
              </div>
              <Button href="/contact" variant="primary" size="lg">
                Start a project
              </Button>
            </div>
          </div>
        </FadeUp>
      </section>
    </>
  );
}
