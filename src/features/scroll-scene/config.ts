/**
 * Homepage 3D scroll experience copy + media.
 */

export const SCROLL_SCENE_COVER = "/images/cover.png" as const;
export const SCROLL_SCENE_PROFILE = "/images/profile.png" as const;

export const SCROLL_SCENE_EYEBROW = "Immersive craft" as const;
export const SCROLL_SCENE_HEADING = "Scroll through the work." as const;

export const SCROLL_SCENE_CHAPTERS = [
  {
    id: "presence",
    label: "01 — Presence",
    title: "A face for the system",
    body: "Portrait and cover set the atmosphere — quiet confidence before the stack, the delivery, and the product story.",
  },
  {
    id: "depth",
    label: "02 — Depth",
    title: "Layers that earn their keep",
    body: "Motion should explain hierarchy: what is close, what supports, and what stays in the background.",
  },
  {
    id: "delivery",
    label: "03 — Delivery",
    title: "Built to ship, not just impress",
    body: "3D scroll is a craft tool — used to guide attention, not distract from the engineering behind it.",
  },
] as const;

export interface ScrollSceneChapter {
  readonly id: string;
  readonly label: string;
  readonly title: string;
  readonly body: string;
}

/** Leyahn's scene — rendered mirrored (media left) right after John's. */
export const LEYAHN_SCENE_COVER = "/images/team/leyahn-cover.png" as const;
export const LEYAHN_SCENE_PROFILE = "/images/team/leyahn-portrait.png" as const;
export const LEYAHN_SCENE_EYEBROW = "Secure operations" as const;
export const LEYAHN_SCENE_HEADING = "Scroll through the work." as const;

export const LEYAHN_SCENE_CHAPTERS = [
  {
    label: "01 — Access",
    title: "The right people, the right doors",
    body: "Identity & Access Management done carefully — requests, reviews, and controls that keep systems open to the right people and closed to everyone else.",
  },
  {
    label: "02 — Automation",
    title: "Repetitive work, retired",
    body: "PowerShell, Python, REST APIs, and Azure turn manual, error-prone tasks into reliable workflows that run the same way every time.",
  },
  {
    label: "03 — Assurance",
    title: "Audit-ready by default",
    body: "Accurate reports, clean evidence, and documented controls — so compliance reviews are a formality, not a fire drill.",
  },
] as const;
