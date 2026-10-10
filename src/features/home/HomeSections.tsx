import type { ReactNode } from "react";

import { CapabilityTicker, Hero } from "@/features/hero";
import { ScrollScene } from "@/features/scroll-scene";
import {
  LEYAHN_SCENE_CHAPTERS,
  LEYAHN_SCENE_COVER,
  LEYAHN_SCENE_EYEBROW,
  LEYAHN_SCENE_HEADING,
  LEYAHN_SCENE_PROFILE,
} from "@/features/scroll-scene/config";
import { TrustStats, toTrustStats } from "@/features/trust";
import { FeaturedProjects } from "@/features/projects";
import { Skills } from "@/features/skills";
import { Timeline } from "@/features/experience";
import { Testimonials } from "@/features/testimonials";
import { BlogPreview } from "@/features/blog";
import { ContactForm } from "@/features/contact";
import { Services, Team, WhyUs } from "@/features/studio";
import { ScrollScene as ProcessScene } from "@/features/scroll-scene/ProcessScene";
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

/** Members shown in the hero: the featured ones, or everyone if none are. */
function heroTeam(team: readonly TeamMemberView[]): TeamMemberView[] {
  const featured = team.filter((member) => member.isFeatured);
  return featured.length > 0 ? featured : [...team];
}

/**
 * One renderer per homepage section key. Defaults reproduce the original
 * portfolio homepage (plus Team); the CMS (Homepage) controls which sections
 * are enabled, their order, and their headings.
 */
const RENDERERS: Record<string, Renderer> = {
  hero: (_s, d) => (
    <Hero
      name={d.settings["hero.name"]}
      role={d.settings["hero.role"]}
      valueProposition={d.settings["hero.subtitle"]}
      avatarUrl={d.settings["hero.portrait"]}
      coverUrl={d.settings["hero.cover"]}
      links={d.social}
      team={heroTeam(d.team)}
    />
  ),
  craft: (_s, d) => (
    <>
      <ScrollScene
        eyebrow={d.settings["craft.eyebrow"]}
        heading={d.settings["craft.heading"]}
        chapters={d.settings["craft.chapters"]}
        coverImage={d.settings["hero.cover"]}
        profileImage={d.settings["hero.portrait"]}
        profileAlt={`${d.team[0]?.name ?? d.settings["hero.name"]} portrait`}
      />
      {/* Leyahn's scene mirrors John's: media on the left, copy on the right. */}
      <ScrollScene
        id="craft-leyahn"
        mirrored
        eyebrow={LEYAHN_SCENE_EYEBROW}
        heading={LEYAHN_SCENE_HEADING}
        chapters={LEYAHN_SCENE_CHAPTERS}
        coverImage={LEYAHN_SCENE_COVER}
        profileImage={LEYAHN_SCENE_PROFILE}
        profileAlt="Leyahn Mallorca portrait"
      />
    </>
  ),
  ticker: (_s, d) => <CapabilityTicker items={d.settings["home.tickerItems"]} />,
  stats: (s, d) =>
    d.settings["home.stats"].length > 0 ? (
      <TrustStats stats={toTrustStats(d.settings["home.stats"])} eyebrow={s.eyebrow} heading={s.title} />
    ) : null,
  team: (s, d) => (
    <Team
      members={d.team}
      eyebrow={s.eyebrow}
      heading={s.title ?? "The team"}
      description={s.description}
      showBackground
    />
  ),
  work: (s, d) => <FeaturedProjects projects={d.projects} eyebrow={s.eyebrow} heading={s.title} />,
  skills: () => <Skills compact />,
  experience: () => <Timeline />,
  testimonials: (s, d) => (
    <Testimonials testimonials={d.testimonials} eyebrow={s.eyebrow} heading={s.title} />
  ),
  blog: () => <BlogPreview />,
  contact: () => <ContactForm />,

  // Optional sections (disabled by default).
  services: (s, d) => (
    <Services services={d.services} eyebrow={s.eyebrow} heading={s.title ?? "Services"} description={s.description} />
  ),
  process: (s, d) => (
    <ProcessScene
      steps={d.steps}
      eyebrow={s.eyebrow}
      heading={s.title ?? "How we work"}
      coverImage={d.settings["home.processCover"]}
    />
  ),
  "why-us": (s, d) => (
    <WhyUs
      reasons={d.settings["home.whyUsReasons"]}
      eyebrow={s.eyebrow}
      heading={s.title ?? "Why work with us"}
      cta={{ label: d.settings["cta.text"], href: d.settings["cta.url"] }}
    />
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
        return render ? <Slot key={section.key}>{render(section, data)}</Slot> : null;
      })}
    </>
  );
}

function Slot({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
