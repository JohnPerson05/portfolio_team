"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

import {
  deleteTestimonial,
  reorderTestimonials,
  saveTestimonial,
  setTestimonialFlags,
} from "@/actions/content";
import { imageSource } from "@/lib/images";
import type { TestimonialRow } from "@/server/admin/queries";
import {
  AdminButton,
  AdminEmptyState,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  Badge,
  FormField,
  Icon,
  ImageField,
  PublishedBadge,
  RowMenu,
  Sheet,
  SortableList,
  Switch,
  fieldProps,
  useAdminAction,
  useAdminFeedback,
  useRecordForm,
} from "../ui";

interface TestimonialForm {
  name: string;
  role: string;
  company: string;
  avatar: string;
  logoUrl: string;
  quote: string;
  projectId: string;
  isFeatured: boolean;
  isPublished: boolean;
}

const EMPTY: TestimonialForm = {
  name: "",
  role: "",
  company: "",
  avatar: "",
  logoUrl: "",
  quote: "",
  projectId: "",
  isFeatured: false,
  isPublished: false,
};

const toForm = (t: TestimonialRow): TestimonialForm => ({
  name: t.name,
  role: t.role,
  company: t.company ?? "",
  avatar: t.avatar ?? "",
  logoUrl: t.logoUrl ?? "",
  quote: t.quote,
  projectId: t.projectId ?? "",
  isFeatured: t.isFeatured,
  isPublished: t.isPublished,
});

export function TestimonialsManager({
  testimonials,
  projects,
}: {
  testimonials: TestimonialRow[];
  projects: { id: string; title: string; status: string }[];
}) {
  const form = useRecordForm<TestimonialForm>(EMPTY);
  const { run } = useAdminAction();
  const { confirm } = useAdminFeedback();
  const searchParams = useSearchParams();
  const { values, errors, set } = form;

  useEffect(() => {
    if (searchParams?.get("new") === "1") form.openNew();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = () =>
    form.submit(
      (id, v) =>
        saveTestimonial(id, {
          ...v,
          displayOrder: id ? testimonials.find((t) => t.id === id)?.displayOrder ?? 0 : testimonials.length,
        }),
      form.editingId ? "Testimonial saved" : "Testimonial added",
    );

  return (
    <>
      <div className="mb-4 flex justify-end">
        <AdminButton variant="primary" onClick={() => form.openNew()}>
          <Icon.Plus size={14} /> Add testimonial
        </AdminButton>
      </div>

      {testimonials.length === 0 ? (
        <AdminEmptyState
          icon={<Icon.Quote size={20} />}
          title="No testimonials yet."
          description="Add real feedback from clients and collaborators. The homepage section stays hidden until at least one is published."
          action={
            <AdminButton variant="primary" onClick={() => form.openNew()}>
              <Icon.Plus size={14} /> Add testimonial
            </AdminButton>
          }
        />
      ) : (
        <SortableList
          items={testimonials}
          onReorder={reorderTestimonials}
          itemLabel={(t) => t.name}
          successMessage="Order saved"
          className="flex flex-col gap-3"
          renderItem={(t, { handle }) => (
            <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              {handle}
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zinc-100">
                {t.avatar ? (
                  <Image {...imageSource(t.avatar)} alt="" fill sizes="40px" className="object-cover" />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-zinc-400">
                    {t.name.slice(0, 1)}
                  </span>
                )}
              </div>
              <button type="button" onClick={() => form.openEdit(t.id, toForm(t))} className="min-w-0 flex-1 text-left">
                <p className="line-clamp-2 text-sm text-zinc-800">“{t.quote}”</p>
                <p className="mt-1.5 text-xs text-zinc-500">
                  <span className="font-medium text-zinc-700">{t.name}</span> · {t.role}
                  {t.company ? `, ${t.company}` : ""}
                  {t.project ? <span className="text-zinc-400"> · about {t.project.title}</span> : null}
                </p>
                <span className="mt-2 flex flex-wrap gap-1.5">
                  <PublishedBadge published={t.isPublished} />
                  {t.isFeatured ? <Badge tone="amber">Featured</Badge> : null}
                </span>
              </button>
              <RowMenu
                label={`Actions for testimonial from ${t.name}`}
                items={[
                  { label: "Edit", icon: <Icon.Pen size={14} />, onSelect: () => form.openEdit(t.id, toForm(t)) },
                  {
                    label: t.isPublished ? "Unpublish" : "Publish",
                    icon: t.isPublished ? <Icon.EyeOff size={14} /> : <Icon.Eye size={14} />,
                    onSelect: () =>
                      run(() => setTestimonialFlags(t.id, { isPublished: !t.isPublished }), {
                        success: t.isPublished ? "Hidden from the site" : "Published",
                      }),
                  },
                  {
                    label: t.isFeatured ? "Unfeature" : "Feature",
                    icon: <Icon.Star size={14} />,
                    onSelect: () => run(() => setTestimonialFlags(t.id, { isFeatured: !t.isFeatured }), { success: "Updated" }),
                  },
                  {
                    label: "Delete",
                    icon: <Icon.Trash size={14} />,
                    tone: "danger",
                    onSelect: async () => {
                      if (await confirm({ title: `Delete testimonial from ${t.name}?`, confirmLabel: "Delete", tone: "danger" })) {
                        run(() => deleteTestimonial(t.id), { success: "Testimonial deleted" });
                      }
                    },
                  },
                ]}
              />
            </div>
          )}
        />
      )}

      <Sheet
        open={form.open}
        onClose={form.close}
        title={form.editingId ? "Edit testimonial" : "Add testimonial"}
        description="Only publish feedback you have permission to share."
        onSubmit={save}
        submitting={form.submitting}
        footerExtra={<Switch size="sm" label="Published" checked={values.isPublished} onChange={(v) => set("isPublished", v)} />}
      >
        <FormField id="t-quote" label="Quote" required error={errors.quote}>
          <AdminTextarea {...fieldProps("t-quote", errors.quote)} rows={5} value={values.quote} onChange={(e) => set("quote", e.target.value)} />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="t-name" label="Name" required error={errors.name}>
            <AdminInput {...fieldProps("t-name", errors.name)} value={values.name} onChange={(e) => set("name", e.target.value)} />
          </FormField>
          <FormField id="t-role" label="Role" required error={errors.role}>
            <AdminInput {...fieldProps("t-role", errors.role)} value={values.role} onChange={(e) => set("role", e.target.value)} placeholder="Owner" />
          </FormField>
          <FormField id="t-company" label="Company" error={errors.company}>
            <AdminInput {...fieldProps("t-company", errors.company)} value={values.company} onChange={(e) => set("company", e.target.value)} />
          </FormField>
          <FormField id="t-project" label="About project" error={errors.projectId} hint="Shown on that case study too.">
            <AdminSelect {...fieldProps("t-project", errors.projectId)} value={values.projectId} onChange={(e) => set("projectId", e.target.value)}>
              <option value="">— None —</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                  {p.status !== "PUBLISHED" ? ` (${p.status.toLowerCase()})` : ""}
                </option>
              ))}
            </AdminSelect>
          </FormField>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ImageField compact label="Photo" folder="testimonials" value={values.avatar} onChange={(url) => set("avatar", url)} error={errors.avatar} />
          <ImageField compact label="Company logo" folder="testimonials" value={values.logoUrl} onChange={(url) => set("logoUrl", url)} error={errors.logoUrl} />
        </div>
        <Switch label="Featured" description="Featured testimonials are shown first." checked={values.isFeatured} onChange={(v) => set("isFeatured", v)} />
      </Sheet>
    </>
  );
}
