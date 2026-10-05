import Image from "next/image";
import Link from "next/link";
import { FadeUp, Stagger } from "@/components/motion";
import { SectionHeading } from "@/components/ui";
import { imageSource } from "@/lib/images";
import { cn } from "@/lib/utils";
import type { ServiceView } from "@/types";

/**
 * `Services` — what we help with, framed as the problem a business owner
 * would describe ("shortDescription") and what we do about it
 * ("description"). Renders nothing when no service is published.
 */
export function Services({
  services,
  eyebrow,
  heading,
  description,
  showAllLink = false,
  className,
}: {
  services: readonly ServiceView[];
  eyebrow?: string;
  heading: string;
  description?: string;
  /** Show a "See all services" link (homepage). */
  showAllLink?: boolean;
  className?: string;
}) {
  const headingId = "services-heading";
  if (services.length === 0) return null;

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
          eyebrow={eyebrow}
          heading={heading}
          description={description}
        />

        <Stagger
          as="ul"
          className="grid gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline md:grid-cols-2 lg:grid-cols-3"
        >
          {services.map((service) => (
            <FadeUp
              as="li"
              key={service.id}
              className="group relative flex list-none flex-col gap-space-3 bg-bg-secondary p-space-4 transition-colors duration-300 hover:bg-card sm:p-space-5"
            >
              <div className="flex items-center justify-between gap-space-2">
                <span className="font-mono text-caption text-accent">
                  {service.number}
                </span>
                {service.leadLabel ? (
                  <span className="text-right font-mono text-[0.58rem] uppercase tracking-[0.16em] text-muted">
                    {service.leadLabel}
                  </span>
                ) : null}
              </div>
              {service.image ? (
                <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-white/10">
                  <Image
                    {...imageSource(service.image)}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 90vw, 22rem"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transform-none"
                  />
                </div>
              ) : null}
              <h3 className="font-display text-h3 font-semibold text-text">
                {service.title}
              </h3>
              <p className="text-pretty text-body italic leading-relaxed text-text/70">
                “{service.shortDescription}”
              </p>
              {service.description ? (
                <p className="text-pretty text-body leading-relaxed text-muted">
                  {service.description}
                </p>
              ) : null}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-500 group-hover:scale-x-100"
              />
            </FadeUp>
          ))}
        </Stagger>

        {showAllLink ? (
          <Link
            href="/services"
            className="mx-auto inline-flex min-h-11 items-center font-mono text-caption uppercase tracking-widest text-accent transition-colors hover:text-text"
          >
            How we can help&nbsp; →
          </Link>
        ) : null}
      </div>
    </section>
  );
}
