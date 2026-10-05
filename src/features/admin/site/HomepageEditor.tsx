"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { saveHomepageSections } from "@/actions/site";
import type { HomepageSectionRow } from "@/server/admin/queries";
import {
  AdminButton,
  AdminInput,
  AdminTextarea,
  Badge,
  FormField,
  SortableList,
  Switch,
  useAdminFeedback,
} from "../ui";

/** Which sections have editable copy (some are driven purely by settings). */
const COPY_FIELDS: Record<string, ("eyebrow" | "title" | "description")[]> = {
  team: ["eyebrow", "title", "description"],
  services: ["eyebrow", "title", "description"],
  process: ["eyebrow", "title"],
  work: ["eyebrow", "title", "description"],
  stats: ["eyebrow", "title"],
  "why-us": ["eyebrow", "title"],
  testimonials: ["eyebrow", "title", "description"],
  contact: ["eyebrow", "title", "description"],
};

const NOTES: Record<string, string> = {
  hero: "Name, role, intro, and images are edited in Settings → Hero.",
  craft: "Heading and chapters are edited in Settings → Homepage content.",
  skills: "Shows the toolkit (skills records; not yet editable in the CMS).",
  experience: "Shows the career timeline (experience records; not yet editable in the CMS).",
  blog: "Shows the latest published blog posts.",
  team: "Shows published members from Team.",
  stats: "Numbers are edited in Settings → Homepage content.",
  "why-us": "Reasons are edited in Settings → Homepage content.",
  testimonials: "Shows published testimonials (or an empty state).",
  work: "Shows featured projects (or the newest published ones).",
};

export function HomepageEditor({ initial }: { initial: HomepageSectionRow[] }) {
  const router = useRouter();
  const { toast } = useAdminFeedback();
  const [sections, setSections] = useState(initial);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(sections) !== saved;

  const update = (key: string, patch: Partial<HomepageSectionRow>) =>
    setSections((list) => list.map((s) => (s.key === key ? { ...s, ...patch } : s)));

  async function save() {
    setSaving(true);
    const result = await saveHomepageSections(sections).catch(() => null);
    setSaving(false);
    if (result?.success) {
      setSaved(JSON.stringify(sections));
      toast("Homepage updated");
      router.refresh();
    } else {
      toast(result?.formError ?? "Couldn't save the homepage.", "error");
    }
  }

  return (
    <>
      <SortableList
        items={sections.map((s) => ({ ...s, id: s.key }))}
        itemLabel={(s) => s.label}
        successMessage=""
        onReorder={async (ids) => {
          const byKey = new Map(sections.map((s) => [s.key, s]));
          setSections(ids.map((id) => byKey.get(id)).filter((s): s is HomepageSectionRow => !!s));
          return { success: true };
        }}
        className="flex flex-col gap-2"
        renderItem={(section, { handle, index }) => {
          const fields = COPY_FIELDS[section.key] ?? [];
          const open = expanded === section.key;
          return (
            <div className={`rounded-xl border bg-white shadow-sm ${section.isEnabled ? "border-zinc-200" : "border-dashed border-zinc-300 opacity-70"}`}>
              <div className="flex items-center gap-3 px-3 py-3 sm:px-4">
                {handle}
                <span className="w-5 text-xs font-semibold tabular-nums text-zinc-400">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-medium text-zinc-900">
                    {section.label}
                    {!section.isEnabled ? <Badge>Hidden</Badge> : null}
                  </p>
                  <p className="truncate text-xs text-zinc-500">{section.title || NOTES[section.key] || " "}</p>
                </div>
                {fields.length > 0 ? (
                  <AdminButton size="sm" variant="ghost" aria-expanded={open} onClick={() => setExpanded(open ? null : section.key)}>
                    {open ? "Done" : "Edit text"}
                  </AdminButton>
                ) : null}
                <Switch
                  size="sm"
                  id={`section-${section.key}`}
                  checked={section.isEnabled}
                  onChange={(v) => update(section.key, { isEnabled: v })}
                />
              </div>
              {open ? (
                <div className="grid gap-3 border-t border-zinc-100 px-4 py-4">
                  {NOTES[section.key] ? <p className="text-xs text-zinc-500">{NOTES[section.key]}</p> : null}
                  <FormField id={`sec-${section.key}-label`} label="Label (CMS only)">
                    <AdminInput id={`sec-${section.key}-label`} value={section.label} onChange={(e) => update(section.key, { label: e.target.value })} />
                  </FormField>
                  {fields.includes("eyebrow") ? (
                    <FormField id={`sec-${section.key}-eyebrow`} label="Eyebrow">
                      <AdminInput id={`sec-${section.key}-eyebrow`} value={section.eyebrow} onChange={(e) => update(section.key, { eyebrow: e.target.value })} />
                    </FormField>
                  ) : null}
                  {fields.includes("title") ? (
                    <FormField id={`sec-${section.key}-title`} label="Title">
                      <AdminInput id={`sec-${section.key}-title`} value={section.title} onChange={(e) => update(section.key, { title: e.target.value })} />
                    </FormField>
                  ) : null}
                  {fields.includes("description") ? (
                    <FormField id={`sec-${section.key}-desc`} label="Description">
                      <AdminTextarea id={`sec-${section.key}-desc`} rows={3} value={section.description} onChange={(e) => update(section.key, { description: e.target.value })} />
                    </FormField>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        }}
      />

      <div className="sticky bottom-0 z-10 -mx-4 mt-6 flex items-center justify-between gap-3 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:mx-0 lg:rounded-xl lg:border">
        <p className="text-xs text-zinc-500">{dirty ? "Unsaved changes" : "Drag to reorder · toggle to show or hide"}</p>
        <div className="flex gap-2">
          <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-zinc-600 hover:bg-zinc-100">
            View homepage
          </a>
          <AdminButton variant="primary" loading={saving} disabled={!dirty} onClick={save}>
            Save homepage
          </AdminButton>
        </div>
      </div>
    </>
  );
}
