const CAPABILITIES = [
  "Java & Spring Boot",
  "Microservices",
  "REST API engineering",
  "React & Next.js",
  "Azure DevOps CI/CD",
  "Rapid MVP delivery",
  "AI-assisted development",
] as const;

export function CapabilityTicker({
  items = CAPABILITIES,
}: {
  items?: readonly string[];
}) {
  if (items.length === 0) return null;
  const repeated = [...items, ...items];

  return (
    <div
      className="overflow-hidden border-y border-hairline bg-white/[0.015] py-space-2"
    >
      <p className="sr-only">Capabilities: {items.join(", ")}</p>
      <div aria-hidden="true" className="ticker-track flex w-max items-center">
        {repeated.map((capability, index) => (
          <div
            key={`${capability}-${index}`}
            className="flex shrink-0 items-center gap-space-4 px-space-4 font-mono text-caption uppercase tracking-[0.16em] text-muted"
          >
            <span>{capability}</span>
            <span className="text-accent">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}
