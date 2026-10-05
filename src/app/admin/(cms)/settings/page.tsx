import type { Metadata } from "next";

import { getSettingsForEdit } from "@/server/admin/queries";
import { SETTING_DEFINITIONS, SETTING_GROUPS } from "@/server/settings/registry";
import { SettingsForm } from "@/features/admin/site/SettingsForm";
import { PageHeader } from "@/features/admin/ui";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const { values, updatedAt } = await getSettingsForEdit();
  return (
    <>
      <PageHeader
        title="Settings"
        description="Studio name, hero copy, homepage content, contact and social links, and default SEO — all without touching code."
      />
      <SettingsForm definitions={SETTING_DEFINITIONS} groups={SETTING_GROUPS} initial={values} updatedAt={updatedAt} />
    </>
  );
}
