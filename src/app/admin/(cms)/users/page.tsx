import type { Metadata } from "next";

import { requireAdmin } from "@/lib/auth";
import { listAdminUsers } from "@/server/admin/queries";
import { AdminUsers } from "@/features/admin/site/AdminUsers";
import { PageHeader } from "@/features/admin/ui";

export const metadata: Metadata = { title: "Admin users" };

export default async function AdminUsersPage() {
  const admin = await requireAdmin();
  const isSuperAdmin = admin.role === "SUPER_ADMIN";
  const users = isSuperAdmin ? await listAdminUsers() : [];
  return (
    <>
      <PageHeader
        title={isSuperAdmin ? "Admin users" : "Your account"}
        description={isSuperAdmin ? "Who can sign in to the CMS." : "Manage your sign-in."}
      />
      <AdminUsers users={users} currentUserId={admin.id} isSuperAdmin={isSuperAdmin} />
    </>
  );
}
