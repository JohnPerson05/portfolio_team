"use client";

import Image from "next/image";
import { useState, type PointerEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import { imageSource } from "@/lib/images";
import type { TeamMemberView } from "@/types";

const SPRING = { stiffness: 140, damping: 18, mass: 0.6 };

/** Designed fallback for a team member without a portrait yet. */
function firstName(name: string): string {
  return name.split(/\s+/)[0] ?? name;
}

function Monogram({ member }: { member: TeamMemberView }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-space-2 bg-[radial-gradient(circle_at_30%_20%,rgba(114,215,255,0.18),transparent_55%),radial-gradient(circle_at_80%_90%,rgba(212,175,55,0.16),transparent_50%)]">
      <div className="programmatic-grid absolute inset-0 opacity-40" />
      <span className="relative font-display text-[clamp(3rem,8vw,5rem)] font-semibold leading-none text-text/90">
        {member.initials}
      </span>
    </div>
  );
}

function PersonCard({
  member,
  active,
  dimmed,
  onFocus,
  onBlur,
  className,
}: {
  member: TeamMemberView;
  active: boolean;
  dimmed: boolean;
  onFocus: () => void;
  onBlur: () => void;
  className?: string;
}) {
  return (
    <figure
      tabIndex={0}
      onMouseEnter={onFocus}
      onMouseLeave={onBlur}
      onFocus={onFocus}
      onBlur={onBlur}
      aria-label={`${member.name} — ${member.role}`}
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-[#090b0e] shadow-2xl shadow-black/60",
        "transition-[border-color,opacity,transform] duration-500 ease-out",
        active ? "border-accent/60" : "border-white/10",
        dimmed ? "opacity-60" : "opacity-100",
        className,
      )}
    >
      <div className="relative aspect-[3/4] w-full">
        {member.profileImage ? (
          <Image
            {...imageSource(member.profileImage)}
            alt={member.name}
            fill
            priority
            sizes="(max-width: 1024px) 45vw, 16rem"
            className="object-cover object-[center_12%] transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <Monogram member={member} />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#090b0e] via-[#090b0e]/20 to-transparent"
        />
      </div>
      <figcaption className="absolute inset-x-0 bottom-0 p-space-2 sm:p-space-3">
        <p className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-accent">
          {member.role}
        </p>
        <p className="mt-1 font-display text-body font-semibold leading-tight text-text">
          {firstName(member.name)}
        </p>
        <p
          className={cn(
            "mt-1 text-pretty text-[0.78rem] leading-snug text-muted transition-[max-height,opacity] duration-500",
            active
              ? "max-h-20 opacity-100"
              : "max-h-0 opacity-0 sm:max-h-20 sm:opacity-100",
          )}
        >
          {member.shortBio}
        </p>
      </figcaption>
    </figure>
  );
}

/**
 * The hero's signature visual: two people, one team.
 *
 * Two portrait cards sit on offset depth planes and tilt gently toward the
 * pointer; hovering or focusing one person brings their promise forward while
 * the other recedes. Floating outcome chips orbit the pair. Fully static (but
 * identical in layout) when the visitor prefers reduced motion.
 */
export function DuoComposition({
  members,
  outcomes,
}: {
  members: readonly TeamMemberView[];
  outcomes: readonly string[];
}) {
  const reducedMotion = useReducedMotion();
  const [activeId, setActiveId] = useState<string | null>(null);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, SPRING);
  const sy = useSpring(py, SPRING);

  const rotateY = useTransform(sx, [-0.5, 0.5], [-8, 8]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [6, -6]);
  const frontX = useTransform(sx, [-0.5, 0.5], [-14, 14]);
  const backX = useTransform(sx, [-0.5, 0.5], [10, -10]);
  const chipsX = useTransform(sx, [-0.5, 0.5], [-22, 22]);
  const chipsY = useTransform(sy, [-0.5, 0.5], [-14, 14]);

  function handleMove(event: PointerEvent<HTMLDivElement>) {
    if (reducedMotion || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width - 0.5);
    py.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function handleLeave() {
    px.set(0);
    py.set(0);
  }

  const [first, second] = members;
  if (!first) return null;
  const solo = !second;

  return (
    <div
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className="relative mx-auto w-full max-w-xl select-none"
      style={{ perspective: "1400px" }}
    >
      {/* Ambient glow behind the pair */}
      <div
        aria-hidden="true"
        className="absolute -inset-10 rounded-full bg-[radial-gradient(circle,var(--accent-cool),transparent_65%)] opacity-[0.09] blur-2xl"
      />

      <motion.div
        className={cn(
          "relative grid items-start gap-space-2 sm:gap-space-3",
          solo ? "mx-auto max-w-[17rem] grid-cols-1" : "grid-cols-2",
        )}
        style={
          reducedMotion
            ? undefined
            : { rotateX, rotateY, transformStyle: "preserve-3d" }
        }
      >
        <motion.div
          style={reducedMotion ? undefined : { x: backX }}
          className={solo ? undefined : "pt-space-8"}
        >
          <PersonCard
            member={first}
            active={activeId === first.id}
            dimmed={activeId !== null && activeId !== first.id}
            onFocus={() => setActiveId(first.id)}
            onBlur={() => setActiveId(null)}
          />
        </motion.div>
        {second ? (
          <motion.div style={reducedMotion ? undefined : { x: frontX }}>
            <PersonCard
              member={second}
              active={activeId === second.id}
              dimmed={activeId !== null && activeId !== second.id}
              onFocus={() => setActiveId(second.id)}
              onBlur={() => setActiveId(null)}
            />
          </motion.div>
        ) : null}

        {/* The "+" joint — two people, one team */}
        {solo ? null : (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-accent/50 bg-bg/90 font-display text-h3 text-accent shadow-[0_0_40px_-6px_rgba(212,175,55,0.55)] backdrop-blur"
          >
            +
          </div>
        )}
      </motion.div>

      {/* Floating outcome chips */}
      <motion.ul
        aria-label="What we deliver"
        style={reducedMotion ? undefined : { x: chipsX, y: chipsY }}
        className="pointer-events-none absolute inset-0 hidden sm:block"
      >
        {outcomes.slice(0, 4).map((outcome, index) => {
          const positions = [
            "-left-8 top-2",
            "-right-6 top-[38%]",
            "-left-10 bottom-[22%]",
            "-right-2 -bottom-4",
          ];
          return (
            <li
              key={outcome}
              className={cn(
                "duo-float absolute whitespace-nowrap rounded-full border border-white/10 bg-[#0b0e12]/85 px-space-2 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-text/85 shadow-xl shadow-black/40 backdrop-blur",
                positions[index % positions.length],
              )}
              style={{ animationDelay: `${index * -1.6}s` }}
            >
              <span aria-hidden="true" className="mr-1.5 text-accent">
                ●
              </span>
              {outcome}
            </li>
          );
        })}
      </motion.ul>
    </div>
  );
}
