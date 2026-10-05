import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getCurrentAdmin } from "@/lib/auth";
import { imageSource } from "@/lib/images";
import { getDashboardData } from "@/server/admin/queries";
import {
  AdminLinkButton,
  Icon,
  PageHeader,
  Panel,
  StatusBadge,
  timeAgo,
} from "@/features/admin/ui";

export const metadata: Metadata = { title: "Dashboard" };

function StatCard({
  label,
  value,
  detail,
  href,
  icon,
}: {
  label: string;
  value: number;
  detail: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:border-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
    >
      <div className="flex items-center justify-between text-zinc-400">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{label}</span>
        <span className="transition-colors group-hover:text-zinc-700">{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-zinc-900">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{detail}</p>
    </Link>
  );
}

export default async function DashboardPage() {
  const [data, admin] = await Promise.all([getDashboardData(), getCurrentAdmin()]);
  const firstName = admin?.name.split(" ")[0] ?? "there";

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here's the state of your portfolio."
        actions={
          <>
            <AdminLinkButton href="/" external>
              <Icon.External size={14} /> View site
            </AdminLinkButton>
            <AdminLinkButton href="/admin/projects/new" variant="primary">
              <Icon.Plus size={14} /> Add project
            </AdminLinkButton>
          </>
        }
      />

      <section aria-label="Portfolio overview" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Projects"
          value={data.projects.total}
          detail={`${data.projects.published} published · ${data.projects.drafts} draft${data.projects.drafts === 1 ? "" : "s"}`}
          href="/admin/projects"
          icon={<Icon.Projects />}
        />
        <StatCard
          label="Team members"
          value={data.team.total}
          detail={`${data.team.published} on the site`}
          href="/admin/team"
          icon={<Icon.Team />}
        />
        <StatCard
          label="Services"
          value={data.services.total}
          detail={`${data.services.published} published`}
          href="/admin/services"
          icon={<Icon.Services />}
        />
        <StatCard
          label="Testimonials"
          value={data.testimonials.total}
          detail={`${data.testimonials.published} published`}
          href="/admin/testimonials"
          icon={<Icon.Quote />}
        />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Panel
          title="Recent projects"
          actions={
            <Link href="/admin/projects" className="text-[13px] font-medium text-zinc-500 hover:text-zinc-900">
              View all
            </Link>
          }
          bodyClassName="p-0 sm:p-0"
        >
          {data.recentProjects.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm font-medium text-zinc-900">No projects yet.</p>
              <p className="mt-1 text-sm text-zinc-500">Start building your portfolio by adding your first project.</p>
              <AdminLinkButton href="/admin/projects/new" variant="primary" className="mt-4">
                <Icon.Plus size={14} /> Add project
              </AdminLinkButton>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sr-only sm:not-sr-only">
                <tr className="border-b border-zinc-100 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  <th className="px-5 py-2.5 font-semibold">Project</th>
                  <th className="hidden px-3 py-2.5 font-semibold sm:table-cell">Status</th>
                  <th className="hidden px-3 py-2.5 font-semibold md:table-cell">Updated</th>
                  <th className="px-5 py-2.5 text-right font-semibold">
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.recentProjects.map((project) => (
                  <tr key={project.id} className="border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-9 w-14 shrink-0 overflow-hidden rounded-md border border-zinc-200 bg-zinc-100">
                          {project.image ? (
                            <Image {...imageSource(project.image)} alt="" fill sizes="56px" className="object-cover" />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-zinc-900">{project.title}</p>
                          <p className="mt-0.5 sm:hidden">
                            <StatusBadge status={project.status} />
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-3 py-3 sm:table-cell">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="hidden whitespace-nowrap px-3 py-3 text-zinc-500 md:table-cell">
                      {timeAgo(project.updatedAt)}
                      {project.updatedBy ? <span className="text-zinc-400"> · {project.updatedBy}</span> : null}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="text-[13px] font-medium text-zinc-600 hover:text-zinc-900"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        <div className="flex flex-col gap-6">
          <Panel title="Quick actions" bodyClassName="grid gap-2">
            {[
              { href: "/admin/projects/new", label: "Add project", icon: <Icon.Projects /> },
              { href: "/admin/team?new=1", label: "Add team member", icon: <Icon.Team /> },
              { href: "/admin/services?new=1", label: "Add service", icon: <Icon.Services /> },
              { href: "/admin/testimonials?new=1", label: "Add testimonial", icon: <Icon.Quote /> },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 rounded-lg border border-zinc-200 px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-100 text-zinc-600">
                  <Icon.Plus size={14} />
                </span>
                {action.label}
              </Link>
            ))}
            {data.unreadContacts > 0 ? (
              <Link
                href="/admin/contacts"
                className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-900 hover:bg-amber-100"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-100">
                  <Icon.Inbox size={14} />
                </span>
                {data.unreadContacts} new inquir{data.unreadContacts === 1 ? "y" : "ies"}
              </Link>
            ) : null}
          </Panel>

          <Panel
            title="Recent activity"
            actions={
              <Link href="/admin/activity" className="text-[13px] font-medium text-zinc-500 hover:text-zinc-900">
                All
              </Link>
            }
          >
            {data.activity.length === 0 ? (
              <p className="text-sm text-zinc-500">Changes you make in the CMS will show up here.</p>
            ) : (
              <ol className="flex flex-col gap-3">
                {data.activity.map((entry) => (
                  <li key={entry.id} className="flex gap-2.5 text-[13px]">
                    <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-300" />
                    <div className="min-w-0">
                      <p className="text-zinc-800">{entry.summary}</p>
                      <p className="text-xs text-zinc-400">
                        {entry.actor ?? "System"} · {timeAgo(entry.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
