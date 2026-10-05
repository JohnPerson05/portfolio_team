"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const MODES = [
  {
    id: "design",
    label: "Design",
    command: "compose(interface)",
    output: [
      "intent: clarified",
      "system: tokenized",
      "experience: responsive",
    ],
    metric: "AA",
    metricLabel: "accessible",
  },
  {
    id: "build",
    label: "Build",
    command: "ship(product)",
    output: [
      "frontend: interactive",
      "backend: resilient",
      "delivery: automated",
    ],
    metric: "95+",
    metricLabel: "performance",
  },
  {
    id: "scale",
    label: "Scale",
    command: "optimize(system)",
    output: [
      "observability: active",
      "latency: controlled",
      "capacity: elastic",
    ],
    metric: "99.9",
    metricLabel: "reliability",
  },
] as const;

export function InteractiveSystemPanel() {
  const [activeId, setActiveId] =
    useState<(typeof MODES)[number]["id"]>("build");
  const active = MODES.find((mode) => mode.id === activeId) ?? MODES[1];

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div
        aria-hidden="true"
        className="absolute -inset-10 rounded-full bg-[radial-gradient(circle,var(--accent-cool),transparent_68%)] opacity-[0.08] blur-2xl"
      />
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#090b0e]/90 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <div className="flex h-12 items-center justify-between border-b border-white/10 px-space-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          </div>
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted">
            product.system / live
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[0.65rem] text-emerald-300">
            <span className="status-pulse h-1.5 w-1.5 rounded-full bg-emerald-400" />
            ONLINE
          </span>
        </div>

        <div className="grid min-h-[24rem] sm:grid-cols-[8.5rem_1fr]">
          <div
            role="tablist"
            aria-label="Product engineering modes"
            className="flex border-b border-white/10 p-space-1 sm:flex-col sm:border-b-0 sm:border-r"
          >
            {MODES.map((mode, index) => (
              <button
                key={mode.id}
                type="button"
                role="tab"
                aria-selected={activeId === mode.id}
                onClick={() => setActiveId(mode.id)}
                className={cn(
                  "flex min-h-11 flex-1 items-center gap-space-1 rounded-md px-space-2 text-left font-mono text-caption transition-colors sm:flex-none",
                  activeId === mode.id
                    ? "bg-white/[0.07] text-text"
                    : "text-muted hover:bg-white/[0.04] hover:text-text",
                )}
              >
                <span className="hidden text-accent sm:inline">
                  0{index + 1}
                </span>
                {mode.label}
              </button>
            ))}
          </div>

          <div
            role="tabpanel"
            className="relative flex flex-col justify-between overflow-hidden p-space-3 sm:p-space-4"
          >
            <div
              aria-hidden="true"
              className="programmatic-grid absolute inset-0 opacity-30"
            />
            <div
              aria-hidden="true"
              className="scan-line bg-accent-cool/40 absolute inset-x-0 top-0 h-px"
            />

            <div className="relative">
              <p className="font-mono text-caption text-muted">
                <span className="text-accent">john@portfolio</span>
                <span className="text-text">:</span>
                <span className="text-[#72d7ff]">~/systems</span>
                <span className="text-text">$ </span>
                {active.command}
                <span className="ml-1 inline-block h-4 w-1.5 animate-pulse bg-accent align-middle" />
              </p>

              <div className="mt-space-6 space-y-space-2">
                {active.output.map((line, index) => {
                  const [key, value] = line.split(": ");
                  return (
                    <div
                      key={line}
                      className="flex items-center justify-between gap-space-2 font-mono text-caption"
                      style={{ opacity: 1 - index * 0.16 }}
                    >
                      <span className="text-muted">{key}</span>
                      <span className="flex items-center gap-space-1 text-text">
                        <span className="text-emerald-400">✓</span>
                        {value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative mt-space-8 grid grid-cols-2 gap-space-2">
              <div className="rounded-lg border border-white/10 bg-black/20 p-space-2">
                <p className="text-signal font-display text-h3 font-semibold">
                  {active.metric}
                </p>
                <p className="font-mono text-[0.65rem] uppercase tracking-wider text-muted">
                  {active.metricLabel}
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/20 p-space-2">
                <p className="font-display text-h3 font-semibold text-text">
                  &lt;1s
                </p>
                <p className="font-mono text-[0.65rem] uppercase tracking-wider text-muted">
                  interaction
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
