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
import { isOptimizableImage } from "@/lib/images";
import {
  SCROLL_SCENE_CHAPTERS,
  SCROLL_SCENE_COVER,
  SCROLL_SCENE_EYEBROW,
  SCROLL_SCENE_HEADING,
  SCROLL_SCENE_PROFILE,
  type ScrollSceneChapter,
} from "./config";

function ChapterPanel({
  chapter,
  index,
  total,
  progress,
  reducedMotion,
}: {
  chapter: ScrollSceneChapter;
  index: number;
  total: number;
  progress: MotionValue<number>;
  reducedMotion: boolean;
}) {
  const start = index / total;
  const mid = (index + 0.45) / total;
  const end = (index + 1) / total;

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

/**
 * Sticky, scroll-driven 3D scene for the homepage.
 *
 * A tall track pins a perspective stage; cover and profile images move on
 * separate depth planes while chapter copy fades through as the visitor scrolls.
 * Honors `prefers-reduced-motion` by freezing to a readable static composition.
 */
export interface ScrollSceneProps {
  eyebrow?: string;
  heading?: string;
  chapters?: readonly { label: string; title: string; body: string }[];
  coverImage?: string;
  profileImage?: string;
  profileAlt?: string;
  /** Section anchor id; must be unique when several scenes share a page. */
  id?: string;
  /** Put the media on the left and the copy on the right, with motion reversed. */
  mirrored?: boolean;
  className?: string;
}

export function ScrollScene({
  eyebrow = SCROLL_SCENE_EYEBROW,
  heading = SCROLL_SCENE_HEADING,
  chapters: chapterInput = SCROLL_SCENE_CHAPTERS,
  coverImage = SCROLL_SCENE_COVER,
  profileImage = SCROLL_SCENE_PROFILE,
  profileAlt = "John Person portrait",
  id = "craft",
  mirrored = false,
  className,
}: ScrollSceneProps) {
  const chapters: ScrollSceneChapter[] = chapterInput.map((c, i) => ({
    id: `chapter-${i}`,
    label: c.label,
    title: c.title,
    body: c.body,
  }));
  const trackRef = useRef<HTMLElement>(null);
  const mirror = (values: number[]) =>
    mirrored ? values.map((v) => -v) : values;
  const reducedMotion = useReducedMotion() === true;
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  const coverRotateY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reducedMotion ? [0, 0, 0] : mirror([-18, -6, 10]),
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
    reducedMotion ? [0, 0, 0] : mirror([22, 4, -12]),
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
    reducedMotion ? ["0%", "0%"] : mirrored ? ["-18%", "2%"] : ["18%", "-2%"],
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

  const headingId = `${id}-heading`;

  return (
    <section
      ref={trackRef}
      id={id}
      aria-labelledby={headingId}
      className={cn("relative w-full", className)}
      style={{ height: reducedMotion ? "auto" : "280vh" }}
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
          <div className="via-bg-secondary/80 absolute inset-0 bg-gradient-to-b from-bg to-bg" />
          <div className="programmatic-grid absolute inset-0 opacity-30" />
        </div>

        <div
          className={cn(
            "relative mx-auto grid w-full max-w-content items-center gap-space-8 px-space-2 sm:px-space-4",
            mirrored
              ? "lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]"
              : "lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]",
          )}
        >
          <div
            className={cn(
              "relative z-10 flex flex-col gap-space-4",
              mirrored && "lg:order-2",
            )}
          >
            <div>
              <p className="font-mono text-caption uppercase tracking-[0.2em] text-accent">
                {eyebrow}
              </p>
              <h2
                id={headingId}
                className="mt-space-3 max-w-xl text-balance font-display text-h2 font-semibold tracking-[-0.04em] text-text"
              >
                {heading}
              </h2>
            </div>
            <div className="relative min-h-[11rem] w-full max-w-xl">
              {chapters.map((chapter, index) => (
                <ChapterPanel
                  total={chapters.length}
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
                Scroll to move through depth
              </p>
            ) : null}
          </div>

          <div
            className={cn(
              "relative mx-auto flex h-[min(70vh,34rem)] w-full max-w-xl items-center justify-center lg:h-[min(74vh,38rem)]",
              mirrored && "lg:order-1",
            )}
            style={{ perspective: "1400px", perspectiveOrigin: "50% 45%" }}
          >
            <motion.div
              aria-hidden="true"
              style={{ scale: ringScale, opacity: ringOpacity }}
              className="border-accent/25 absolute h-[78%] w-[78%] rounded-full border"
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
                src={coverImage}
                unoptimized={!isOptimizableImage(coverImage)}
                alt=""
                fill
                sizes="(max-width: 1024px) 90vw, 36rem"
                className="object-cover"
                priority
              />
              <div className="from-bg/55 to-bg/20 absolute inset-0 bg-gradient-to-tr via-transparent" />
            </motion.div>

            <motion.div
              className="absolute aspect-[3/4] w-[46%] overflow-hidden rounded-xl border border-white/15 shadow-2xl shadow-black/60 sm:w-[42%]"
              style={{
                x: profileX,
                y: profileY,
                rotateY: profileRotateY,
                rotateX: profileRotateX,
                z: profileZ,
                transformStyle: "preserve-3d",
              }}
            >
              <Image
                src={profileImage}
                unoptimized={!isOptimizableImage(profileImage)}
                alt={profileAlt}
                fill
                sizes="(max-width: 768px) 45vw, 16rem"
                className="object-cover object-[center_12%]"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
