import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    css: true,
    // Unit tests must never reach a real database. Prisma would otherwise load
    // DATABASE_URL from `.env`; point it at an unroutable address instead.
    env: {
      DATABASE_URL: "postgresql://unit-tests:unit-tests@127.0.0.1:9/unit-tests",
      DATABASE_URL_UNPOOLED: "postgresql://unit-tests:unit-tests@127.0.0.1:9/unit-tests",
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
