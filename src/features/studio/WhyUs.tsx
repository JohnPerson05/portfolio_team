import { FadeUp, Stagger } from "@/components/motion";
import { Button, SectionHeading } from "@/components/ui";
import { cn } from "@/lib/utils";
import { WHY_US } from "./config";

/**
 * `WhyUs` — why a deliberately small, two-person team is an advantage, closed
 * by a direct call to action.
 */
export function WhyUs({ className }: { className?: string }) {
  const headingId = "why-heading";

  return (
    <section
      id="why"
      aria-labelledby={headingId}
      className={cn("w-full px-space-2 py-section sm:px-space-4", className)}
    >
      <div className="mx-auto grid max-w-content gap-space-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
        <div className="flex flex-col gap-space-4 lg:sticky lg:top-24">
          <SectionHeading
            id={headingId}
            eyebrow={WHY_US.eyebrow}
            heading={WHY_US.heading}
          />
          <div>
            <Button href="/contact" variant="primary" size="lg">
              Tell us about your project →
            </Button>
          </div>
        </div>

        <Stagger as="ol" className="flex flex-col">
          {WHY_US.reasons.map((reason, index) => (
            <FadeUp
              as="li"
              key={reason.title}
              className="grid list-none grid-cols-[3rem_minmax(0,1fr)] gap-space-2 border-t border-hairline py-space-4 last:border-b"
            >
              <span className="font-mono text-caption text-accent">
                0{index + 1}
              </span>
              <div>
                <h3 className="font-display text-h3 font-semibold text-text">
                  {reason.title}
                </h3>
                <p className="mt-space-1 text-pretty text-body leading-relaxed text-muted">
                  {reason.body}
                </p>
              </div>
            </FadeUp>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
