"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { saveSettings } from "@/actions/site";
import type {
  SettingDefinition,
  SettingGroup,
  SettingItem,
  SettingStat,
  SiteSettings,
} from "@/server/settings/registry";
import {
  AdminButton,
  AdminInput,
  AdminTextarea,
  FormField,
  ImageField,
  ItemListEditor,
  Panel,
  StatListEditor,
  StringListEditor,
  Tabs,
  fieldProps,
  timeAgo,
  useAdminFeedback,
} from "../ui";

type Values = Record<string, unknown>;

function Control({
  def,
  value,
  onChange,
  error,
}: {
  def: SettingDefinition;
  value: unknown;
  onChange: (v: unknown) => void;
  error?: string[];
}) {
  const id = `setting-${def.key.replace(/\./g, "-")}`;
  switch (def.type) {
    case "textarea":
      return (
        <FormField id={id} label={def.label} hint={def.help} error={error}>
          <AdminTextarea {...fieldProps(id, error)} rows={3} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
        </FormField>
      );
    case "image":
      return (
        <ImageField
          label={def.label}
          hint={def.help}
          folder="settings"
          value={String(value ?? "")}
          onChange={onChange}
          error={error}
        />
      );
    case "list":
      return (
        <StringListEditor
          label={def.label}
          hint={def.help}
          value={(value as string[]) ?? []}
          onChange={onChange}
          error={error}
        />
      );
    case "items":
      return <ItemListEditor label={def.label} value={(value as SettingItem[]) ?? []} onChange={onChange} />;
    case "stats":
      return <StatListEditor value={(value as SettingStat[]) ?? []} onChange={onChange} />;
    default:
      return (
        <FormField id={id} label={def.label} hint={def.help} error={error}>
          <AdminInput
            {...fieldProps(id, error)}
            type={def.type === "email" ? "email" : "text"}
            inputMode={def.type === "url" ? "url" : undefined}
            placeholder={def.type === "url" ? "https://… or /path" : undefined}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
          />
        </FormField>
      );
  }
}

export function SettingsForm({
  definitions,
  groups,
  initial,
  updatedAt,
}: {
  definitions: SettingDefinition[];
  groups: SettingGroup[];
  initial: SiteSettings;
  updatedAt: string | null;
}) {
  const router = useRouter();
  const { toast } = useAdminFeedback();
  const [group, setGroup] = useState<SettingGroup>(groups[0] ?? "Studio");
  const [values, setValues] = useState<Values>({ ...initial });
  const [saved, setSaved] = useState<Values>({ ...initial });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);

  const dirtyKeys = useMemo(
    () => definitions.filter((d) => JSON.stringify(values[d.key]) !== JSON.stringify(saved[d.key])).map((d) => d.key),
    [definitions, values, saved],
  );

  useEffect(() => {
    if (dirtyKeys.length === 0) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirtyKeys.length]);

  async function save() {
    setSaving(true);
    const payload = Object.fromEntries(dirtyKeys.map((k) => [k, values[k]]));
    const result = await saveSettings(payload).catch(() => null);
    setSaving(false);
    if (!result) return toast("Couldn't reach the server. Try again.", "error");
    if (!result.success) {
      setErrors(result.fieldErrors ?? {});
      const firstKey = Object.keys(result.fieldErrors ?? {})[0];
      const firstGroup = definitions.find((d) => d.key === firstKey)?.group;
      if (firstGroup) setGroup(firstGroup);
      return toast(result.formError ?? "Please fix the highlighted fields.", "error");
    }
    setErrors({});
    setSaved({ ...values });
    toast("Settings saved — the site is updated");
    router.refresh();
  }

  const dirtyByGroup = (g: SettingGroup) => definitions.filter((d) => d.group === g && dirtyKeys.includes(d.key)).length;

  return (
    <>
      <Tabs<SettingGroup>
        label="Settings groups"
        active={group}
        onChange={setGroup}
        tabs={groups.map((g) => ({
          id: g,
          label: g,
          badge: dirtyByGroup(g) ? <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-label="unsaved changes" /> : null,
        }))}
      />
      <div className="mt-5" role="tabpanel" id={`panel-${group}`} aria-labelledby={`tab-${group}`}>
        <Panel bodyClassName="grid gap-5">
          {definitions
            .filter((d) => d.group === group)
            .map((def) => (
              <Control
                key={def.key}
                def={def}
                value={values[def.key]}
                error={errors[def.key]}
                onChange={(v) => {
                  setValues((current) => ({ ...current, [def.key]: v }));
                  setErrors(({ [def.key]: _drop, ...rest }) => rest);
                }}
              />
            ))}
        </Panel>
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 mt-6 flex items-center justify-between gap-3 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:mx-0 lg:rounded-xl lg:border">
        <p className="text-xs text-zinc-500">
          {dirtyKeys.length > 0
            ? `${dirtyKeys.length} unsaved change${dirtyKeys.length === 1 ? "" : "s"}`
            : updatedAt
              ? `Last saved ${timeAgo(updatedAt)}`
              : "All changes saved"}
        </p>
        <div className="flex gap-2">
          <AdminButton disabled={dirtyKeys.length === 0 || saving} onClick={() => setValues({ ...saved })}>
            Discard
          </AdminButton>
          <AdminButton variant="primary" loading={saving} disabled={dirtyKeys.length === 0} onClick={save}>
            Save settings
          </AdminButton>
        </div>
      </div>
    </>
  );
}
