import { FadeUp, Stagger } from "@/components/motion";
import { Button, SectionHeading } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { SettingItem } from "@/server/settings/registry";

/**
 * `WhyUs` — why a deliberately small team is an advantage, closed by a direct
 * call to action. Reasons come from the `home.whyUsReasons` setting.
 */
export function WhyUs({
  reasons,
  eyebrow,
  heading,
  cta = { label: "Tell us about your project", href: "/contact" },
  className,
}: {
  reasons: readonly SettingItem[];
  eyebrow?: string;
  heading: string;
  cta?: { label: string; href: string };
  className?: string;
}) {
  const headingId = "why-heading";
  if (reasons.length === 0) return null;

  return (
    <section
      id="why"
      aria-labelledby={headingId}
      className={cn("w-full px-space-2 py-section sm:px-space-4", className)}
    >
      <div className="mx-auto grid max-w-content gap-space-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
        <div className="flex flex-col gap-space-4 lg:sticky lg:top-24">
          <SectionHeading id={headingId} eyebrow={eyebrow} heading={heading} />
          <div>
            <Button href={cta.href} variant="primary" size="lg">
              {cta.label} →
            </Button>
          </div>
        </div>

        <Stagger as="ol" className="flex flex-col">
          {reasons.map((reason, index) => (
            <FadeUp
              as="li"
              key={`${reason.title}-${index}`}
              className="grid list-none grid-cols-[3rem_minmax(0,1fr)] gap-space-2 border-t border-hairline py-space-4 last:border-b"
            >
              <span className="font-mono text-caption text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-display text-h3 font-semibold text-text">
                  {reason.title}
                </h3>
                {reason.body ? (
                  <p className="mt-space-1 text-pretty text-body leading-relaxed text-muted">
                    {reason.body}
                  </p>
                ) : null}
              </div>
            </FadeUp>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
