import { cn } from "@/lib/utils";

export interface ThemeBackgroundProps {
  className?: string;
}

/**
 * `ThemeBackground` — a subtle, decorative depth layer behind all content
 * (server component, zero client JS).
 *
 * It is purely CSS-driven (cheap): a couple of faint radial glows plus a very
 * low-opacity SVG noise texture, sized to the viewport and `fixed` behind the
 * page. There is no canvas/animation loop, so it adds no runtime cost.
 *
 * Accessibility/layout: marked `aria-hidden` and `pointer-events-none` so it is
 * ignored by assistive tech and never intercepts clicks, and `overflow-hidden`
 * keeps the oversized glows from creating horizontal scroll (Property 12).
 */
export function ThemeBackground({ className }: ThemeBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
        className,
      )}
    >
      {/* Primary accent glow — top, very faint. */}
      <div
        className="absolute left-1/2 top-[-20%] h-[60vmax] w-[60vmax] -translate-x-1/2 rounded-full opacity-[0.06] blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--accent) 0%, transparent 60%)",
        }}
      />
      {/* Secondary cool depth glow — lower, subtle. */}
      <div
        className="absolute bottom-[-25%] right-[-10%] h-[50vmax] w-[50vmax] rounded-full opacity-[0.05] blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 60%)",
        }}
      />
      {/* Faint film grain / noise to add texture without banding. */}
      <div
        className="absolute inset-0 opacity-[0.025] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
