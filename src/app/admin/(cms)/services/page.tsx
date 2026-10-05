import type { Metadata } from "next";
import { Suspense } from "react";

import { listServices } from "@/server/admin/queries";
import { ServicesManager } from "@/features/admin/content/ServicesManager";
import { PageHeader } from "@/features/admin/ui";

export const metadata: Metadata = { title: "Services" };

export default async function AdminServicesPage() {
  const services = await listServices();
  return (
    <>
      <PageHeader
        title="Services"
        description="What you help businesses with. Shown on the homepage and /services. Drag to reorder; toggle to show or hide."
      />
      <Suspense>
        <ServicesManager services={services} />
      </Suspense>
    </>
  );
}
