"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

import {
  deleteTeamMemberPermanently,
  reorderTeamMembers,
  restoreTeamMember,
  saveTeamMember,
  setTeamMemberPublished,
  trashTeamMember,
} from "@/actions/team";
import { imageSource } from "@/lib/images";
import type { TeamMemberRow } from "@/server/admin/queries";
import {
  AdminButton,
  AdminEmptyState,
  AdminInput,
  AdminTextarea,
  FormField,
  Icon,
  ImageField,
  PublishedBadge,
  RowMenu,
  Sheet,
  SortableList,
  StringListEditor,
  Switch,
  fieldProps,
  slugify,
  useAdminAction,
  useAdminFeedback,
  useRecordForm,
} from "../ui";

interface MemberForm {
  name: string;
  slug: string;
  role: string;
  shortBio: string;
  bio: string;
  profileImage: string;
  location: string;
  email: string;
  website: string;
  linkedin: string;
  github: string;
  responsibilities: string[];
  skills: string[];
  experience: string;
  highlights: string[];
  /** One group per line: "Group name: skill, skill, skill". */
  skillGroups: string;
  focus: string;
  isPublished: boolean;
  isFeatured: boolean;
}

function skillGroupsToText(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return value
    .map((group: { label?: unknown; items?: unknown }) =>
      typeof group?.label === "string" && Array.isArray(group.items)
        ? `${group.label}: ${group.items.join(", ")}`
        : "",
    )
    .filter(Boolean)
    .join("\n");
}

function textToSkillGroups(text: string): { label: string; items: string[] }[] {
  return text
    .split("\n")
    .map((line) => {
      const colon = line.indexOf(":");
      const label = (colon >= 0 ? line.slice(0, colon) : line).trim();
      const items = colon >= 0 ? line.slice(colon + 1).split(",").map((i) => i.trim()).filter(Boolean) : [];
      return { label, items };
    })
    .filter((group) => group.label !== "");
}

const EMPTY: MemberForm = {
  name: "",
  slug: "",
  role: "",
  shortBio: "",
  bio: "",
  profileImage: "",
  location: "",
  email: "",
  website: "",
  linkedin: "",
  github: "",
  responsibilities: [],
  skills: [],
  experience: "",
  highlights: [],
  skillGroups: "",
  focus: "",
  isPublished: false,
  isFeatured: false,
};

function toForm(m: TeamMemberRow): MemberForm {
  return {
    name: m.name,
    slug: m.slug,
    role: m.role,
    shortBio: m.shortBio ?? "",
    bio: m.bio ?? "",
    profileImage: m.profileImage ?? "",
    location: m.location ?? "",
    email: m.email ?? "",
    website: m.website ?? "",
    linkedin: m.linkedin ?? "",
    github: m.github ?? "",
    responsibilities: m.responsibilities ?? [],
    skills: m.skills ?? [],
    experience: m.experience ?? "",
    highlights: m.highlights ?? [],
    skillGroups: skillGroupsToText(m.skillGroups),
    focus: m.focus ?? "",
    isPublished: m.isPublished,
    isFeatured: m.isFeatured,
  };
}

function Avatar({ member }: { member: TeamMemberRow }) {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-zinc-100">
      {member.profileImage ? (
        <Image {...imageSource(member.profileImage)} alt="" fill sizes="(max-width: 640px) 90vw, 280px" className="object-cover object-[center_15%]" />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-3xl font-semibold text-zinc-300">
          {member.name.replace(/\[.*?\]/g, "").trim().slice(0, 1).toUpperCase() || "?"}
        </span>
      )}
    </div>
  );
}

