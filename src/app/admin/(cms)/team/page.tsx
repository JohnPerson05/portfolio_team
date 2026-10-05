import type { Metadata } from "next";
import { Suspense } from "react";

import { listTeamMembers } from "@/server/admin/queries";
import { TeamManager } from "@/features/admin/team/TeamManager";
import { PageHeader } from "@/features/admin/ui";

export const metadata: Metadata = { title: "Team" };

export default async function AdminTeamPage() {
  const members = await listTeamMembers();
  return (
    <>
      <PageHeader
        title="Team"
        description="The people behind the studio. Drag cards to change their order on the site; unpublished members stay hidden."
      />
      <Suspense>
        <TeamManager members={members} />
      </Suspense>
    </>
  );
}
