/**
 * Concatenate class name fragments, ignoring falsy values.
 * A minimal helper used while scaffolding; richer styling utilities
 * (e.g. token-aware variants) are added alongside the UI library in later tasks.
 */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}
