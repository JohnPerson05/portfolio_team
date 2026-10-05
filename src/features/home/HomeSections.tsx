import type { ReactNode } from "react";

import { CapabilityTicker, Hero } from "@/features/hero";
import { heroContentFromSettings } from "@/features/hero/config";
import { Services, Team, WhyUs } from "@/features/studio";
import { ScrollScene } from "@/features/scroll-scene";
import { TrustStats, toTrustStats } from "@/features/trust";
import { FeaturedProjects } from "@/features/projects";
import { Testimonials } from "@/features/testimonials";
import { ContactForm } from "@/features/contact";
import type { SiteSettings } from "@/server/settings/registry";
import type {
  HomepageSectionView,
  NavLinkView,
  ProcessStepView,
  ProjectView,
  ServiceView,
  TeamMemberView,
  TestimonialView,
} from "@/types";

export interface HomeData {
  settings: SiteSettings;
  social: NavLinkView[];
  team: TeamMemberView[];
  services: ServiceView[];
  steps: ProcessStepView[];
  projects: ProjectView[];
  testimonials: TestimonialView[];
}

type Renderer = (section: HomepageSectionView, data: HomeData) => ReactNode;

/**
 * One renderer per homepage section key. The CMS (Homepage) controls which
 * sections are enabled, their order, and their eyebrow/title/description;
 * sections with no published content render nothing.
 */
const RENDERERS: Record<string, Renderer> = {
  hero: (_s, d) => {
    const content = heroContentFromSettings(d.settings, d.social);
    // Featured members first, then the rest, in display order.
    const heroMembers = [
      ...d.team.filter((m) => m.isFeatured),
      ...d.team.filter((m) => !m.isFeatured),
    ].slice(0, 2);
    return <Hero {...content} members={heroMembers} />;
  },
  ticker: (_s, d) => <CapabilityTicker items={d.settings["home.tickerItems"]} />,
  team: (s, d) => (
    <Team
      members={d.team}
      eyebrow={s.eyebrow}
      heading={s.title ?? d.settings["studio.tagline"]}
      description={s.description}
      overlap={{
        title: d.settings["home.overlapTitle"],
        body: d.settings["home.overlapBody"],
        points: d.settings["home.overlapPoints"],
      }}
    />
  ),
  services: (s, d) => (
    <Services
      services={d.services}
      eyebrow={s.eyebrow}
      heading={s.title ?? "What we help with"}
      description={s.description}
      showAllLink
    />
  ),
  process: (s, d) => (
    <ScrollScene
      steps={d.steps}
      eyebrow={s.eyebrow}
      heading={s.title ?? "How we work"}
      coverImage={d.settings["home.processCover"]}
    />
  ),
  work: (s, d) => (
    <FeaturedProjects
      projects={d.projects}
      eyebrow={s.eyebrow}
      heading={s.title}
      description={s.description}
    />
  ),
  stats: (s, d) =>
    d.settings["home.stats"].length > 0 ? (
      <TrustStats
        stats={toTrustStats(d.settings["home.stats"])}
        eyebrow={s.eyebrow}
        heading={s.title}
      />
    ) : null,
  "why-us": (s, d) => (
    <WhyUs
      reasons={d.settings["home.whyUsReasons"]}
      eyebrow={s.eyebrow}
      heading={s.title ?? "Why work with us"}
      cta={{ label: d.settings["cta.text"], href: d.settings["cta.url"] }}
    />
  ),
  // Only real, published testimonials — the section disappears when there are none.
  testimonials: (s, d) =>
    d.testimonials.length > 0 ? (
      <Testimonials
        testimonials={d.testimonials}
        eyebrow={s.eyebrow}
        heading={s.title}
        description={s.description}
      />
    ) : null,
  contact: (s) => (
    <ContactForm eyebrow={s.eyebrow} heading={s.title} description={s.description} />
  ),
};

export function HomeSections({
  sections,
  data,
}: {
  sections: readonly HomepageSectionView[];
  data: HomeData;
}) {
  return (
    <>
      {sections.map((section) => {
        const render = RENDERERS[section.key];
        return render ? <SectionSlot key={section.key}>{render(section, data)}</SectionSlot> : null;
      })}
    </>
  );
}

function SectionSlot({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
