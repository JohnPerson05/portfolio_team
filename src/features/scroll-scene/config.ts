/**
 * Homepage scroll-driven "How we work" scene — copy + media.
 *
 * The process copy is sourced from the studio config so it can be edited in
 * one place (`features/studio/config.ts`).
 */
import { PROCESS } from "@/features/studio/config";

export const SCROLL_SCENE_COVER = "/images/cover.png" as const;

export const SCROLL_SCENE_EYEBROW = PROCESS.eyebrow;
export const SCROLL_SCENE_HEADING = PROCESS.heading;

export const SCROLL_SCENE_CHAPTERS = PROCESS.steps;

export type ScrollSceneChapter = (typeof SCROLL_SCENE_CHAPTERS)[number];
