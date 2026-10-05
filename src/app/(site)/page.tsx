import type { Metadata } from "next";
import { PageViewTracker } from "@/components/analytics";
import { HomeSections } from "@/features/home/HomeSections";
import { pageMetadata, serializeJsonLd, studioJsonLd } from "@/lib/seo";
import {
  getFeaturedProjects,
  getHomepageSections,
  getProcessSteps,
  getServices,
  getSiteSettings,
  getTeamMembers,
  getTestimonials,
  socialLinks,
} from "@/server/public/queries";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return pageMetadata({
    title: settings["seo.title"],
    description: settings["seo.description"],
    path: "/",
  });
}

/**
 * Homepage. Which sections appear, in what order, and their headings are
 * managed in the CMS (Homepage); their content comes from Projects, Team,
 * Services, Process, Testimonials, and Settings.
 */
export default async function Home() {
  const [sections, settings, team, services, steps, projects, testimonials] =
    await Promise.all([
      getHomepageSections(),
      getSiteSettings(),
      getTeamMembers(),
      getServices(),
      getProcessSteps(),
      getFeaturedProjects(),
      getTestimonials(),
    ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(studioJsonLd(settings, team)),
        }}
      />
      <PageViewTracker path="/" />
      <HomeSections
        sections={sections}
        data={{
          settings,
          social: socialLinks(settings),
          team,
          services,
          steps,
          projects,
          testimonials,
        }}
      />
    </>
  );
}
