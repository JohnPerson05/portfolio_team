import { FadeUp, Stagger } from "@/components/motion";
import { SectionHeading } from "@/components/ui";
import { cn } from "@/lib/utils";
import { JOHN, PARTNER, SERVICES, type Service } from "./config";

function leadLabel(lead: Service["lead"]): string {
  if (lead === "both") return "Both of us";
  const member = lead === "john" ? JOHN : PARTNER;
  return `Led by ${member.isPlaceholder ? member.discipline : member.firstName}`;
}

/**
 * `Services` — what we help with, framed as the problem a business owner
 * would describe and what we do about it.
 */
export function Services({ className }: { className?: string }) {
  const headingId = "services-heading";

  return (
    <section
      id="services"
      aria-labelledby={headingId}
      className={cn(
        "w-full border-t border-hairline bg-bg-secondary px-space-2 py-section sm:px-space-4",
        className,
      )}
    >
      <div className="mx-auto flex max-w-content flex-col gap-space-8">
        <SectionHeading
          id={headingId}
          eyebrow="What we help with"
          heading="From the first idea to the thing your business actually needs."
          description="You don't need to know how it's built. Tell us what's slowing you down — we'll handle the rest."
        />

        <Stagger
          as="ul"
          className="grid gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline md:grid-cols-2 lg:grid-cols-3"
        >
          {SERVICES.map((service) => (
            <FadeUp
              as="li"
              key={service.id}
              className="group relative flex list-none flex-col gap-space-3 bg-bg-secondary p-space-4 transition-colors duration-300 hover:bg-card sm:p-space-5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-caption text-accent">
                  {service.number}
                </span>
                <span className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-muted">
                  {leadLabel(service.lead)}
                </span>
              </div>
              <h3 className="font-display text-h3 font-semibold text-text">
                {service.title}
              </h3>
              <p className="text-pretty text-body italic leading-relaxed text-text/70">
                “{service.when}”
              </p>
              <p className="text-pretty text-body leading-relaxed text-muted">
                {service.what}
              </p>
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-500 group-hover:scale-x-100"
              />
            </FadeUp>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
