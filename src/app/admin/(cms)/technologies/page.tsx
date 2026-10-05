import type { Metadata } from "next";

import { listTechnologies } from "@/server/admin/queries";
import { TechnologiesManager } from "@/features/admin/content/TechnologiesManager";
import { PageHeader } from "@/features/admin/ui";

export const metadata: Metadata = { title: "Technologies" };

export default async function AdminTechnologiesPage() {
  const technologies = await listTechnologies();
  return (
    <>
      <PageHeader
        title="Technologies"
        description="The tools you tag on projects. Inactive technologies stay linked but are hidden on the public site."
      />
      <TechnologiesManager technologies={technologies} />
    </>
  );
}
