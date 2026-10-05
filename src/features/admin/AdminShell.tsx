"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { logout } from "@/actions/auth";
import { cn } from "@/lib/utils";
import { Icon } from "./ui/icons";
import { AdminFeedbackProvider } from "./ui/feedback";

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  exact?: boolean;
  badge?: number;
  superOnly?: boolean;
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

function buildNav(unreadInquiries: number): NavGroup[] {
  return [
    { items: [{ label: "Dashboard", href: "/admin", icon: <Icon.Dashboard />, exact: true }] },
    {
      label: "Content",
      items: [
        { label: "Projects", href: "/admin/projects", icon: <Icon.Projects /> },
        { label: "Team", href: "/admin/team", icon: <Icon.Team /> },
        { label: "Services", href: "/admin/services", icon: <Icon.Services /> },
        { label: "Process", href: "/admin/process", icon: <Icon.Process /> },
        { label: "Testimonials", href: "/admin/testimonials", icon: <Icon.Quote /> },
        { label: "Technologies", href: "/admin/technologies", icon: <Icon.Code /> },
        { label: "Blog", href: "/admin/blog", icon: <Icon.Pen /> },
      ],
    },
    {
      label: "Site",
      items: [
        { label: "Homepage", href: "/admin/homepage", icon: <Icon.Home /> },
        { label: "Navigation", href: "/admin/navigation", icon: <Icon.Nav /> },
        { label: "Settings", href: "/admin/settings", icon: <Icon.Settings /> },
        { label: "Media", href: "/admin/media", icon: <Icon.Image /> },
        { label: "Inquiries", href: "/admin/contacts", icon: <Icon.Inbox />, badge: unreadInquiries },
      ],
    },
    {
      label: "System",
      items: [
        { label: "Admin users", href: "/admin/users", icon: <Icon.Users />, superOnly: true },
        { label: "Activity", href: "/admin/activity", icon: <Icon.Activity /> },
      ],
    },
  ];
}

export interface AdminShellProps {
  admin: { name: string; email: string; role: "SUPER_ADMIN" | "EDITOR" };
  studioName: string;
  unreadInquiries: number;
  children: ReactNode;
}

function Sidebar({
  admin,
  studioName,
  unreadInquiries,
  onNavigate,
}: Omit<AdminShellProps, "children"> & { onNavigate?: () => void }) {
  const pathname = usePathname() ?? "";
  const [loggingOut, startLogout] = useTransition();
  const groups = buildNav(unreadInquiries);

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2.5 border-b border-zinc-200 px-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-[11px] font-bold text-white">
          1<span className="text-amber-400">+</span>1
        </span>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[13px] font-semibold text-zinc-900">{studioName}</p>
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Portfolio CMS</p>
        </div>
      </div>

      <nav aria-label="CMS" className="flex-1 overflow-y-auto px-2 py-3">
        {groups.map((group, gi) => {
          const items = group.items.filter((item) => !item.superOnly || admin.role === "SUPER_ADMIN");
          if (items.length === 0) return null;
          return (
            <div key={group.label ?? gi} className="mb-4">
              {group.label ? (
                <p className="mb-1 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  {group.label}
                </p>
              ) : null}
              <ul className="flex flex-col gap-0.5">
                {items.map((item) => {
                  const active = isActive(item);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900",
                          active ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
                        )}
                      >
                        <span className={active ? "text-white" : "text-zinc-400"}>{item.icon}</span>
                        <span className="flex-1">{item.label}</span>
                        {item.badge ? (
                          <span
                            className={cn(
                              "rounded-full px-1.5 text-[11px] font-semibold",
                              active ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800",
                            )}
                          >
                            {item.badge}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-zinc-200 p-2">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
        >
          <span className="text-zinc-400"><Icon.External /></span>
          View live site
        </a>
        <div className="mt-2 flex items-center gap-2.5 rounded-md px-2.5 py-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-700">
            {admin.name.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[13px] font-medium text-zinc-900">{admin.name}</p>
            <p className="truncate text-[11px] text-zinc-500">{admin.role === "SUPER_ADMIN" ? "Super admin" : "Editor"}</p>
          </div>
          <button
            type="button"
            onClick={() => startLogout(async () => {
              await logout();
              window.location.assign("/admin/login");
            })}
            disabled={loggingOut}
            aria-label="Log out"
            title="Log out"
            className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50"
          >
            <Icon.Logout />
          </button>
        </div>
      </div>
    </div>
  );
}

/** CMS frame: fixed sidebar on desktop, slide-over drawer on mobile. */
export function AdminShell({ children, ...props }: AdminShellProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <AdminFeedbackProvider>
      <a
        href="#admin-main"
        className="sr-only z-50 rounded-md bg-white px-3 py-2 text-sm focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-zinc-200 bg-white lg:block">
        <Sidebar {...props} />
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-zinc-200 bg-white/90 px-3 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center rounded-md text-zinc-700 hover:bg-zinc-100"
        >
          <Icon.Menu size={18} />
        </button>
        <p className="truncate text-sm font-semibold text-zinc-900">{props.studioName} · CMS</p>
      </div>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-zinc-950/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-xl">
            <Sidebar {...props} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}

      <main id="admin-main" className="lg:pl-60">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </AdminFeedbackProvider>
  );
}
