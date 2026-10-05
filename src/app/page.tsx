import type { Metadata } from "next";
import { PageViewTracker } from "@/components/analytics";
import { CapabilityTicker, Hero } from "@/features/hero";
import { Team, Services, WhyUs } from "@/features/studio";
import { ScrollScene } from "@/features/scroll-scene";
import { TrustStats } from "@/features/trust";
import { FeaturedProjects } from "@/features/projects";
import { Testimonials } from "@/features/testimonials";
import { ContactForm } from "@/features/contact";
import {
  createPageMetadata,
  serializeJsonLd,
  siteConfig,
  studioJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: siteConfig.title,
  description: siteConfig.description,
  path: "/",
});

/**
 * Homepage — the two-person studio story, told for business owners.
 *
 * Order answers a founder's questions top to bottom:
 *   1. Who are you and what do you do?      → Hero (studio statement + duo)
 *   2. What kinds of things do you build?   → Outcome ticker
 *   3. Who exactly will I work with?        → Team (two complementary roles)
 *   4. Can you help with *my* problem?      → Services (problem → what we do)
 *   5. What is it like to work with you?    → Process (scroll scene)
 *   6. Have you done this before?           → Selected work (case studies)
 *   7. Why should I trust a small team?     → Numbers + Why us
 *   8. What do others say?                  → References
 *   9. How do we start?                     → Contact
 *
 * Technical detail deliberately lives off the homepage (Studio page details,
 * /skills, /experience) so it never dominates the first impression.
 *
 * The root layout owns `<main>`, navbar/footer, and motion providers.
 */
export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(studioJsonLd()) }}
      />
      <PageViewTracker path="/" />

      <Hero />
      <CapabilityTicker />
      <Team />
      <Services />
      <ScrollScene />
      <FeaturedProjects />
      <TrustStats />
      <WhyUs />
      <Testimonials />
      <ContactForm />
    </>
  );
}
