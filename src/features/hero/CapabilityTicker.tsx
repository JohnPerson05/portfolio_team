import { OUTCOME_TICKER } from "@/features/studio/config";

/**
 * A slow, looping strip of the kinds of things we build — written as business
 * outcomes, not technologies.
 */
export function CapabilityTicker() {
  const repeated = [...OUTCOME_TICKER, ...OUTCOME_TICKER];

  return (
    <div
      aria-label={`What we build: ${OUTCOME_TICKER.join(", ")}`}
      className="overflow-hidden border-y border-hairline bg-white/[0.015] py-space-2"
    >
      <div aria-hidden="true" className="ticker-track flex w-max items-center">
        {repeated.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="flex shrink-0 items-center gap-space-4 px-space-4 font-mono text-caption uppercase tracking-[0.16em] text-muted"
          >
            <span>{item}</span>
            <span className="text-accent">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}
