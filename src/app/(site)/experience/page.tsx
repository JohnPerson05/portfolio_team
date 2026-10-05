import type { Metadata } from "next";
import { PageHero } from "@/components/ui";
import { Timeline } from "@/features/experience";
import { Team } from "@/features/studio";
import { createPageMetadata } from "@/lib/seo";
import { getTeamMembers } from "@/server/public/queries";

export const metadata: Metadata = createPageMetadata({
  title: "Experience",
  description:
    "11+ years of combined experience across enterprise engineering, Identity & Access Management, and IT operations.",
  path: "/experience",
});

export default async function ExperiencePage() {
  const team = await getTeamMembers();
  return (
    <>
      <PageHero
        index="03"
        eyebrow="Experience"
        title="11+ years of combined enterprise experience."
        description="Banking, insurance, live-meeting, and enterprise web applications on the engineering side—Identity & Access Management, IT operations, and enterprise technology support on the operations side."
      />
      <Team
        members={team}
        eyebrow="Who brings what"
        heading="Two backgrounds, one delivery team"
        showBackground
        showStudioLink={false}
      />
      <Timeline
        eyebrow="Engineering career log"
        heading="From complex brief to shipped result"
        showDetailLink={false}
        className="bg-transparent"
      />
    </>
  );
}
