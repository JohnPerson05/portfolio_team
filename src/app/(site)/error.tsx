"use client";

import { useEffect } from "react";
import { Button, SectionHeading } from "@/components/ui";

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-content flex-col items-center justify-center gap-space-6 px-space-2 py-section text-center sm:px-space-4">
      <SectionHeading
        level={1}
        eyebrow="Something went wrong"
        heading="We couldn't load this page."
        description="It's probably a temporary hiccup on our side. Please try again in a moment."
        align="center"
      />
      <div className="flex flex-wrap justify-center gap-space-2">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center rounded-md bg-accent px-space-4 font-medium text-bg transition-opacity hover:opacity-90"
        >
          Try again
        </button>
        <Button href="/" variant="outline" size="lg">
          Return home
        </Button>
      </div>
    </section>
  );
}
