import type { Metadata } from "next";
import { Button, EmptyState, PageHero } from "@/components/ui";
import { FadeUp } from "@/components/motion";
import { ScrollScene } from "@/features/scroll-scene/ProcessScene";
import { Services } from "@/features/studio";
import { pageMetadata } from "@/lib/seo";
import {
  getProcessSteps,
  getSectionCopy,
  getServices,
  getSiteSettings,
} from "@/server/public/queries";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Services",
    description:
      "What we help businesses with — from launching a first version to replacing spreadsheets, customer portals, secure access, and ongoing care.",
    path: "/services",
  });
}

export default async function ServicesPage() {
  const [services, steps, servicesCopy, processCopy, settings] = await Promise.all([
    getServices(),
    getProcessSteps(),
    getSectionCopy("services"),
    getSectionCopy("process"),
    getSiteSettings(),
  ]);

  return (
    <>
      <PageHero
        index="02"
        eyebrow={servicesCopy?.eyebrow ?? "Services"}
        title={servicesCopy?.title ?? "What we help with"}
        description={
          servicesCopy?.description ??
          "Tell us what's slowing you down — we'll handle the rest."
        }
        status="Available for select projects"
      />

      {services.length > 0 ? (
        <Services
          services={services}
          eyebrow="How we can help"
          heading="Pick the problem that sounds familiar."
          className="border-t-0 bg-transparent"
        />
      ) : (
        <section className="px-space-2 py-section sm:px-space-4">
          <div className="mx-auto max-w-content">
            <EmptyState
              title="Services coming soon"
              description="We're writing these up. In the meantime, tell us what you need."
            />
          </div>
        </section>
      )}

      <ScrollScene
        steps={steps}
        eyebrow={processCopy?.eyebrow}
        heading={processCopy?.title ?? "How we work"}
        coverImage={settings["home.processCover"]}
      />

      <section className="px-space-2 py-section sm:px-space-4">
        <FadeUp className="mx-auto flex max-w-content flex-col items-center gap-space-4 text-center">
          <h2 className="max-w-2xl text-balance font-display text-h2 font-semibold text-text">
            Not sure which one fits?
          </h2>
          <p className="max-w-xl text-pretty text-body-lg text-muted">
            Describe the problem in plain language. We&apos;ll tell you honestly what we&apos;d build first.
          </p>
          <Button href={settings["cta.url"]} variant="primary" size="lg">
            {settings["cta.text"]} →
          </Button>
        </FadeUp>
      </section>
    </>
  );
}
