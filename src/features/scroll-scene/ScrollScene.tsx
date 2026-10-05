"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";
import {
  SCROLL_SCENE_CHAPTERS,
  SCROLL_SCENE_COVER,
  SCROLL_SCENE_EYEBROW,
  SCROLL_SCENE_HEADING,
  type ScrollSceneChapter,
} from "./config";

function ChapterPanel({
  chapter,
  index,
  progress,
  reducedMotion,
}: {
  chapter: ScrollSceneChapter;
  index: number;
  progress: MotionValue<number>;
  reducedMotion: boolean;
}) {
  const start = index / SCROLL_SCENE_CHAPTERS.length;
  const mid = (index + 0.45) / SCROLL_SCENE_CHAPTERS.length;
  const end = (index + 1) / SCROLL_SCENE_CHAPTERS.length;

  const opacity = useTransform(
    progress,
    [start, mid, end],
    reducedMotion ? (index === 0 ? [1, 1, 1] : [0, 0, 0]) : [0, 1, 0],
  );
  const y = useTransform(
    progress,
    [start, mid, end],
    reducedMotion ? [0, 0, 0] : [28, 0, -28],
  );

  return (
    <motion.div
      style={{ opacity, y }}
      className={cn(
        "absolute inset-0 flex flex-col justify-center",
        index === 0 && reducedMotion ? "relative" : "",
      )}
      aria-hidden={reducedMotion ? index !== 0 : undefined}
    >
      <p className="font-mono text-caption uppercase tracking-[0.18em] text-accent">
        {chapter.label}
      </p>
      <h3 className="mt-space-2 font-display text-h2 font-semibold tracking-[-0.03em] text-text">
        {chapter.title}
      </h3>
      <p className="mt-space-3 text-pretty font-sans text-body leading-relaxed text-muted">
        {chapter.body}
      </p>
    </motion.div>
  );
}

/** One row in the floating "project board" — lights up as its step is reached. */
function StepRow({
  chapter,
  index,
  progress,
  reducedMotion,
}: {
  chapter: ScrollSceneChapter;
  index: number;
  progress: MotionValue<number>;
  reducedMotion: boolean;
}) {
  const total = SCROLL_SCENE_CHAPTERS.length;
  const reached = (index + 0.15) / total;
  const fill = useTransform(
    progress,
    [Math.max(0, reached - 0.08), reached],
    reducedMotion ? [1, 1] : [0, 1],
  );
  const dim = useTransform(fill, [0, 1], [0.45, 1]);

  return (
    <motion.li
      style={{ opacity: dim }}
      className="flex items-center gap-space-2 rounded-lg border border-white/10 bg-white/[0.03] px-space-2 py-space-1"
    >
      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/20">
        <motion.span
          style={{ scale: fill, opacity: fill }}
          className="absolute inset-[3px] rounded-full bg-accent"
        />
      </span>
      <span className="truncate font-sans text-[0.78rem] text-text">
        {chapter.label.split("— ")[1] ?? chapter.label}
      </span>
      <motion.span
        style={{ opacity: fill }}
        className="ml-auto font-mono text-[0.55rem] uppercase tracking-wider text-emerald-300"
      >
        Done
      </motion.span>
    </motion.li>
  );
}

/** A small, abstract "your project" board that fills in as the visitor scrolls. */
function ProjectBoard({
  progress,
  reducedMotion,
}: {
  progress: MotionValue<number>;
  reducedMotion: boolean;
}) {
  const barWidth = useTransform(
    progress,
    [0, 0.95],
    reducedMotion ? ["100%", "100%"] : ["6%", "100%"],
  );

  return (
    <div className="flex h-full w-full flex-col gap-space-2 bg-[#0b0e12]/95 p-space-3 backdrop-blur">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-muted">
          Your project
        </p>
        <span className="flex items-center gap-1.5 font-mono text-[0.55rem] uppercase tracking-wider text-emerald-300">
          <span className="status-pulse h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Live
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          style={{ width: barWidth }}
          className="h-full rounded-full bg-gradient-to-r from-[var(--accent-cool)] to-accent"
        />
      </div>
      <ul className="mt-space-1 flex flex-col gap-space-1">
        {SCROLL_SCENE_CHAPTERS.map((chapter, index) => (
          <StepRow
            key={chapter.id}
            chapter={chapter}
            index={index}
            progress={progress}
            reducedMotion={reducedMotion}
          />
        ))}
      </ul>
    </div>
  );
}

/**
 * Sticky, scroll-driven "How we work" scene for the homepage.
 *
 * A tall track pins a perspective stage; a cover plane and a small "your
 * project" board move on separate depth planes while each process step fades
 * through and ticks off as the visitor scrolls.
 * Honors `prefers-reduced-motion` by freezing to a readable static composition.
 */
