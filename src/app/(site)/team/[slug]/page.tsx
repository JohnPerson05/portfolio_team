import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MemberProfile } from "@/features/studio";
import { pageMetadata } from "@/lib/seo";
import { getTeamMemberBySlug, getTeamMembers } from "@/server/public/queries";

interface TeamMemberPageProps {
  params: Promise<{ slug: string }>;
}

/** Prebuild every published member; new ones render on first request. */
export async function generateStaticParams() {
  try {
    const members = await getTeamMembers();
    return members.map((member) => ({ slug: member.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: TeamMemberPageProps): Promise<Metadata> {
  const { slug } = await params;
  const member = await getTeamMemberBySlug(slug);
  if (!member) return {};

  return pageMetadata({
    title: `${member.name} — ${member.role}`,
    description: member.shortBio ?? member.bio ?? member.role,
    path: `/team/${member.slug}`,
    image: member.profileImage,
  });
}

export default async function TeamMemberPage({ params }: TeamMemberPageProps) {
  const { slug } = await params;
  const member = await getTeamMemberBySlug(slug);
  if (!member) notFound();

  return <MemberProfile member={member} />;
}
