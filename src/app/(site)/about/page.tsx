import type { Metadata } from "next";
import Link from "next/link";
import { FadeUp, Stagger } from "@/components/motion";
import { Button, Card, PageHero, SectionHeading } from "@/components/ui";
import { Team } from "@/features/studio";
import { TrustStats, toTrustStats } from "@/features/trust";
import { pageMetadata } from "@/lib/seo";
import {
  getSectionCopy,
  getSiteSettings,
  getTeamMembers,
} from "@/server/public/queries";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return pageMetadata({
    title: "The Studio",
    description: settings["studio.description"],
    path: "/about",
  });
}

export default async function AboutPage() {
  const [settings, team, teamCopy] = await Promise.all([
    getSiteSettings(),
    getTeamMembers(),
    getSectionCopy("team"),
  ]);
  const principles = settings["about.principles"];

  return (
    <>
      <PageHero
        index="00"
        eyebrow="The studio"
        title={settings["studio.tagline"]}
        description={settings["about.intro"]}
        status={settings["hero.availability"]}
      />

      <Team
        members={team}
        eyebrow={teamCopy?.eyebrow}
        heading={teamCopy?.title ?? "The team"}
        description={teamCopy?.description}
        overlap={{
          title: settings["home.overlapTitle"],
          body: settings["home.overlapBody"],
          points: settings["home.overlapPoints"],
        }}
        showBackground
        showStudioLink={false}
      />

      {settings["home.stats"].length > 0 ? (
        <TrustStats
          stats={toTrustStats(settings["home.stats"])}
          showDetailLink={false}
          className="bg-transparent"
        />
      ) : null}

      {principles.length > 0 ? (
        <section className="border-t border-hairline px-space-2 py-section sm:px-space-4">
          <div className="mx-auto max-w-content">
            <SectionHeading
              eyebrow="How we think"
              heading="Principles we don't compromise on"
            />
            <Stagger as="ul" className="mt-space-8 grid gap-space-3 md:grid-cols-3">
              {principles.map((principle, index) => (
                <FadeUp as="li" key={`${principle.title}-${index}`} className="h-full list-none">
                  <Card className="h-full p-space-4">
                    <span className="font-mono text-caption text-accent">
                      {String(index + 1).padStart(2, "0")}
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
                our enterprise background
              </Link>
              .
            </p>
          </div>
        </section>
      ) : null}

      <section className="border-t border-hairline px-space-2 py-section sm:px-space-4">
        <FadeUp className="mx-auto max-w-content">
          <div className="relative overflow-hidden rounded-2xl border border-accent/20 bg-accent/[0.045] p-space-5 sm:p-space-8">
            <div aria-hidden="true" className="programmatic-grid absolute inset-0 opacity-20" />
            <div className="relative flex flex-col gap-space-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="font-mono text-caption uppercase tracking-widest text-accent">
                  Work with us
                </span>
                <h2 className="mt-space-2 max-w-3xl text-balance font-display text-h2 font-semibold text-text">
                  {settings["about.ctaTitle"]}
                </h2>
                <p className="mt-space-3 max-w-2xl text-pretty text-body leading-relaxed text-muted">
                  {settings["about.ctaBody"]}
                </p>
              </div>
              <Button href={settings["cta.url"]} variant="primary" size="lg">
                {settings["cta.text"]}
              </Button>
            </div>
          </div>
        </FadeUp>
      </section>
    </>
  );
}