export function ScrollScene({ className }: { className?: string }) {
  const trackRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion() === true;
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  const coverRotateY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reducedMotion ? [0, 0, 0] : [-18, -6, 10],
  );
  const coverRotateX = useTransform(
    scrollYProgress,
    [0, 1],
    reducedMotion ? [0, 0] : [8, -4],
  );
  const coverZ = useTransform(
    scrollYProgress,
    [0, 1],
    reducedMotion ? [0, 0] : [-180, -40],
  );
  const coverScale = useTransform(
    scrollYProgress,
    [0, 1],
    reducedMotion ? [1, 1] : [1.12, 1],
  );

  const profileRotateY = useTransform(
    scrollYProgress,
    [0, 0.45, 1],
    reducedMotion ? [0, 0, 0] : [22, 4, -12],
  );
  const profileRotateX = useTransform(
    scrollYProgress,
    [0, 1],
    reducedMotion ? [0, 0] : [-6, 8],
  );
  const profileZ = useTransform(
    scrollYProgress,
    [0, 0.55, 1],
    reducedMotion ? [0, 0, 0] : [40, 140, 220],
  );
  const profileX = useTransform(
    scrollYProgress,
    [0, 1],
    reducedMotion ? ["0%", "0%"] : ["18%", "-2%"],
  );
  const profileY = useTransform(
    scrollYProgress,
    [0, 1],
    reducedMotion ? ["8%", "8%"] : ["18%", "2%"],
  );

  const ringScale = useTransform(
    scrollYProgress,
    [0, 1],
    reducedMotion ? [1, 1] : [0.85, 1.15],
  );
  const ringOpacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    reducedMotion ? [0.2, 0.2, 0.2, 0.2] : [0.15, 0.35, 0.3, 0.12],
  );
  const innerRingScale = useTransform(ringScale, (value) => value * 0.82);
  const innerRingOpacity = useTransform(ringOpacity, (value) => value * 0.7);

  const headingId = "scroll-scene-heading";

  return (
    <section
      ref={trackRef}
      id="process"
      aria-labelledby={headingId}
      className={cn("relative w-full", className)}
      style={{ height: reducedMotion ? "auto" : "340vh" }}
    >
      <div
        className={cn(
          "relative flex w-full items-center overflow-hidden",
          reducedMotion
            ? "min-h-[calc(100svh-4rem)] py-space-12"
            : "sticky top-16 h-[calc(100svh-4rem)]",
        )}
      >
        <div aria-hidden="true" className="absolute inset-0 bg-bg">
          <div className="from-bg via-bg-secondary/80 absolute inset-0 bg-gradient-to-b to-bg" />
          <div className="programmatic-grid absolute inset-0 opacity-30" />
        </div>

        <div className="relative mx-auto grid w-full max-w-content items-center gap-space-8 px-space-2 sm:px-space-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="relative z-10 flex flex-col gap-space-4">
            <div>
              <p className="font-mono text-caption uppercase tracking-[0.2em] text-accent">
                {SCROLL_SCENE_EYEBROW}
              </p>
              <h2
                id={headingId}
                className="mt-space-3 max-w-xl text-balance font-display text-h2 font-semibold tracking-[-0.04em] text-text"
              >
                {SCROLL_SCENE_HEADING}
              </h2>
            </div>
            <div className="relative min-h-[11rem] w-full max-w-xl">
              {SCROLL_SCENE_CHAPTERS.map((chapter, index) => (
                <ChapterPanel
                  key={chapter.id}
                  chapter={chapter}
                  index={index}
                  progress={scrollYProgress}
                  reducedMotion={reducedMotion}
                />
              ))}
            </div>
            {!reducedMotion ? (
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted">
                Keep scrolling — your project moves forward
              </p>
            ) : null}
          </div>

          <div
            className="relative mx-auto flex h-[min(70vh,34rem)] w-full max-w-xl items-center justify-center lg:h-[min(74vh,38rem)]"
            style={{ perspective: "1400px", perspectiveOrigin: "50% 45%" }}
          >
            <motion.div
              aria-hidden="true"
              style={{ scale: ringScale, opacity: ringOpacity }}
              className="absolute h-[78%] w-[78%] rounded-full border border-accent/25"
            />
            <motion.div
              aria-hidden="true"
              style={{ scale: innerRingScale, opacity: innerRingOpacity }}
              className="border-accent-cool/20 absolute h-[58%] w-[58%] rounded-full border"
            />

            <motion.div
              className="absolute inset-[6%] overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/50"
              style={{
                rotateY: coverRotateY,
                rotateX: coverRotateX,
                z: coverZ,
                scale: coverScale,
                transformStyle: "preserve-3d",
              }}
            >
              <Image
                src={SCROLL_SCENE_COVER}
                alt=""
                fill
                sizes="(max-width: 1024px) 90vw, 36rem"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-bg/55 via-transparent to-bg/20" />
            </motion.div>

            <motion.div
              className="absolute w-[64%] overflow-hidden rounded-xl border border-white/15 shadow-2xl shadow-black/60 sm:w-[56%]"
              style={{
                x: profileX,
                y: profileY,
                rotateY: profileRotateY,
                rotateX: profileRotateX,
                z: profileZ,
                transformStyle: "preserve-3d",
              }}
            >
              <ProjectBoard
                progress={scrollYProgress}
                reducedMotion={reducedMotion}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
