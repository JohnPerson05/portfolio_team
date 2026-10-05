"use client";

import { useId, useState } from "react";

import { Icon } from "./icons";
import { AdminButton, AdminInput, AdminTextarea } from "./primitives";

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item as T);
  return next;
}

function RowControls({
  index,
  total,
  onMove,
  onRemove,
  label,
}: {
  index: number;
  total: number;
  onMove: (to: number) => void;
  onRemove: () => void;
  label: string;
}) {
  const btn =
    "flex h-8 w-7 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent";
  return (
    <div className="flex shrink-0 items-center">
      <button type="button" className={btn} disabled={index === 0} onClick={() => onMove(index - 1)} aria-label={`Move ${label} up`}>
        <Icon.ChevronUp size={14} />
      </button>
      <button type="button" className={btn} disabled={index === total - 1} onClick={() => onMove(index + 1)} aria-label={`Move ${label} down`}>
        <Icon.ChevronDown size={14} />
      </button>
      <button type="button" className={`${btn} hover:text-red-600`} onClick={onRemove} aria-label={`Remove ${label}`}>
        <Icon.X size={14} />
      </button>
    </div>
  );
}

/** Edit an ordered list of short strings (skills, bullet points, chips). */
export function StringListEditor({
  label,
  value,
  onChange,
  placeholder = "Add an item…",
  hint,
  max = 30,
  error,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  hint?: string;
  max?: number;
  error?: string | string[];
}) {
  const id = useId();
  const [draft, setDraft] = useState("");
  const message = Array.isArray(error) ? error[0] : error;

  function add() {
    const text = draft.trim();
    if (!text || value.length >= max) return;
    onChange([...value, text]);
    setDraft("");
  }

  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-[13px] font-medium text-zinc-800">{label}</legend>
      {value.length > 0 ? (
        <ul className="flex flex-col divide-y divide-zinc-100 rounded-md border border-zinc-200 bg-white">
          {value.map((item, index) => (
            <li key={`${index}-${item}`} className="flex items-center gap-2 py-1 pl-3 pr-1">
              <AdminInput
                value={item}
                aria-label={`${label} ${index + 1}`}
                className="h-8 border-transparent shadow-none focus:border-zinc-300"
                onChange={(event) => onChange(value.map((v, i) => (i === index ? event.target.value : v)))}
              />
              <RowControls
                index={index}
                total={value.length}
                label={item || `item ${index + 1}`}
                onMove={(to) => onChange(move(value, index, to))}
                onRemove={() => onChange(value.filter((_, i) => i !== index))}
              />
            </li>
          ))}
        </ul>
      ) : null}
      <div className="flex gap-2">
        <AdminInput
          id={id}
          value={draft}
          placeholder={placeholder}
          aria-label={`New ${label.toLowerCase()} item`}
          disabled={value.length >= max}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
        />
        <AdminButton onClick={add} disabled={!draft.trim() || value.length >= max}>
          <Icon.Plus size={14} /> Add
        </AdminButton>
      </div>
      {message ? (
        <p role="alert" className="text-xs font-medium text-red-600">{message}</p>
      ) : hint ? (
        <p className="text-xs text-zinc-500">{hint}</p>
      ) : null}
    </fieldset>
  );
}

/** Edit an ordered list of { title, body } pairs. */
export function ItemListEditor({
  label,
  value,
  onChange,
  max = 12,
  bodyLabel = "Text",
}: {
  label: string;
  value: { title: string; body: string }[];
  onChange: (value: { title: string; body: string }[]) => void;
  max?: number;
  bodyLabel?: string;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1.5 text-[13px] font-medium text-zinc-800">{label}</legend>
      {value.map((item, index) => (
        <div key={index} className="flex gap-2 rounded-md border border-zinc-200 bg-white p-3">
          <span className="mt-2 w-5 shrink-0 text-xs font-medium text-zinc-400">{String(index + 1).padStart(2, "0")}</span>
          <div className="flex flex-1 flex-col gap-2">
            <AdminInput
              value={item.title}
              placeholder="Title"
              aria-label={`${label} ${index + 1} title`}
              onChange={(event) => onChange(value.map((v, i) => (i === index ? { ...v, title: event.target.value } : v)))}
            />
            <AdminTextarea
              rows={2}
              value={item.body}
              placeholder={bodyLabel}
              aria-label={`${label} ${index + 1} ${bodyLabel.toLowerCase()}`}
              onChange={(event) => onChange(value.map((v, i) => (i === index ? { ...v, body: event.target.value } : v)))}
            />
          </div>
          <RowControls
            index={index}
            total={value.length}
            label={item.title || `item ${index + 1}`}
            onMove={(to) => onChange(move(value, index, to))}
            onRemove={() => onChange(value.filter((_, i) => i !== index))}
          />
        </div>
      ))}
      <div>
        <AdminButton size="sm" disabled={value.length >= max} onClick={() => onChange([...value, { title: "", body: "" }])}>
          <Icon.Plus size={14} /> Add item
        </AdminButton>
      </div>
    </fieldset>
  );
}

/** Edit an ordered list of headline numbers. */
export function StatListEditor({
  value,
  onChange,
}: {
  value: { label: string; value: number; suffix?: string }[];
  onChange: (value: { label: string; value: number; suffix?: string }[]) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1.5 text-[13px] font-medium text-zinc-800">Numbers</legend>
      {value.map((stat, index) => (
        <div key={index} className="flex flex-wrap items-center gap-2 rounded-md border border-zinc-200 bg-white p-2 sm:flex-nowrap">
          <AdminInput
            type="number"
            min={0}
            className="w-24"
            value={Number.isFinite(stat.value) ? stat.value : 0}
            aria-label={`Number ${index + 1} value`}
            onChange={(event) =>
              onChange(value.map((v, i) => (i === index ? { ...v, value: Number(event.target.value) } : v)))
            }
          />
          <AdminInput
            className="w-16"
            placeholder="+"
            value={stat.suffix ?? ""}
            aria-label={`Number ${index + 1} suffix`}
            onChange={(event) => onChange(value.map((v, i) => (i === index ? { ...v, suffix: event.target.value } : v)))}
          />
          <AdminInput
            className="min-w-0 flex-1"
            placeholder="Label"
            value={stat.label}
            aria-label={`Number ${index + 1} label`}
            onChange={(event) => onChange(value.map((v, i) => (i === index ? { ...v, label: event.target.value } : v)))}
          />
          <RowControls
            index={index}
            total={value.length}
            label={stat.label || `number ${index + 1}`}
            onMove={(to) => onChange(move(value, index, to))}
            onRemove={() => onChange(value.filter((_, i) => i !== index))}
          />
        </div>
      ))}
      <div>
        <AdminButton size="sm" disabled={value.length >= 12} onClick={() => onChange([...value, { label: "", value: 0 }])}>
          <Icon.Plus size={14} /> Add number
        </AdminButton>
      </div>
    </fieldset>
  );
}
