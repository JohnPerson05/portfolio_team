import { describe, expect, it } from "vitest";
import { cn } from "./utils";

// Trivial test to verify the Vitest + Testing Library harness runs.
describe("cn", () => {
  it("joins truthy class fragments", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("ignores falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("returns an empty string when given no truthy values", () => {
    expect(cn(false, null, undefined)).toBe("");
  });
});
