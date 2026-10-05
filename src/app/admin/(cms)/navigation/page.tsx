import type { Metadata } from "next";

import { listNavigationForEdit } from "@/server/admin/queries";
import { NavigationEditor } from "@/features/admin/site/NavigationEditor";
import { PageHeader } from "@/features/admin/ui";

export const metadata: Metadata = { title: "Navigation" };

export default async function AdminNavigationPage() {
  const items = await listNavigationForEdit();
  return (
    <>
      <PageHeader
        title="Navigation"
        description="Links in the site header and footer. The “Start a project” button is set in Settings → Contact & social."
      />
      <NavigationEditor initial={items} />
    </>
  );
}