export function TeamManager({ members }: { members: TeamMemberRow[] }) {
  const form = useRecordForm<MemberForm>(EMPTY);
  const { run } = useAdminAction();
  const { confirm } = useAdminFeedback();
  const searchParams = useSearchParams();

  const active = members.filter((m) => !m.deletedAt);
  const removed = members.filter((m) => m.deletedAt);
  const { values, errors, set } = form;

  useEffect(() => {
    if (searchParams?.get("new") === "1") form.openNew();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = () =>
    form.submit(
      (id, v) => saveTeamMember(id, { ...v, skillGroups: textToSkillGroups(v.skillGroups), displayOrder: id ? members.find((m) => m.id === id)?.displayOrder ?? 0 : active.length }),
      form.editingId ? "Team member saved" : "Team member added",
    );

  return (
    <>
      <div className="mb-4 flex justify-end">
        <AdminButton variant="primary" onClick={() => form.openNew()}>
          <Icon.Plus size={14} /> Add member
        </AdminButton>
      </div>

      {active.length === 0 ? (
        <AdminEmptyState
          icon={<Icon.Team size={20} />}
          title="No team members yet."
          description="Add the people behind the studio — they appear in the hero, the team section, and the About page."
          action={
            <AdminButton variant="primary" onClick={() => form.openNew()}>
              <Icon.Plus size={14} /> Add team member
            </AdminButton>
          }
        />
      ) : (
        <SortableList
          layout="grid"
          items={active}
          onReorder={reorderTeamMembers}
          itemLabel={(m) => m.name}
          successMessage="Team order saved"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          renderItem={(member, { handle, index }) => (
            <article className="flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
              <div className="relative p-3 pb-0">
                <Avatar member={member} />
                <span className="absolute left-5 top-5 rounded-md bg-white/90 px-1.5 py-0.5 text-[11px] font-semibold text-zinc-700 shadow-sm">
                  #{index + 1}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-1 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-zinc-900">{member.name}</h3>
                    <p className="truncate text-[13px] text-zinc-500">{member.role}</p>
                  </div>
                  <RowMenu
                    label={`Actions for ${member.name}`}
                    items={[
                      { label: "Edit", icon: <Icon.Pen size={14} />, onSelect: () => form.openEdit(member.id, toForm(member)) },
                      {
                        label: member.isPublished ? "Unpublish" : "Publish",
                        icon: member.isPublished ? <Icon.EyeOff size={14} /> : <Icon.Eye size={14} />,
                        onSelect: () =>
                          run(() => setTeamMemberPublished(member.id, !member.isPublished), {
                            success: member.isPublished ? "Hidden from the site" : "Now on the site",
                          }),
                      },
                      {
                        label: "Remove",
                        icon: <Icon.Trash size={14} />,
                        tone: "danger",
                        onSelect: async () => {
                          if (
                            await confirm({
                              title: `Remove ${member.name}?`,
                              description: "They disappear from the site. You can restore them from “Removed members” below.",
                              confirmLabel: "Remove",
                              tone: "danger",
                            })
                          ) {
                            run(() => trashTeamMember(member.id), { success: "Team member removed" });
                          }
                        },
                      },
                    ]}
                  />
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <PublishedBadge published={member.isPublished} />
                  <div className="flex items-center gap-1">
                    <AdminButton size="sm" variant="ghost" onClick={() => form.openEdit(member.id, toForm(member))}>
                      Edit
                    </AdminButton>
                    {handle}
                  </div>
                </div>
              </div>
            </article>
          )}
        />
      )}

      {removed.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-2 text-[13px] font-semibold text-zinc-500">Removed members</h2>
          <ul className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white">
            {removed.map((member) => (
              <li key={member.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="truncate text-sm text-zinc-700">{member.name}</span>
                <div className="flex gap-2">
                  <AdminButton size="sm" onClick={() => run(() => restoreTeamMember(member.id), { success: "Restored (unpublished)" })}>
                    <Icon.Restore size={14} /> Restore
                  </AdminButton>
                  <AdminButton
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={async () => {
                      if (
                        await confirm({
                          title: `Delete ${member.name} forever?`,
                          description: "This can't be undone.",
                          confirmLabel: "Delete forever",
                          tone: "danger",
                        })
                      ) {
                        run(() => deleteTeamMemberPermanently(member.id), { success: "Deleted" });
                      }
                    }}
                  >
                    Delete forever
                  </AdminButton>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Sheet
        open={form.open}
        onClose={form.close}
        title={form.editingId ? `Edit ${values.name || "team member"}` : "Add team member"}
        onSubmit={save}
        submitting={form.submitting}
        submitLabel={form.editingId ? "Save" : "Add member"}
        wide
        footerExtra={
          <Switch
            size="sm"
            label="Published"
            checked={values.isPublished}
            onChange={(v) => set("isPublished", v)}
          />
        }
      >
        <div className="grid gap-4 sm:grid-cols-[12rem_minmax(0,1fr)]">
          <ImageField
            label="Profile image"
            folder="team"
            aspect="aspect-[4/5]"
            value={values.profileImage}
            onChange={(url) => set("profileImage", url)}
            error={errors.profileImage}
          />
          <div className="flex flex-col gap-4">
            <FormField id="m-name" label="Name" required error={errors.name}>
              <AdminInput
                {...fieldProps("m-name", errors.name)}
                value={values.name}
                onChange={(e) => {
                  set("name", e.target.value);
                  if (!form.editingId) set("slug", slugify(e.target.value));
                }}
              />
            </FormField>
            <FormField id="m-role" label="Role" required error={errors.role} hint="e.g. Product & Engineering">
              <AdminInput {...fieldProps("m-role", errors.role)} value={values.role} onChange={(e) => set("role", e.target.value)} />
            </FormField>
            <FormField id="m-slug" label="Slug" required error={errors.slug}>
              <AdminInput {...fieldProps("m-slug", errors.slug)} value={values.slug} onChange={(e) => set("slug", slugify(e.target.value))} />
            </FormField>
          </div>
        </div>
        <FormField id="m-short" label="Short bio" error={errors.shortBio} hint="One line about what they make happen.">
          <AdminInput {...fieldProps("m-short", errors.shortBio)} value={values.shortBio} onChange={(e) => set("shortBio", e.target.value)} />
        </FormField>
        <FormField id="m-bio" label="Full bio" error={errors.bio}>
          <AdminTextarea {...fieldProps("m-bio", errors.bio)} rows={5} value={values.bio} onChange={(e) => set("bio", e.target.value)} />
        </FormField>
        <StringListEditor
          label="Key areas"
          value={values.responsibilities}
          onChange={(v) => set("responsibilities", v)}
          placeholder="Secure logins — the right people see the right things"
          max={12}
          error={errors.responsibilities}
        />
        <StringListEditor
          label="Skills & background"
          value={values.skills}
          onChange={(v) => set("skills", v)}
          placeholder="Identity & Access Management"
          max={40}
          error={errors.skills}
        />
        <StringListEditor
          label="Responsibilities & contributions"
          hint="Shown on their profile page."
          value={values.highlights}
          onChange={(v) => set("highlights", v)}
          placeholder="Automate repetitive IT processes with PowerShell and Python"
          max={30}
          error={errors.highlights}
        />
        <FormField
          id="m-groups"
          label="Skill groups"
          error={errors.skillGroups}
          hint="One group per line — “Group name: skill, skill, skill”. Shown on their profile page."
        >
          <AdminTextarea
            {...fieldProps("m-groups", errors.skillGroups)}
            rows={5}
            value={values.skillGroups}
            onChange={(e) => set("skillGroups", e.target.value)}
            placeholder={"Automation & Scripting: PowerShell, Python\nCloud: Microsoft Azure"}
          />
        </FormField>
        <FormField id="m-focus" label="Professional focus" error={errors.focus} hint="Closing paragraph on their profile page.">
          <AdminTextarea {...fieldProps("m-focus", errors.focus)} rows={4} value={values.focus} onChange={(e) => set("focus", e.target.value)} />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="m-exp" label="Experience line" error={errors.experience} hint="e.g. 7+ years in enterprise IT">
            <AdminInput {...fieldProps("m-exp", errors.experience)} value={values.experience} onChange={(e) => set("experience", e.target.value)} />
          </FormField>
          <FormField id="m-loc" label="Location" error={errors.location}>
            <AdminInput {...fieldProps("m-loc", errors.location)} value={values.location} onChange={(e) => set("location", e.target.value)} />
          </FormField>
          <FormField id="m-email" label="Email" error={errors.email}>
            <AdminInput {...fieldProps("m-email", errors.email)} type="email" value={values.email} onChange={(e) => set("email", e.target.value)} />
          </FormField>
          <FormField id="m-web" label="Website" error={errors.website}>
            <AdminInput {...fieldProps("m-web", errors.website)} type="url" value={values.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" />
          </FormField>
          <FormField id="m-li" label="LinkedIn" error={errors.linkedin}>
            <AdminInput {...fieldProps("m-li", errors.linkedin)} type="url" value={values.linkedin} onChange={(e) => set("linkedin", e.target.value)} placeholder="https://linkedin.com/in/…" />
          </FormField>
          <FormField id="m-gh" label="GitHub" error={errors.github}>
            <AdminInput {...fieldProps("m-gh", errors.github)} type="url" value={values.github} onChange={(e) => set("github", e.target.value)} placeholder="https://github.com/…" />
          </FormField>
        </div>
        <Switch
          label="Featured"
          description="Featured members appear in the homepage hero (first two)."
          checked={values.isFeatured}
          onChange={(v) => set("isFeatured", v)}
        />
      </Sheet>
    </>
  );
}
