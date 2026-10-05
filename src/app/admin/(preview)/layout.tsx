import type { Metadata } from "next";
import type { ReactNode } from "react";

import { requireAdmin } from "@/lib/auth";
import { MotionProvider } from "@/components/motion";
import { ThemeBackground } from "@/components/layout";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/**
 * Preview frame: the public site's look (dark theme, motion) but behind
 * admin auth, so unpublished content can be reviewed before it goes live.
 */
export default async function PreviewLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  return (
    <MotionProvider>
      <ThemeBackground />
      {children}
    </MotionProvider>
  );
}
