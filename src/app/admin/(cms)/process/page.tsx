import type { Metadata } from "next";

import { listProcessSteps } from "@/server/admin/queries";
import { ProcessManager } from "@/features/admin/content/ProcessManager";
import { PageHeader } from "@/features/admin/ui";

export const metadata: Metadata = { title: "Process" };

export default async function AdminProcessPage() {
  const steps = await listProcessSteps();
  return (
    <>
      <PageHeader
        title="Process"
        description="The steps of working with you — they animate in the “How we work” section as visitors scroll. Numbers follow the order."
      />
      <ProcessManager steps={steps} />
    </>
  );
}
