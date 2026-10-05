"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  saveProject,
  setProjectStatus,
  trashProject,
  type SaveIntent,
} from "@/actions/projects";
import { saveTechnology } from "@/actions/content";
import type { ProjectForEdit } from "@/server/admin/queries";
import type { ProjectInput } from "@/lib/validation/cms";
import { cn } from "@/lib/utils";
import {
  AdminButton,
  AdminInput,
  AdminTextarea,
  Badge,
  FormField,
  Icon,
  ImageField,
  Panel,
  StatusBadge,
  Switch,
  Tabs,
  fieldProps,
  formatDateTime,
  slugify,
  timeAgo,
  useAdminFeedback,
} from "../ui";
import { MediaManager, type EditableMedia } from "./MediaManager";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface TechOption {
  id: string;
  name: string;
  category: string | null;
  isActive: boolean;
}

interface FormState {
  title: string;
  slug: string;
  category: string;
  tagline: string;
  shortDescription: string;
  description: string;
  year: string;
  clientName: string;
  problem: string;
  solution: string;
  result: string;
  coverImage: string;
  heroImage: string;
  media: EditableMedia[];
  projectUrl: string;
  githubUrl: string;
  otherUrl: string;
  otherUrlLabel: string;
  technologyIds: string[];
  featured: boolean;
  displayOrder: number;
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
}

type TabId = "basics" | "story" | "media" | "links" | "technologies" | "seo";
type Errors = Record<string, string[]>;

const FIELD_TAB: Record<string, TabId> = {
  title: "basics",
  slug: "basics",
  category: "basics",
  tagline: "basics",
  shortDescription: "basics",
  description: "basics",
  year: "basics",
  clientName: "basics",
  problem: "story",
  solution: "story",
  result: "story",
  coverImage: "media",
  heroImage: "media",
  media: "media",
  projectUrl: "links",
  githubUrl: "links",
  otherUrl: "links",
  otherUrlLabel: "links",
  technologyIds: "technologies",
  seoTitle: "seo",
  seoDescription: "seo",
  ogImage: "seo",
};

function toState(project: ProjectForEdit | null): FormState {
  return {
    title: project?.title ?? "",
    slug: project?.slug ?? "",
    category: project?.category ?? "",
    tagline: project?.tagline ?? "",
    shortDescription: project?.shortDescription ?? "",
    description: project?.description ?? "",
    year: project?.year ? String(project.year) : "",
    clientName: project?.clientName ?? "",
    problem: project?.problem ?? "",
    solution: project?.solution ?? "",
    result: project?.result ?? "",
    coverImage: project?.coverImage ?? "",
    heroImage: project?.heroImage ?? "",
    media: (project?.media ?? []).map((m) => ({
      key: m.id,
      id: m.id,
      mediaType: m.mediaType,
      url: m.url,
      thumbnailUrl: m.thumbnailUrl ?? "",
      title: m.title ?? "",
      caption: m.caption ?? "",
      altText: m.altText ?? "",
    })),
    projectUrl: project?.projectUrl ?? "",
    githubUrl: project?.githubUrl ?? "",
    otherUrl: project?.otherUrl ?? "",
    otherUrlLabel: project?.otherUrlLabel ?? "",
    technologyIds: project?.technologyIds ?? [],
    featured: project?.featured ?? false,
    displayOrder: project?.displayOrder ?? 0,
    seoTitle: project?.seoTitle ?? "",
    seoDescription: project?.seoDescription ?? "",
    ogImage: project?.ogImage ?? "",
  };
}

function toInput(state: FormState): ProjectInput {
  return {
    ...state,
    year: state.year.trim() === "" ? undefined : Number(state.year),
    media: state.media.map(({ key: _key, ...m }) => m),
  };
}

/** Normalised, comparable snapshot for dirty checking. */
const snapshot = (state: FormState) => JSON.stringify(toInput(state));

