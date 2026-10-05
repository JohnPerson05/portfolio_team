import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";

import { getCurrentAdmin } from "@/lib/auth";
import { LoginForm } from "@/features/admin";
import { getSiteSettings } from "@/server/public/queries";

export const metadata: Metadata = {
  title: "Sign in · CMS",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * CMS sign-in. A sibling of the `(cms)` route group, so it is never wrapped
 * by the guarded layout (no redirect loop). Signed-in admins skip straight to
 * the dashboard.
 */
export default async function AdminLoginPage() {
  if (await getCurrentAdmin()) redirect("/admin");
  const settings = await getSiteSettings();

  return (
    <div className="admin-root grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <aside className="relative hidden overflow-hidden bg-zinc-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:44px_44px]"
        />
        <div aria-hidden="true" className="absolute -left-24 top-1/3 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm font-bold text-zinc-950">
            1<span className="text-amber-500">+</span>1
          </span>
          <span className="text-sm font-semibold">{settings["studio.name"]}</span>
        </div>
        <div className="relative max-w-md">
          <p className="text-3xl font-semibold leading-tight tracking-tight">
            Manage the story here.
            <br />
            <span className="text-zinc-400">The portfolio tells it publicly.</span>
          </p>
          <ul className="mt-8 flex flex-col gap-3 text-sm text-zinc-300">
            {["Add a project, upload visuals, publish in minutes", "Preview anything before it goes live", "Every change is logged"].map((line) => (
              <li key={line} className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-amber-300">✓</span>
                {line}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-zinc-500">Portfolio CMS · private area</p>
      </aside>

      <main className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-sm font-bold text-white">
              1<span className="text-amber-400">+</span>1
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Sign in</h1>
          <p className="mt-1.5 text-sm text-zinc-500">Welcome back. Sign in to manage {settings["studio.name"]}.</p>
          <div className="mt-8">
            <Suspense>
              <LoginForm />
            </Suspense>
          </div>
          <p className="mt-10 text-center text-xs text-zinc-400">
            <a href="/" className="hover:text-zinc-700">
              ← Back to the website
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
