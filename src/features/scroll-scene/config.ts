/**
 * Homepage scroll-driven "How we work" scene — maps CMS process steps to the
 * chapters the scene animates through.
 */
import type { ProcessStepView } from "@/types";

/** Fallback image when the `home.processCover` setting is empty. */
export const SCROLL_SCENE_COVER = "/images/cover.png" as const;

export interface ScrollSceneChapter {
  id: string;
  /** e.g. "01 — Understand" */
  label: string;
  /** Short name shown on the project board, e.g. "Understand". */
  short: string;
  title: string;
  body: string;
}

export function toChapters(
  steps: readonly ProcessStepView[],
): ScrollSceneChapter[] {
  return steps.map((step) => ({
    id: step.id,
    label: `${String(step.stepNumber).padStart(2, "0")} — ${step.title}`,
    short: step.title,
    title: step.headline ?? step.title,
    body: step.description,
  }));
}
