import { PrismaClient } from "@prisma/client";

/**
 * Shared Prisma client (Requirement 17.3).
 *
 * Next.js dev mode hot-reloads modules on every edit, which would otherwise
 * spawn a fresh `PrismaClient` — and therefore a new connection pool — on each
 * reload, eventually exhausting database connections. To avoid that we cache a
 * single instance on `globalThis` and reuse it across reloads. In production a
 * single module instance is created normally.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
