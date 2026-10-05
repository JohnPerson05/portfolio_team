"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { saveNavigation } from "@/actions/site";
import type { NavigationRow } from "@/server/admin/queries";
import { AdminButton, AdminInput, Icon, Panel, SortableList, Switch, useAdminFeedback } from "../ui";

type Item = NavigationRow & { key: string };

let counter = 0;
const key = () => `nav-${Date.now()}-${(counter += 1)}`;

function NavList({
  title,
  description,
  items,
  onChange,
}: {
  title: string;
  description: string;
  items: Item[];
  onChange: (items: Item[]) => void;
}) {
  const update = (k: string, patch: Partial<Item>) => onChange(items.map((i) => (i.key === k ? { ...i, ...patch } : i)));
  return (
    <Panel title={title} description={description}>
      {items.length === 0 ? <p className="mb-3 text-sm text-zinc-500">No links.</p> : null}
      <SortableList
        items={items.map((i) => ({ ...i, id: i.key }))}
        itemLabel={(i) => i.label || "link"}
        successMessage=""
        onReorder={async (ids) => {
          const byKey = new Map(items.map((i) => [i.key, i]));
          onChange(ids.map((id) => byKey.get(id)).filter((i): i is Item => !!i));
          return { success: true };
        }}
        className="flex flex-col gap-2"
        renderItem={(item, { handle }) => (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-200 bg-white p-2 sm:flex-nowrap">
            {handle}
            <AdminInput className="min-w-[8rem] flex-1" value={item.label} placeholder="Label" aria-label="Link label" onChange={(e) => update(item.key, { label: e.target.value })} />
            <AdminInput className="min-w-[10rem] flex-[1.4]" value={item.href} placeholder="/work or https://…" aria-label="Link URL" onChange={(e) => update(item.key, { href: e.target.value })} />
            <Switch size="sm" id={`vis-${item.key}`} checked={item.isVisible} onChange={(v) => update(item.key, { isVisible: v })} />
            <button
              type="button"
              aria-label={`Remove ${item.label || "link"}`}
              onClick={() => onChange(items.filter((i) => i.key !== item.key))}
              className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-red-50 hover:text-red-600"
            >
              <Icon.Trash size={14} />
            </button>
          </div>
        )}
      />
      <AdminButton
        size="sm"
        className="mt-3"
        onClick={() => onChange([...items, { key: key(), label: "", href: "/", location: items[0]?.location ?? "HEADER", isVisible: true }])}
      >
        <Icon.Plus size={14} /> Add link
      </AdminButton>
    </Panel>
  );
}

export function NavigationEditor({ initial }: { initial: NavigationRow[] }) {
  const router = useRouter();
  const { toast } = useAdminFeedback();
  const [header, setHeader] = useState<Item[]>(initial.filter((i) => i.location === "HEADER").map((i, idx) => ({ ...i, key: `header-${idx}` })));
  const [footer, setFooter] = useState<Item[]>(initial.filter((i) => i.location === "FOOTER").map((i, idx) => ({ ...i, key: `footer-${idx}` })));
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const payload = [
      ...header.map(({ key: _k, ...i }) => ({ ...i, location: "HEADER" as const })),
      ...footer.map(({ key: _k, ...i }) => ({ ...i, location: "FOOTER" as const })),
    ];
    const result = await saveNavigation(payload).catch(() => null);
    setSaving(false);
    if (result?.success) {
      toast("Navigation saved");
      router.refresh();
    } else {
      const first = result?.fieldErrors ? Object.values(result.fieldErrors)[0]?.[0] : undefined;
      toast(first ? `A link is invalid: ${first}` : (result?.formError ?? "Couldn't save navigation."), "error");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <NavList title="Header" description="Main menu, top of every page (and the mobile menu)." items={header} onChange={setHeader} />
      <NavList title="Footer — “Behind the studio”" description="Secondary links in the footer." items={footer} onChange={setFooter} />
      <div className="flex justify-end">
        <AdminButton variant="primary" loading={saving} onClick={save}>
          Save navigation
        </AdminButton>
      </div>
    </div>
  );
}
