import type { Metadata } from "next";

import { listHomepageSectionsForEdit } from "@/server/admin/queries";
import { HomepageEditor } from "@/features/admin/site/HomepageEditor";
import { PageHeader } from "@/features/admin/ui";

export const metadata: Metadata = { title: "Homepage" };

export default async function AdminHomepagePage() {
  const sections = await listHomepageSectionsForEdit();
  return (
    <>
      <PageHeader
        title="Homepage"
        description="Choose which sections appear on the homepage, in what order, and what their headings say."
      />
      <HomepageEditor initial={sections} />
    </>
  );
}
