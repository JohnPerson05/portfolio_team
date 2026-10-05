import { cn } from "@/lib/utils";

export interface LoadingVisualProps {
  overlay?: boolean;
  className?: string;
}

export function LoadingVisual({
  overlay = false,
  className,
}: LoadingVisualProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading page"
      className={cn(
        "flex items-center justify-center overflow-hidden bg-bg",
        overlay
          ? "fixed inset-0 z-[100] min-h-screen"
          : "min-h-[calc(100svh-4rem)]",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center opacity-35"
        style={{
          backgroundImage:
            "linear-gradient(90deg, var(--bg), transparent, var(--bg)), url('/images/enterprise-grid-background.svg')",
        }}
      />
      <div
        aria-hidden="true"
        className="programmatic-grid absolute inset-0 opacity-40"
      />

      <div className="relative flex w-full max-w-md flex-col items-center px-space-4">
        <div className="relative flex h-28 w-28 items-center justify-center">
          <span className="loader-orbit border-accent/20 absolute inset-0 rounded-full border" />
          <span className="loader-orbit-reverse border-[var(--accent-cool)]/25 absolute inset-3 rounded-full border" />
          <span className="absolute inset-7 rounded-full border border-white/10 bg-black/25 backdrop-blur" />
          <span className="relative font-mono text-caption font-semibold tracking-[0.18em] text-text">
            JPN<span className="text-accent">/</span>
          </span>
        </div>

        <p className="mt-space-4 font-display text-body-lg font-semibold tracking-tight text-text">
          John Person Narral
        </p>
        <div className="mt-space-2 flex items-center gap-space-2 font-mono text-[0.64rem] uppercase tracking-[0.2em] text-muted">
          <span className="status-pulse h-2 w-2 rounded-full bg-emerald-400" />
          Preparing the next view
        </div>

        <div className="mt-space-4 h-px w-full overflow-hidden bg-white/10">
          <div className="loader-progress h-full w-1/3 bg-gradient-to-r from-transparent via-accent to-[var(--accent-cool)]" />
        </div>
        <div
          aria-hidden="true"
          className="mt-space-3 flex w-full justify-between font-mono text-[0.55rem] uppercase tracking-widest text-white/35"
        >
          <span>Interface</span>
          <span>Systems</span>
          <span>Experience</span>
        </div>
      </div>
    </div>
  );
}
