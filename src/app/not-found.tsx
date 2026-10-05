import { Button, SectionHeading } from "@/components/ui";

/**
 * Global 404. Rendered inside the minimal root layout (no public navbar), so
 * it is self-contained and simply offers a way back.
 */
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-content flex-col items-center justify-center gap-space-6 px-space-2 py-section text-center sm:px-space-4">
      <SectionHeading
        level={1}
        eyebrow="404"
        heading="This page is off the map"
        description="The page may have moved, or the link may no longer be available."
        align="center"
      />
      <div className="flex flex-wrap justify-center gap-space-2">
        <Button href="/" variant="primary" size="lg">
          Return home
        </Button>
        <Button href="/work" variant="outline" size="lg">
          See our work
        </Button>
      </div>
    </main>
  );
}
