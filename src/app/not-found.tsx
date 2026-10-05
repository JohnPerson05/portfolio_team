import { Button, SectionHeading } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-content flex-col items-center justify-center gap-space-6 px-space-2 py-section text-center sm:px-space-4">
      <SectionHeading
        level={1}
        eyebrow="404"
        heading="This page is off the map"
        description="The page may have moved, or the link may no longer be available."
        align="center"
      />
      <Button href="/" variant="primary" size="lg">
        Return home
      </Button>
    </section>
  );
}
