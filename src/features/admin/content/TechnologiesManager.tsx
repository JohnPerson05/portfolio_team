"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

import {
  deleteTechnology,
  reorderTechnologies,
  saveTechnology,
  setTechnologyActive,
} from "@/actions/content";
import { imageSource } from "@/lib/images";
import type { TechnologyRow } from "@/server/admin/queries";
import {
  AdminButton,
  AdminEmptyState,
  AdminInput,
  FormField,
  Icon,
  ImageField,
  RowMenu,
  Sheet,
  SortableList,
  Switch,
  fieldProps,
  slugify,
  useAdminAction,
  useAdminFeedback,
  useRecordForm,
} from "../ui";

interface TechForm {
  name: string;
  slug: string;
  icon: string;
  category: string;
  isActive: boolean;
}

const EMPTY: TechForm = { name: "", slug: "", icon: "", category: "", isActive: true };

const toForm = (t: TechnologyRow): TechForm => ({
  name: t.name,
  slug: t.slug,
  icon: t.icon ?? "",
  category: t.category ?? "",
  isActive: t.isActive,
});

export function TechnologiesManager({ technologies }: { technologies: TechnologyRow[] }) {
  const form = useRecordForm<TechForm>(EMPTY);
  const { run } = useAdminAction();
  const { confirm } = useAdminFeedback();
  const [query, setQuery] = useState("");
  const { values, errors, set } = form;

  const categories = useMemo(
    () => [...new Set(technologies.map((t) => t.category).filter((c): c is string => !!c))].sort(),
    [technologies],
  );
  const q = query.trim().toLowerCase();
  const filtered = q
    ? technologies.filter((t) => t.name.toLowerCase().includes(q) || (t.category ?? "").toLowerCase().includes(q))
    : technologies;

  const row = (tech: TechnologyRow, handle?: React.ReactNode) => (
    <div className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
      {handle ?? <span className="w-6" />}
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-zinc-200 bg-zinc-50">
        {tech.icon ? (
          <Image {...imageSource(tech.icon)} alt="" fill sizes="32px" className="object-contain p-1" />
        ) : (
          <span className="text-xs font-semibold text-zinc-400">{tech.name.slice(0, 2)}</span>
        )}
      </div>
      <button type="button" onClick={() => form.openEdit(tech.id, toForm(tech))} className="min-w-0 flex-1 text-left">
        <span className={`block truncate text-sm font-medium ${tech.isActive ? "text-zinc-900" : "text-zinc-400 line-through"}`}>
          {tech.name}
        </span>
        <span className="block text-xs text-zinc-500">
          {tech.category ?? "Uncategorized"} · {tech.projectCount} project{tech.projectCount === 1 ? "" : "s"}
        </span>
      </button>
      <Switch
        size="sm"
        id={`tech-${tech.id}`}
        checked={tech.isActive}
        onChange={(v) => run(() => setTechnologyActive(tech.id, v), { success: v ? "Activated" : "Deactivated — hidden on the site" })}
      />
      <RowMenu
        label={`Actions for ${tech.name}`}
        items={[
          { label: "Edit", icon: <Icon.Pen size={14} />, onSelect: () => form.openEdit(tech.id, toForm(tech)) },
          {
            label: "Delete",
            icon: <Icon.Trash size={14} />,
            tone: "danger",
            onSelect: async () => {
              if (
                await confirm({
                  title: `Delete “${tech.name}”?`,
                  description:
                    tech.projectCount > 0
                      ? `It will be removed from ${tech.projectCount} project${tech.projectCount === 1 ? "" : "s"}. Deactivating hides it without losing the links.`
                      : "This can't be undone.",
                  confirmLabel: "Delete",
                  tone: "danger",
                })
              ) {
                run(() => deleteTechnology(tech.id), { success: "Technology deleted" });
              }
            },
          },
        ]}
      />
    </div>
  );

  return (
    <>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-72">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
            <Icon.Search size={14} />
          </span>
          <AdminInput className="pl-8" placeholder="Filter…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Filter technologies" />
        </div>
        <AdminButton variant="primary" onClick={() => form.openNew()}>
          <Icon.Plus size={14} /> Add technology
        </AdminButton>
      </div>

      {technologies.length === 0 ? (
        <AdminEmptyState
          icon={<Icon.Code size={20} />}
          title="No technologies yet."
          description="Add the tools you build with, then tag them on projects."
          action={
            <AdminButton variant="primary" onClick={() => form.openNew()}>
              <Icon.Plus size={14} /> Add technology
            </AdminButton>
          }
        />
      ) : q ? (
        <ul className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          {filtered.map((tech) => (
            <li key={tech.id}>{row(tech)}</li>
          ))}
          {filtered.length === 0 ? <li className="px-4 py-6 text-center text-sm text-zinc-500">No matches.</li> : null}
        </ul>
      ) : (
        <SortableList
          items={technologies}
          onReorder={reorderTechnologies}
          itemLabel={(t) => t.name}
          successMessage="Order saved"
          className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
          itemClassName="bg-white"
          renderItem={(tech, { handle }) => row(tech, handle)}
        />
      )}

      <Sheet
        open={form.open}
        onClose={form.close}
        title={form.editingId ? "Edit technology" : "Add technology"}
        onSubmit={() => form.submit(saveTechnology, form.editingId ? "Technology saved" : "Technology added")}
        submitting={form.submitting}
        footerExtra={<Switch size="sm" label="Active" checked={values.isActive} onChange={(v) => set("isActive", v)} />}
      >
        <FormField id="tech-name" label="Name" required error={errors.name}>
          <AdminInput
            {...fieldProps("tech-name", errors.name)}
            value={values.name}
            onChange={(e) => {
              set("name", e.target.value);
              if (!form.editingId) set("slug", slugify(e.target.value));
            }}
            placeholder="Spring Boot"
          />
        </FormField>
        <FormField id="tech-slug" label="Slug" required error={errors.slug}>
          <AdminInput {...fieldProps("tech-slug", errors.slug)} value={values.slug} onChange={(e) => set("slug", slugify(e.target.value))} />
        </FormField>
        <FormField id="tech-cat" label="Category" error={errors.category} hint="Frontend, Backend, Database, Cloud…">
          <AdminInput {...fieldProps("tech-cat", errors.category)} list="tech-categories" value={values.category} onChange={(e) => set("category", e.target.value)} />
          <datalist id="tech-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </FormField>
        <ImageField compact label="Icon" folder="technologies" value={values.icon} onChange={(url) => set("icon", url)} error={errors.icon} hint="SVG or PNG logo (optional)." />
      </Sheet>
    </>
  );
}
