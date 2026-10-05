import type { Metadata } from "next";
import type { ReactNode } from "react";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/features/admin/AdminShell";
import { getSiteSettings } from "@/server/public/queries";

export const metadata: Metadata = {
  title: { default: "CMS", template: "%s · CMS" },
  robots: { index: false, follow: false },
};

/** Admin pages read live data on every request; never cache them. */
export const dynamic = "force-dynamic";

/**
 * Guarded CMS shell. `src/proxy.ts` already rejects requests without a signed
 * session cookie; this layout re-verifies against the database (deactivated
 * admins are logged out immediately), and every Server Action checks again.
 */
export default async function CmsLayout({ children }: Readonly<{ children: ReactNode }>) {
  const admin = await requireAdmin();
  const [settings, unreadInquiries] = await Promise.all([
    getSiteSettings(),
    prisma.contactSubmission.count({ where: { readAt: null } }).catch(() => 0),
  ]);

  return (
    <div className="admin-root">
      <AdminShell
        admin={{ name: admin.name, email: admin.email, role: admin.role }}
        studioName={settings["studio.name"]}
        unreadInquiries={unreadInquiries}
      >
        {children}
      </AdminShell>
    </div>
  );
}
