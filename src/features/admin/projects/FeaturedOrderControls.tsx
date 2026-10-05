"use client";

import { useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { ProjectView } from "@/types";
import { reorderFeatured } from "@/actions/projects";
import {
  FEATURED_DESCRIPTION,
  FEATURED_HEADING,
  FEATURED_MOVE_DOWN_LABEL,
  FEATURED_MOVE_UP_LABEL,
  FEATURED_SAVE_LABEL,
  FEATURED_SAVING_LABEL,
  MAX_FEATURED,
  MIN_FEATURED,
  PROJECT_GENERIC_ERROR,
} from "./config";

export interface FeaturedOrderControlsProps {
  /** All projects, used to build the selectable set. */
  projects: readonly ProjectView[];
  className?: string;
}

/** Move the item at `index` by `delta` positions, returning a new array. */
function move<T>(items: T[], index: number, delta: number): T[] {
  const target = index + delta;
  if (
    index < 0 ||
    index >= items.length ||
    target < 0 ||
    target >= items.length
  ) {
    return items;
  }
  const next = [...items];
  const [item] = next.splice(index, 1) as [T];
  next.splice(target, 0, item);
  return next;
}

/**
 * `FeaturedOrderControls` — choose which 3–6 projects are featured on the public
 * homepage and set their display order (Requirement 10.5; Property 1).
 *
 * The owner toggles projects into the featured list and reorders them with
 * up/down controls; "Save featured order" calls {@link reorderFeatured} with the
 * ordered ids. The server action enforces the 3–6 bound authoritatively, but
 * this UI also disables Save and shows a hint when the selection is outside the
 * bound so the owner gets immediate feedback.
 *
 * Ordering maps directly to the array position — index 0 renders first on the
 * public site — so the chosen sequence is exactly what visitors see.
 */
export function FeaturedOrderControls({
  projects,
  className,
}: FeaturedOrderControlsProps) {
  const router = useRouter();
  const statusId = useId();

  const projectById = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects],
  );

  // Initial featured order: currently-featured projects, ordered by `order`.
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    projects
      .filter((project) => project.featured)
      .sort((a, b) => a.order - b.order)
      .map((project) => project.id),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [saved, setSaved] = useState(false);

  const selectedSet = new Set(selectedIds);
  const available = projects.filter((project) => !selectedSet.has(project.id));

  const withinBound =
    selectedIds.length >= MIN_FEATURED && selectedIds.length <= MAX_FEATURED;

  const resetFeedback = () => {
    if (error) setError(undefined);
    if (saved) setSaved(false);
  };

  const addToFeatured = (id: string) => {
    resetFeedback();
    setSelectedIds((current) =>
      current.includes(id) ? current : [...current, id],
    );
  };

  const removeFromFeatured = (id: string) => {
    resetFeedback();
    setSelectedIds((current) => current.filter((item) => item !== id));
  };

  const reorder = (index: number, delta: number) => {
    resetFeedback();
    setSelectedIds((current) => move(current, index, delta));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(undefined);
    setSaved(false);
    try {
      const result = await reorderFeatured(selectedIds);
      if (result.success) {
        setSaved(true);
        router.refresh();
      } else {
        setError(result.formError ?? PROJECT_GENERIC_ERROR);
      }
    } catch {
      setError(PROJECT_GENERIC_ERROR);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      aria-label={FEATURED_HEADING}
      className={cn("flex flex-col gap-space-4", className)}
    >
      <div className="flex flex-col gap-space-1">
        <h2 className="font-display text-h3 font-semibold text-text">
          {FEATURED_HEADING}
        </h2>
        <p className="font-sans text-body text-muted">{FEATURED_DESCRIPTION}</p>
      </div>

      {/* Selected / featured list, in display order. */}
      <ol className="flex flex-col gap-space-2" aria-label="Featured projects">
        {selectedIds.length === 0 ? (
          <li className="font-sans text-body text-muted">
            No featured projects selected.
          </li>
        ) : (
          selectedIds.map((id, index) => {
            const project = projectById.get(id);
            if (!project) return null;
            return (
              <li
                key={id}
                className="flex items-center justify-between gap-space-2 rounded-lg border border-hairline bg-bg-secondary px-space-3 py-space-2"
              >
                <span className="flex items-center gap-space-2 font-sans text-body text-text">
                  <span aria-hidden="true" className="text-muted">
                    {index + 1}.
                  </span>
                  {project.title}
                </span>
                <span className="flex items-center gap-space-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => reorder(index, -1)}
                    disabled={index === 0}
                    aria-label={`${FEATURED_MOVE_UP_LABEL}: ${project.title}`}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => reorder(index, 1)}
                    disabled={index === selectedIds.length - 1}
                    aria-label={`${FEATURED_MOVE_DOWN_LABEL}: ${project.title}`}
                  >
                    ↓
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeFromFeatured(id)}
                    aria-label={`Remove from featured: ${project.title}`}
                  >
                    Remove
                  </Button>
                </span>
              </li>
            );
          })
        )}
      </ol>

      {/* Available (non-featured) projects to add. */}
      {available.length > 0 ? (
        <div className="flex flex-col gap-space-2">
          <h3 className="font-sans text-caption font-medium uppercase tracking-wide text-muted">
            Add to featured
          </h3>
          <ul className="flex flex-wrap gap-space-2">
            {available.map((project) => (
              <li key={project.id}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addToFeatured(project.id)}
                  aria-label={`Add to featured: ${project.title}`}
                >
                  + {project.title}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div id={statusId} className="min-h-[1.5rem]">
        {!withinBound ? (
          <p className="font-sans text-caption text-muted">
            Select between {MIN_FEATURED} and {MAX_FEATURED} projects to feature.
          </p>
        ) : null}
        {error ? (
          <p
            role="alert"
            className="font-sans text-body font-medium text-red-400"
          >
            {error}
          </p>
        ) : null}
        {saved ? (
          <p
            role="status"
            className="font-sans text-body font-medium text-emerald-400"
          >
            Featured order saved.
          </p>
        ) : null}
      </div>

      <div>
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={handleSave}
          disabled={saving || !withinBound}
        >
          {saving ? FEATURED_SAVING_LABEL : FEATURED_SAVE_LABEL}
        </Button>
      </div>
    </section>
  );
}
