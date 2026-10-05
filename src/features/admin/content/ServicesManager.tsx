"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

import { deleteService, reorderServices, saveService, setServicePublished } from "@/actions/content";
import { imageSource } from "@/lib/images";
import type { ServiceRow } from "@/server/admin/queries";
import {
  AdminButton,
  AdminEmptyState,
  AdminInput,
  AdminTextarea,
  Badge,
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

interface ServiceForm {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  icon: string;
  image: string;
  leadLabel: string;
  isFeatured: boolean;
  isPublished: boolean;
}

const EMPTY: ServiceForm = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  icon: "",
  image: "",
  leadLabel: "",
  isFeatured: false,
  isPublished: true,
};

const toForm = (s: ServiceRow): ServiceForm => ({
  title: s.title,
  slug: s.slug,
  shortDescription: s.shortDescription,
  description: s.description ?? "",
  icon: s.icon ?? "",
  image: s.image ?? "",
  leadLabel: s.leadLabel ?? "",
  isFeatured: s.isFeatured,
  isPublished: s.isPublished,
});

export function ServicesManager({ services }: { services: ServiceRow[] }) {
  const form = useRecordForm<ServiceForm>(EMPTY);
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
      (id, v) => saveService(id, { ...v, displayOrder: id ? services.find((s) => s.id === id)?.displayOrder ?? 0 : services.length }),
      form.editingId ? "Service saved" : "Service added",
    );

  return (
    <>
      <div className="mb-4 flex justify-end">
        <AdminButton variant="primary" onClick={() => form.openNew()}>
          <Icon.Plus size={14} /> Add service
        </AdminButton>
      </div>

      {services.length === 0 ? (
        <AdminEmptyState
          icon={<Icon.Services size={20} />}
          title="No services yet."
          description="Describe what you help with, in the words a client would use."
          action={
            <AdminButton variant="primary" onClick={() => form.openNew()}>
              <Icon.Plus size={14} /> Add service
            </AdminButton>
          }
        />
      ) : (
        <SortableList
          items={services}
          onReorder={reorderServices}
          itemLabel={(s) => s.title}
          successMessage="Service order saved"
          className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
          itemClassName="bg-white"
          renderItem={(service, { handle, index }) => (
            <div className="flex items-center gap-3 px-3 py-3 sm:px-4">
              {handle}
              <span className="w-6 shrink-0 text-xs font-semibold tabular-nums text-zinc-400">{String(index + 1).padStart(2, "0")}</span>
              {service.image ? (
                <div className="relative hidden h-10 w-14 shrink-0 overflow-hidden rounded-md border border-zinc-200 sm:block">
                  <Image {...imageSource(service.image)} alt="" fill sizes="56px" className="object-cover" />
                </div>
              ) : null}
              <button type="button" onClick={() => form.openEdit(service.id, toForm(service))} className="min-w-0 flex-1 text-left">
                <span className="flex items-center gap-2">
                  <span className="truncate font-medium text-zinc-900">{service.title}</span>
                  {service.isFeatured ? <Badge tone="amber">Featured</Badge> : null}
                </span>
                <span className="mt-0.5 block truncate text-xs text-zinc-500">{service.shortDescription}</span>
              </button>
              <Switch
                size="sm"
                checked={service.isPublished}
                onChange={(v) => run(() => setServicePublished(service.id, v), { success: v ? "Service published" : "Service hidden" })}
                label={undefined}
                id={`svc-pub-${service.id}`}
              />
              <span className="sr-only">{service.isPublished ? "Published" : "Hidden"}</span>
              <RowMenu
                label={`Actions for ${service.title}`}
                items={[
                  { label: "Edit", icon: <Icon.Pen size={14} />, onSelect: () => form.openEdit(service.id, toForm(service)) },
                  {
                    label: "Delete",
                    icon: <Icon.Trash size={14} />,
                    tone: "danger",
                    onSelect: async () => {
                      if (await confirm({ title: `Delete “${service.title}”?`, description: "This can't be undone.", confirmLabel: "Delete", tone: "danger" })) {
                        run(() => deleteService(service.id), { success: "Service deleted" });
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
        title={form.editingId ? "Edit service" : "Add service"}
        onSubmit={save}
        submitting={form.submitting}
        footerExtra={<Switch size="sm" label="Published" checked={values.isPublished} onChange={(v) => set("isPublished", v)} />}
      >
        <FormField id="s-title" label="Title" required error={errors.title}>
          <AdminInput
            {...fieldProps("s-title", errors.title)}
            value={values.title}
            onChange={(e) => {
              set("title", e.target.value);
              if (!form.editingId) set("slug", slugify(e.target.value));
            }}
            placeholder="Replace the spreadsheets"
          />
        </FormField>
        <FormField id="s-slug" label="Slug" required error={errors.slug}>
          <AdminInput {...fieldProps("s-slug", errors.slug)} value={values.slug} onChange={(e) => set("slug", slugify(e.target.value))} />
        </FormField>
        <FormField id="s-short" label="The problem (client's words)" required error={errors.shortDescription} hint="Shown in quotes, e.g. “Your team runs on spreadsheets…”">
          <AdminTextarea {...fieldProps("s-short", errors.shortDescription)} rows={2} value={values.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} />
        </FormField>
        <FormField id="s-desc" label="What we do about it" error={errors.description}>
          <AdminTextarea {...fieldProps("s-desc", errors.description)} rows={4} value={values.description} onChange={(e) => set("description", e.target.value)} />
        </FormField>
        <FormField id="s-lead" label="Led by" error={errors.leadLabel} hint="Optional, e.g. “Both of us” or “Led by John”.">
          <AdminInput {...fieldProps("s-lead", errors.leadLabel)} value={values.leadLabel} onChange={(e) => set("leadLabel", e.target.value)} />
        </FormField>
        <ImageField label="Image" folder="services" value={values.image} onChange={(url) => set("image", url)} error={errors.image} hint="Optional illustration shown on the card." />
        <FormField id="s-icon" label="Icon" error={errors.icon} hint="Optional emoji or short symbol shown with the service.">
          <AdminInput {...fieldProps("s-icon", errors.icon)} value={values.icon} onChange={(e) => set("icon", e.target.value)} placeholder="✦" />
        </FormField>
        <Switch label="Featured" checked={values.isFeatured} onChange={(v) => set("isFeatured", v)} />
      </Sheet>
    </>
  );
}
