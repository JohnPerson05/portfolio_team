"use client";

import {
  deleteProcessStep,
  reorderProcessSteps,
  saveProcessStep,
  setProcessStepPublished,
} from "@/actions/content";
import type { ProcessStepRow } from "@/server/admin/queries";
import {
  AdminButton,
  AdminEmptyState,
  AdminInput,
  AdminTextarea,
  FormField,
  Icon,
  ImageField,
  RowMenu,
  Sheet,
  SortableList,
  Switch,
  fieldProps,
  useAdminAction,
  useAdminFeedback,
  useRecordForm,
} from "../ui";

interface StepForm {
  title: string;
  headline: string;
  description: string;
  visual: string;
  isPublished: boolean;
}

const EMPTY: StepForm = { title: "", headline: "", description: "", visual: "", isPublished: true };

const toForm = (s: ProcessStepRow): StepForm => ({
  title: s.title,
  headline: s.headline ?? "",
  description: s.description,
  visual: s.visual ?? "",
  isPublished: s.isPublished,
});

export function ProcessManager({ steps }: { steps: ProcessStepRow[] }) {
  const form = useRecordForm<StepForm>(EMPTY);
  const { run } = useAdminAction();
  const { confirm } = useAdminFeedback();
  const { values, errors, set } = form;

  return (
    <>
      <div className="mb-4 flex justify-end">
        <AdminButton variant="primary" onClick={() => form.openNew()}>
          <Icon.Plus size={14} /> Add step
        </AdminButton>
      </div>

      {steps.length === 0 ? (
        <AdminEmptyState
          icon={<Icon.Process size={20} />}
          title="No process steps yet."
          description="Walk clients through how a project goes — e.g. Discover, Shape, Build, Launch."
          action={
            <AdminButton variant="primary" onClick={() => form.openNew()}>
              <Icon.Plus size={14} /> Add step
            </AdminButton>
          }
        />
      ) : (
        <SortableList
          items={steps}
          onReorder={reorderProcessSteps}
          itemLabel={(s) => s.title}
          successMessage="Step order saved"
          className="flex flex-col gap-3"
          renderItem={(step, { handle, index }) => (
            <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              {handle}
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-sm font-semibold tabular-nums text-white">
                {String(index + 1).padStart(2, "0")}
              </span>
              <button type="button" onClick={() => form.openEdit(step.id, toForm(step))} className="min-w-0 flex-1 text-left">
                <p className="font-semibold text-zinc-900">{step.title}</p>
                {step.headline ? <p className="text-[13px] font-medium text-zinc-700">{step.headline}</p> : null}
                <p className="mt-1 line-clamp-2 text-[13px] text-zinc-500">{step.description}</p>
              </button>
              <div className="flex items-center gap-2">
                <Switch
                  size="sm"
                  id={`step-pub-${step.id}`}
                  checked={step.isPublished}
                  onChange={(v) => run(() => setProcessStepPublished(step.id, v), { success: v ? "Step shown" : "Step hidden" })}
                />
                <RowMenu
                  label={`Actions for ${step.title}`}
                  items={[
                    { label: "Edit", icon: <Icon.Pen size={14} />, onSelect: () => form.openEdit(step.id, toForm(step)) },
                    {
                      label: "Delete",
                      icon: <Icon.Trash size={14} />,
                      tone: "danger",
                      onSelect: async () => {
                        if (await confirm({ title: `Delete step “${step.title}”?`, confirmLabel: "Delete", tone: "danger" })) {
                          run(() => deleteProcessStep(step.id), { success: "Step deleted" });
                        }
                      },
                    },
                  ]}
                />
              </div>
            </div>
          )}
        />
      )}

      <Sheet
        open={form.open}
        onClose={form.close}
        title={form.editingId ? "Edit step" : "Add step"}
        onSubmit={() => form.submit(saveProcessStep, form.editingId ? "Step saved" : "Step added")}
        submitting={form.submitting}
        footerExtra={<Switch size="sm" label="Published" checked={values.isPublished} onChange={(v) => set("isPublished", v)} />}
      >
        <FormField id="p-title" label="Step name" required error={errors.title} hint="Short — shown on the progress board, e.g. “Discover”.">
          <AdminInput {...fieldProps("p-title", errors.title)} value={values.title} onChange={(e) => set("title", e.target.value)} />
        </FormField>
        <FormField id="p-headline" label="Headline" error={errors.headline} hint="Optional larger line, e.g. “We start with your business, not the code”.">
          <AdminInput {...fieldProps("p-headline", errors.headline)} value={values.headline} onChange={(e) => set("headline", e.target.value)} />
        </FormField>
        <FormField id="p-desc" label="Description" required error={errors.description}>
          <AdminTextarea {...fieldProps("p-desc", errors.description)} rows={4} value={values.description} onChange={(e) => set("description", e.target.value)} />
        </FormField>
        <ImageField label="Visual" folder="process" value={values.visual} onChange={(url) => set("visual", url)} error={errors.visual} hint="Optional image for this step." />
      </Sheet>
    </>
  );
}
