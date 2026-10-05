"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import type { ProjectView } from "@/types";
import { projectCategories } from "./config";
import { ProjectCard } from "./ProjectCard";

/**
 * The `/work` archive: every published project, filterable by category. The
 * filter is client-side (the full list is already on the page) and animates
 * cards in and out with a shared layout.
 */
export function WorkShowcase({ projects }: { projects: readonly ProjectView[] }) {
  const reducedMotion = useReducedMotion();
  const categories = useMemo(() => projectCategories(projects), [projects]);
  const [active, setActive] = useState<string | null>(null);
  const visible = active ? projects.filter((p) => p.category === active) : projects;

  return (
    <div className="flex flex-col gap-space-6">
      {categories.length > 1 ? (
        <div role="group" aria-label="Filter by type" className="flex flex-wrap gap-space-1">
          {[null, ...categories].map((category) => {
            const selected = active === category;
            const count = category ? projects.filter((p) => p.category === category).length : projects.length;
            return (
              <button
                key={category ?? "all"}
                type="button"
                aria-pressed={selected}
                onClick={() => setActive(category)}
                className={cn(
                  "inline-flex min-h-11 items-center gap-space-1 rounded-full border px-space-3 font-mono text-[0.68rem] uppercase tracking-[0.14em] transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                  selected
                    ? "border-accent/60 bg-accent/10 text-accent"
                    : "border-white/10 text-muted hover:border-white/25 hover:text-text",
                )}
              >
                {category ?? "All work"}
                <span className="text-[0.6rem] opacity-60">{count}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      <motion.ul layout={!reducedMotion} className="grid gap-space-4 md:grid-cols-2">
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((project, index) => (
            <motion.li
              key={project.id}
              layout={!reducedMotion}
              initial={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="h-full list-none"
            >
              <ProjectCard project={project} priority={index < 2} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