function Counter({ value, max, soft }: { value: string; max: number; soft?: number }) {
  const len = value.length;
  const over = len > max;
  const warn = soft !== undefined && len > soft;
  return (
    <span className={cn("tabular-nums", over ? "text-red-600" : warn ? "text-amber-600" : "text-zinc-400")}>
      {len}/{soft ?? max}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Editor                                                                     */
/* -------------------------------------------------------------------------- */

export function ProjectEditor({
  project,
  technologies: initialTechnologies,
  categories,
}: {
  project: ProjectForEdit | null;
  technologies: TechOption[];
  categories: string[];
}) {
  const router = useRouter();
  const { toast, confirm } = useAdminFeedback();

  const [projectId, setProjectId] = useState<string | null>(project?.id ?? null);
  const [status, setStatus] = useState(project?.status ?? "DRAFT");
  const [form, setForm] = useState<FormState>(() => toState(project));
  const [savedSnapshot, setSavedSnapshot] = useState(() => snapshot(toState(project)));
  const [errors, setErrors] = useState<Errors>({});
  const [tab, setTab] = useState<TabId>("basics");
  const [saving, setSaving] = useState<SaveIntent | "status" | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(project?.updatedAt ?? null);
  const [autosaveState, setAutosaveState] = useState<"idle" | "pending" | "saving" | "saved" | "error">("idle");
  const [technologies, setTechnologies] = useState(initialTechnologies);
  // Auto-fill the slug from the title until the slug is edited by hand
  // (never for a project that has already been published).
  const [slugTouched, setSlugTouched] = useState(Boolean(project?.slug) && (project?.status !== "DRAFT" || !!project?.publishedAt));

  const dirty = snapshot(form) !== savedSnapshot;
  const isLive = status === "PUBLISHED";
  const isTrashed = Boolean(project?.deletedAt);

  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key as string]) return current;
      const { [key as string]: _removed, ...rest } = current;
      return rest;
    });
  }, []);

  const onTitle = (value: string) => {
    set("title", value);
    if (!slugTouched) set("slug", slugify(value));
  };

  /* ---------------------------- saving ---------------------------- */

  const save = useCallback(
    async (intent: SaveIntent, { silent = false }: { silent?: boolean } = {}) => {
      setSaving(intent);
      const result = await saveProject(projectId, toInput(form), intent).catch(() => null);
      setSaving(null);

      if (!result) {
        if (!silent) toast("Couldn't reach the server. Your changes are still here — try again.", "error");
        return null;
      }
      if (!result.success) {
        const fieldErrors = result.fieldErrors ?? {};
        setErrors(fieldErrors);
        const firstField = Object.keys(fieldErrors)[0]?.split(".")[0];
        if (firstField && FIELD_TAB[firstField]) setTab(FIELD_TAB[firstField]);
        if (!silent) toast(result.formError ?? "Please fix the highlighted fields.", "error");
        return null;
      }

      const saved = result.data!;
      setErrors({});
      setStatus(saved.status);
      setSavedSnapshot(snapshot(form));
      setLastSavedAt(saved.updatedAt);
      if (!silent) {
        toast(
          intent === "publish"
            ? "Published — it's live on your portfolio"
            : saved.status === "PUBLISHED"
              ? "Changes are live"
              : "Draft saved",
        );
      }
      if (!projectId) {
        setProjectId(saved.id);
        router.replace(`/admin/projects/${saved.id}`);
      } else {
        router.refresh();
      }
      return saved;
    },
    [form, projectId, router, toast],
  );

  // Autosave drafts 2.5s after the last change (never for live projects —
  // edits to a live project go public only when you click "Save changes").
  const autosaveTimer = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!projectId || status !== "DRAFT" || !dirty || saving || isTrashed) return;
    if (!form.title.trim() || !form.slug.trim()) return;
    setAutosaveState("pending");
    window.clearTimeout(autosaveTimer.current);
    autosaveTimer.current = window.setTimeout(async () => {
      setAutosaveState("saving");
      const saved = await save("draft", { silent: true });
      setAutosaveState(saved ? "saved" : "error");
    }, 2500);
    return () => window.clearTimeout(autosaveTimer.current);
  }, [form, projectId, status, dirty, saving, isTrashed, save]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // Cmd/Ctrl+S saves.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void save(isLive ? "save" : "draft");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save, isLive]);

  async function changeStatus(next: "DRAFT" | "ARCHIVED") {
    if (!projectId) return;
    if (dirty) {
      const ok = await confirm({
        title: "Discard unsaved changes?",
        description: "You have edits that haven't been saved. Changing the status keeps the last saved version.",
        confirmLabel: "Continue",
      });
      if (!ok) return;
    }
    setSaving("status");
    const result = await setProjectStatus(projectId, next).catch(() => null);
    setSaving(null);
    if (result?.success) {
      setStatus(next);
      toast(next === "ARCHIVED" ? "Archived — hidden from the site" : "Unpublished — moved back to drafts");
      router.refresh();
    } else {
      toast(result?.formError ?? "Couldn't change the status.", "error");
    }
  }

  async function preview() {
    // Open synchronously so popup blockers allow it, then point it at the preview.
    const win = window.open("about:blank", "_blank");
    let id = projectId;
    if (!isLive && (dirty || !id)) {
      const saved = await save("draft", { silent: true });
      if (!saved) {
        win?.close();
        toast("Fix the highlighted fields before previewing.", "error");
        return;
      }
      id = saved.id;
    } else if (isLive && dirty) {
      toast("Preview shows the last saved version. Save changes to see your edits.", "info");
    }
    if (win && id) win.location.href = `/admin/projects/${id}/preview`;
  }

  async function moveToTrash() {
    if (!projectId) return;
    const ok = await confirm({
      title: `Move “${form.title || "this project"}” to trash?`,
      description: "It disappears from the site immediately. You can restore it from Projects → Trash.",
      confirmLabel: "Move to trash",
      tone: "danger",
    });
    if (!ok) return;
    const result = await trashProject(projectId);
    if (result.success) {
      toast("Moved to trash");
      router.push("/admin/projects");
    } else {
      toast(result.formError ?? "Couldn't move to trash.", "error");
    }
  }

  /* ---------------------------- tabs ---------------------------- */

  const tabErrors = useMemo(() => {
    const counts: Partial<Record<TabId, number>> = {};
    for (const key of Object.keys(errors)) {
      const t = FIELD_TAB[key.split(".")[0] ?? ""];
      if (t) counts[t] = (counts[t] ?? 0) + 1;
    }
    return counts;
  }, [errors]);

  const tabBadge = (id: TabId) =>
    tabErrors[id] ? (
      <span className="rounded-full bg-red-100 px-1.5 text-[11px] font-semibold text-red-700">{tabErrors[id]}</span>
    ) : null;

  const storyMissing = [form.shortDescription, form.problem, form.solution, form.result].filter((v) => !v.trim()).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      {/* ---------------------------------------------------------------- */}
      <div className="min-w-0">
        <div className="sticky top-14 z-10 -mx-4 bg-[var(--bg)]/95 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:top-0 lg:mx-0 lg:px-0">
          <Tabs<TabId>
            label="Project sections"
            active={tab}
            onChange={setTab}
            tabs={[
              { id: "basics", label: "Basics", badge: tabBadge("basics") },
              {
                id: "story",
                label: "Story",
                badge: tabBadge("story") ?? (storyMissing > 0 ? <span className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-label="incomplete" /> : null),
              },
              { id: "media", label: "Media", badge: tabBadge("media") ?? <span className="text-xs text-zinc-400">{form.media.length}</span> },
              { id: "links", label: "Links", badge: tabBadge("links") },
              { id: "technologies", label: "Technologies", badge: <span className="text-xs text-zinc-400">{form.technologyIds.length}</span> },
              { id: "seo", label: "SEO", badge: tabBadge("seo") },
            ]}
          />
        </div>

        <div className="mt-5" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {tab === "basics" ? (
            <Panel title="Basic information" bodyClassName="grid gap-4 sm:grid-cols-2">
              <FormField id="title" label="Project name" required error={errors.title} className="sm:col-span-2">
                <AdminInput
                  {...fieldProps("title", errors.title)}
                  value={form.title}
                  onChange={(e) => onTitle(e.target.value)}
                  placeholder="PetCury — Veterinary Clinic Management"
                  autoFocus={!project}
                />
              </FormField>
              <FormField
                id="slug"
                label="Slug"
                required
                error={errors.slug}
                hint={`Public address: /work/${form.slug || "your-project"}`}
                className="sm:col-span-2"
                aside={
                  isLive ? "Changing it breaks existing links" : !slugTouched ? "Auto-filled from the name" : undefined
                }
              >
                <div className="flex">
                  <span className="inline-flex items-center rounded-l-md border border-r-0 border-zinc-300 bg-zinc-50 px-2.5 text-[13px] text-zinc-500">
                    /work/
                  </span>
                  <AdminInput
                    {...fieldProps("slug", errors.slug)}
                    className="rounded-l-none"
                    value={form.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      set("slug", slugify(e.target.value));
                    }}
                  />
                </div>
              </FormField>
              <FormField id="category" label="Category" error={errors.category} hint="Used for the filter on /work.">
                <AdminInput
                  {...fieldProps("category", errors.category)}
                  list="project-categories"
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  placeholder="Business system"
                />
                <datalist id="project-categories">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </FormField>
              <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-3">
                <FormField id="year" label="Year" error={errors.year}>
                  <AdminInput
                    {...fieldProps("year", errors.year)}
                    inputMode="numeric"
                    value={form.year}
                    onChange={(e) => set("year", e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
                    placeholder="2026"
                  />
                </FormField>
                <FormField id="clientName" label="Client" error={errors.clientName}>
                  <AdminInput
                    {...fieldProps("clientName", errors.clientName)}
                    value={form.clientName}
                    onChange={(e) => set("clientName", e.target.value)}
                    placeholder="Optional"
                  />
                </FormField>
              </div>
              <FormField
                id="tagline"
                label="Tagline"
                error={errors.tagline}
                aside={<Counter value={form.tagline} max={200} />}
                hint="One punchy line shown under the title."
                className="sm:col-span-2"
              >
                <AdminInput
                  {...fieldProps("tagline", errors.tagline)}
                  value={form.tagline}
                  onChange={(e) => set("tagline", e.target.value)}
                  placeholder="Every branch, every pet, one system."
                />
              </FormField>
              <FormField
                id="shortDescription"
                label="Short description"
                required={isLive}
                error={errors.shortDescription}
                aside={<Counter value={form.shortDescription} max={400} soft={220} />}
                hint="Shown on project cards and in search results."
                className="sm:col-span-2"
              >
                <AdminTextarea
                  {...fieldProps("shortDescription", errors.shortDescription)}
                  rows={3}
                  value={form.shortDescription}
                  onChange={(e) => set("shortDescription", e.target.value)}
                />
              </FormField>
              <FormField
                id="description"
                label="Overview"
                error={errors.description}
                hint="Optional longer introduction at the top of the case study."
                className="sm:col-span-2"
              >
                <AdminTextarea
                  {...fieldProps("description", errors.description)}
                  rows={5}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </FormField>
            </Panel>
          ) : null}

          {tab === "story" ? (
            <Panel
              title="The story"
              description="Write for a business owner, not an engineer: what was wrong, what you built, what got better."
              bodyClassName="grid gap-5"
            >
              {(
                [
                  ["problem", "Problem", "What was slowing the business down? Who felt it?"],
                  ["solution", "Solution", "What did you build, in plain language?"],
                  ["result", "Result", "What got better? Numbers, time saved, happier customers."],
                ] as const
              ).map(([key, label, hint], index) => (
                <FormField
                  key={key}
                  id={key}
                  label={
                    <span className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-semibold text-white">
                        {index + 1}
                      </span>
                      {label}
                    </span>
                  }
                  required={isLive}
                  error={errors[key]}
                  hint={hint}
                  aside={<Counter value={form[key]} max={5000} />}
                >
                  <AdminTextarea
                    {...fieldProps(key, errors[key])}
                    rows={5}
                    value={form[key]}
                    onChange={(e) => set(key, e.target.value)}
                  />
                </FormField>
              ))}
            </Panel>
          ) : null}

          {tab === "media" ? (
            <div className="flex flex-col gap-5">
              <Panel title="Cover & hero" bodyClassName="grid gap-5 sm:grid-cols-2">
                <ImageField
                  label="Cover image"
                  hint="Used on cards and the homepage. Falls back to the first gallery image."
                  folder="projects"
                  value={form.coverImage}
                  onChange={(url) => set("coverImage", url)}
                  error={errors.coverImage}
                />
                <ImageField
                  label="Hero image"
                  hint="Wide banner at the top of the case study (optional)."
                  folder="projects"
                  value={form.heroImage}
                  onChange={(url) => set("heroImage", url)}
                  error={errors.heroImage}
                />
              </Panel>
              <Panel title="Gallery" description="Screenshots, mobile views, dashboards, walkthrough videos. Drag to reorder.">
                <MediaManager
                  value={form.media}
                  onChange={(media) => set("media", media)}
                  coverImage={form.coverImage}
                  onSetCover={(url) => set("coverImage", url)}
                />
                {Object.entries(errors)
                  .filter(([k]) => k.startsWith("media"))
                  .map(([k, v]) => (
                    <p key={k} role="alert" className="mt-2 text-xs font-medium text-red-600">
                      Gallery item {Number(k.split(".")[1] ?? 0) + 1}: {v[0]}
                    </p>
                  ))}
              </Panel>
            </div>
          ) : null}

          {tab === "links" ? (
            <Panel title="Links" description="Only filled-in links appear on the site." bodyClassName="grid gap-4 sm:grid-cols-2">
              <FormField id="projectUrl" label="Live website" error={errors.projectUrl} className="sm:col-span-2">
                <AdminInput
                  {...fieldProps("projectUrl", errors.projectUrl)}
                  type="url"
                  value={form.projectUrl}
                  onChange={(e) => set("projectUrl", e.target.value)}
                  placeholder="https://"
                />
              </FormField>
              <FormField id="githubUrl" label="GitHub" error={errors.githubUrl} className="sm:col-span-2">
                <AdminInput
                  {...fieldProps("githubUrl", errors.githubUrl)}
                  type="url"
                  value={form.githubUrl}
                  onChange={(e) => set("githubUrl", e.target.value)}
                  placeholder="https://github.com/…"
                />
              </FormField>
              <FormField id="otherUrl" label="Other link" error={errors.otherUrl}>
                <AdminInput
                  {...fieldProps("otherUrl", errors.otherUrl)}
                  type="url"
                  value={form.otherUrl}
                  onChange={(e) => set("otherUrl", e.target.value)}
                  placeholder="https://"
                />
              </FormField>
              <FormField id="otherUrlLabel" label="Other link label" error={errors.otherUrlLabel}>
                <AdminInput
                  {...fieldProps("otherUrlLabel", errors.otherUrlLabel)}
                  value={form.otherUrlLabel}
                  onChange={(e) => set("otherUrlLabel", e.target.value)}
                  placeholder="Case study PDF"
                />
              </FormField>
            </Panel>
          ) : null}

          {tab === "technologies" ? (
            <TechnologyPicker
              all={technologies}
              selected={form.technologyIds}
              onChange={(ids) => set("technologyIds", ids)}
              onCreated={(tech) => setTechnologies((list) => [...list, tech])}
            />
          ) : null}

          {tab === "seo" ? (
            <div className="flex flex-col gap-5">
              <Panel title="Search & social" description="Leave empty to use the project name, short description, and cover image." bodyClassName="grid gap-4">
                <FormField
                  id="seoTitle"
                  label="SEO title"
                  error={errors.seoTitle}
                  aside={<Counter value={form.seoTitle} max={120} soft={60} />}
                >
                  <AdminInput
                    {...fieldProps("seoTitle", errors.seoTitle)}
                    value={form.seoTitle}
                    onChange={(e) => set("seoTitle", e.target.value)}
                    placeholder={form.title}
                  />
                </FormField>
                <FormField
                  id="seoDescription"
                  label="SEO description"
                  error={errors.seoDescription}
                  aside={<Counter value={form.seoDescription} max={320} soft={160} />}
                >
                  <AdminTextarea
                    {...fieldProps("seoDescription", errors.seoDescription)}
                    rows={3}
                    value={form.seoDescription}
                    onChange={(e) => set("seoDescription", e.target.value)}
                    placeholder={form.shortDescription}
                  />
                </FormField>
                <ImageField
                  label="Social share image"
                  hint="1200×630 works best. Defaults to the cover image."
                  folder="projects"
                  value={form.ogImage}
                  onChange={(url) => set("ogImage", url)}
                  error={errors.ogImage}
                />
              </Panel>
              <Panel title="Search preview">
                <div className="max-w-xl">
                  <p className="truncate text-xs text-zinc-500">yoursite.com › work › {form.slug || "project"}</p>
                  <p className="mt-0.5 truncate text-lg text-[#1a0dab]">{form.seoTitle || form.title || "Project title"}</p>
                  <p className="line-clamp-2 text-sm text-zinc-600">
                    {form.seoDescription || form.shortDescription || "Short description appears here."}
                  </p>
                </div>
              </Panel>
            </div>
          ) : null}
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
        <Panel>
          <div className="flex items-center justify-between">
            <StatusBadge status={isTrashed ? "TRASH" : status} />
            <span className="text-xs text-zinc-500" aria-live="polite">
              {saving && saving !== "status"
                ? "Saving…"
                : autosaveState === "pending" && dirty
                  ? "Unsaved changes"
                  : autosaveState === "error"
                    ? "Autosave failed"
                    : dirty
                      ? "Unsaved changes"
                      : lastSavedAt
                        ? `Saved ${timeAgo(lastSavedAt)}`
                        : "Not saved yet"}
            </span>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {isLive ? (
              <>
                <AdminButton variant="primary" loading={saving === "save"} disabled={!dirty || !!saving} onClick={() => save("save")}>
                  Save changes
                </AdminButton>
                <div className="grid grid-cols-2 gap-2">
                  <AdminButton onClick={preview} disabled={!!saving}>
                    <Icon.Eye size={14} /> Preview
                  </AdminButton>
                  <AdminButton onClick={() => changeStatus("DRAFT")} loading={saving === "status"} disabled={!!saving}>
                    Unpublish
                  </AdminButton>
                </div>
              </>
            ) : (
              <>
                <AdminButton
                  variant="success"
                  loading={saving === "publish"}
                  disabled={!!saving || isTrashed}
                  onClick={() => save("publish")}
                >
                  <Icon.Check size={14} /> Publish
                </AdminButton>
                <div className="grid grid-cols-2 gap-2">
                  <AdminButton loading={saving === "draft" && autosaveState !== "saving"} disabled={!!saving || isTrashed} onClick={() => save("draft")}>
                    Save draft
                  </AdminButton>
                  <AdminButton onClick={preview} disabled={!!saving || isTrashed}>
                    <Icon.Eye size={14} /> Preview
                  </AdminButton>
                </div>
              </>
            )}
          </div>

          {!isLive && storyMissing > 0 ? (
            <p className="mt-3 rounded-md bg-amber-50 px-2.5 py-2 text-xs text-amber-800">
              {storyMissing} story field{storyMissing === 1 ? "" : "s"} still empty — needed before publishing.
            </p>
          ) : null}
          {status === "DRAFT" && projectId ? (
            <p className="mt-3 text-xs text-zinc-500">Drafts save automatically as you type.</p>
          ) : null}
          {isLive ? (
            <p className="mt-3 text-xs text-zinc-500">This project is live. Changes go public when you click Save changes.</p>
          ) : null}
        </Panel>

        <Panel title="Display" bodyClassName="flex flex-col gap-4">
          <Switch
            label="Feature on homepage"
            description="Shows in “Selected work” (up to 6)."
            checked={form.featured}
            onChange={(v) => set("featured", v)}
          />
          <FormField id="displayOrder" label="Display order" hint="Lower numbers first. Or drag in the project list." error={errors.displayOrder}>
            <AdminInput
              {...fieldProps("displayOrder", errors.displayOrder)}
              type="number"
              min={0}
              value={form.displayOrder}
              onChange={(e) => set("displayOrder", Math.max(0, Number(e.target.value) || 0))}
            />
          </FormField>
        </Panel>

        {project ? (
          <Panel title="Details" bodyClassName="flex flex-col gap-2 text-[13px]">
            <dl className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-y-1.5">
              <dt className="text-zinc-500">Created</dt>
              <dd className="text-zinc-800">{formatDateTime(project.createdAt)}</dd>
              <dt className="text-zinc-500">Last updated</dt>
              <dd className="text-zinc-800">{formatDateTime(lastSavedAt)}</dd>
              <dt className="text-zinc-500">Published</dt>
              <dd className="text-zinc-800">{formatDateTime(project.publishedAt)}</dd>
              <dt className="text-zinc-500">Updated by</dt>
              <dd className="truncate text-zinc-800">{project.updatedByName ?? "—"}</dd>
            </dl>
            <div className="mt-2 flex flex-wrap gap-2 border-t border-zinc-100 pt-3">
              {isLive ? (
                <a
                  href={`/work/${project.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[13px] font-medium text-zinc-600 hover:text-zinc-900"
                >
                  <Icon.External size={13} /> View live
                </a>
              ) : null}
              {status !== "ARCHIVED" && !isTrashed ? (
                <button
                  type="button"
                  onClick={() => changeStatus("ARCHIVED")}
                  className="inline-flex items-center gap-1 text-[13px] font-medium text-zinc-600 hover:text-zinc-900"
                >
                  <Icon.Archive size={13} /> Archive
                </button>
              ) : null}
              {!isTrashed ? (
                <button
                  type="button"
                  onClick={moveToTrash}
                  className="inline-flex items-center gap-1 text-[13px] font-medium text-red-600 hover:text-red-700"
                >
                  <Icon.Trash size={13} /> Move to trash
                </button>
              ) : null}
            </div>
          </Panel>
        ) : null}

        <p className="hidden text-center text-xs text-zinc-400 lg:block">
          <kbd className="rounded border border-zinc-200 bg-white px-1">Ctrl</kbd> +{" "}
          <kbd className="rounded border border-zinc-200 bg-white px-1">S</kbd> to save
        </p>
      </aside>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Technology picker                                                          */
/* -------------------------------------------------------------------------- */

function TechnologyPicker({
  all,
  selected,
  onChange,
  onCreated,
}: {
  all: TechOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
  onCreated: (tech: TechOption) => void;
}) {
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const { toast } = useAdminFeedback();
  const selectedSet = new Set(selected);

  const filtered = all.filter((t) => t.name.toLowerCase().includes(query.trim().toLowerCase()));
  const groups = new Map<string, TechOption[]>();
  for (const tech of filtered) {
    const key = tech.category || "Other";
    groups.set(key, [...(groups.get(key) ?? []), tech]);
  }
  const exact = all.some((t) => t.name.toLowerCase() === query.trim().toLowerCase());

  const toggle = (id: string) =>
    onChange(selectedSet.has(id) ? selected.filter((s) => s !== id) : [...selected, id]);

  async function create() {
    const name = query.trim();
    if (!name) return;
    setCreating(true);
    const result = await saveTechnology(null, { name, slug: slugify(name), isActive: true });
    setCreating(false);
    if (result.success && result.data) {
      onCreated({ id: result.data.id, name, category: null, isActive: true });
      onChange([...selected, result.data.id]);
      setQuery("");
      toast(`Added “${name}”`);
    } else {
      toast(result.success ? "Couldn't add technology." : (result.formError ?? "Couldn't add technology."), "error");
    }
  }

  return (
    <Panel
      title="Technologies"
      description="Shown quietly on the case study — business outcomes stay the headline."
      actions={selected.length > 0 ? <Badge>{selected.length} selected</Badge> : null}
    >
      <div className="relative mb-4">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
          <Icon.Search size={14} />
        </span>
        <AdminInput
          className="pl-8"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search or add a technology…"
          aria-label="Search technologies"
          onKeyDown={(e) => {
            if (e.key === "Enter" && query.trim() && !exact) {
              e.preventDefault();
              void create();
            }
          }}
        />
      </div>
      {query.trim() && !exact ? (
        <AdminButton size="sm" className="mb-4" onClick={create} loading={creating}>
          <Icon.Plus size={14} /> Add “{query.trim()}”
        </AdminButton>
      ) : null}
      {all.length === 0 && !query ? (
        <p className="text-sm text-zinc-500">No technologies yet. Type a name above to add one.</p>
      ) : null}
      <div className="flex flex-col gap-4">
        {[...groups.entries()].map(([group, techs]) => (
          <fieldset key={group}>
            <legend className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{group}</legend>
            <div className="flex flex-wrap gap-1.5">
              {techs.map((tech) => {
                const on = selectedSet.has(tech.id);
                return (
                  <button
                    key={tech.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(tech.id)}
                    title={tech.isActive ? undefined : "Inactive — hidden on the public site"}
                    className={cn(
                      "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900",
                      on ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300",
                      !tech.isActive && "opacity-50",
                    )}
                  >
                    {on ? <Icon.Check size={12} /> : null}
                    {tech.name}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
    </Panel>
  );
}
