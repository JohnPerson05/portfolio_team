"use client";

import { createContext, useContext } from "react";

/**
 * Signals to reveal children (e.g. {@link FadeUp}) that they are inside a
 * {@link Stagger} container. When true, children defer their reveal timing to
 * the parent (variant propagation + `staggerChildren`) instead of tracking
 * their own in-view state, so the container can orchestrate the sequence.
 */
export const StaggerContext = createContext(false);

export function useIsInsideStagger(): boolean {
  return useContext(StaggerContext);
}
