/**
 * Thin re-export of the Node.js filesystem functions used by the resume route.
 *
 * Wrapping built-in node: imports in a project module makes them mockable in
 * Vitest tests: `vi.mock("@/lib/fs", ...)` replaces the module in the registry
 * before the route module is loaded, so the route's named imports resolve to
 * the mock functions rather than the real Node.js built-ins (which are
 * non-configurable and cannot be spied on directly).
 */

export { stat } from "node:fs/promises";
export { createReadStream } from "node:fs";
