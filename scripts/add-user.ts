// ---------------------------------------------------------------------------
// Add (or update) a CMS admin user from the command line.
//
//   npm run admin:add-user -- --email "teammate@example.com" --name "Teammate"
//
// In PowerShell, quote the separator ('--') or PowerShell swallows it:
//   npm run admin:add-user '--' --email "teammate@example.com" --name "Teammate"
//   (or run it directly: npx tsx scripts/add-user.ts --email ...)
//
// Options
//   --email <email>        required
//   --name <name>          display name (defaults to the part before "@")
//   --role <role>          "editor" (default) or "super-admin"
//   --generate             generate a strong password and print it once
//   --update               if the email already exists: set the new password,
//                          name/role (when given), and reactivate the account
//
// Password source (first match wins): --generate, the ADMIN_USER_PASSWORD
// environment variable, or an interactive hidden prompt. Never pass the
// password as an argument — it would end up in your shell history.
//
// Uses DATABASE_URL from the environment, `.env.local`, or `.env`, so the
// same command works against any database the app can reach. The account
// appears immediately in Admin → Users; no redeploy needed.
// ---------------------------------------------------------------------------

import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline";
import { Writable } from "node:stream";

import { PrismaClient, type AdminRole } from "@prisma/client";

import { hashPassword, verifyPassword } from "../src/lib/password";
import { adminUserCreateSchema, passwordSchema } from "../src/lib/validation/cms";

interface Options {
  email: string;
  name?: string;
  role?: AdminRole;
  generate: boolean;
  update: boolean;
}

function loadEnvironment(): void {
  // Earlier files win: loadEnvFile never overrides variables already set.
  for (const file of [".env.local", ".env"]) {
    const path = resolve(process.cwd(), file);
    if (existsSync(path)) process.loadEnvFile(path);
  }
}

function readArgument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  const value = index >= 0 ? process.argv[index + 1] : undefined;
  return value && !value.startsWith("--") ? value : undefined;
}

function parseRole(value: string | undefined): AdminRole | undefined {
  if (value === undefined) return undefined;
  const normalized = value.trim().toLowerCase().replace(/[_\s]/g, "-");
  if (normalized === "editor") return "EDITOR";
  if (normalized === "super-admin" || normalized === "superadmin") return "SUPER_ADMIN";
  throw new Error('--role must be "editor" or "super-admin".');
}

function parseOptions(): Options {
  const email = readArgument("--email")?.trim().toLowerCase() ?? "";
  if (!email) throw new Error('Provide an email with --email "person@example.com".');
  return {
    email,
    name: readArgument("--name")?.trim(),
    role: parseRole(readArgument("--role")),
    generate: process.argv.includes("--generate"),
    update: process.argv.includes("--update"),
  };
}

/** Ask a question without echoing the answer (for passwords). */
async function askHidden(question: string): Promise<string> {
  let muted = false;
  const output = new Writable({
    write(chunk, _encoding, callback) {
      if (!muted) process.stdout.write(chunk);
      callback();
    },
  });
  const rl = createInterface({ input: process.stdin, output, terminal: true });
  process.stdout.write(question);
  muted = true;
  const answer = await new Promise<string>((done) => rl.question("", done));
  rl.close();
  process.stdout.write("\n");
  return answer;
}

async function resolvePassword(options: Options): Promise<{ password: string; generated: boolean }> {
  if (options.generate) {
    return { password: randomBytes(18).toString("base64url"), generated: true };
  }
  const fromEnv = process.env.ADMIN_USER_PASSWORD;
  if (fromEnv) return { password: fromEnv, generated: false };

  if (!process.stdin.isTTY) {
    throw new Error("No password: set ADMIN_USER_PASSWORD, pass --generate, or run in a terminal.");
  }
  const password = await askHidden("Password (at least 12 characters): ");
  const parsed = passwordSchema.safeParse(password);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid password.");
  if ((await askHidden("Repeat password: ")) !== password) {
    throw new Error("Passwords do not match.");
  }
  return { password, generated: false };
}

async function main(): Promise<void> {
  loadEnvironment();
  const options = parseOptions();
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set (checked the environment, .env.local, and .env).");
  }

  const prisma = new PrismaClient();
  try {
    const existing = await prisma.adminUser.findUnique({ where: { email: options.email } });
    if (existing && !options.update) {
      throw new Error(
        `${options.email} already exists. Re-run with --update to reset their password${
          options.role ? ", change their role," : ""
        } and reactivate them.`,
      );
    }

    // The very first account must be able to manage the others.
    const isFirstUser = (await prisma.adminUser.count()) === 0;
    const role: AdminRole = options.role ?? existing?.role ?? (isFirstUser ? "SUPER_ADMIN" : "EDITOR");
    const name = options.name || existing?.name || options.email.split("@")[0] || "Admin";

    if (existing?.role === "SUPER_ADMIN" && existing.isActive && role !== "SUPER_ADMIN") {
      const others = await prisma.adminUser.count({
        where: { role: "SUPER_ADMIN", isActive: true, id: { not: existing.id } },
      });
      if (others === 0) throw new Error("Keep at least one active super admin.");
    }

    const { password, generated } = await resolvePassword(options);
    const parsed = adminUserCreateSchema.safeParse({ name, email: options.email, role, password });
    if (!parsed.success) {
      throw new Error(parsed.error.issues.map((issue) => issue.message).join("; "));
    }

    const passwordHash = await hashPassword(parsed.data.password);
    if (!(await verifyPassword(parsed.data.password, passwordHash))) {
      throw new Error("Generated password hash failed verification.");
    }

    const user = existing
      ? await prisma.adminUser.update({
          where: { id: existing.id },
          data: { name: parsed.data.name, role: parsed.data.role, passwordHash, isActive: true },
        })
      : await prisma.adminUser.create({
          data: { name: parsed.data.name, email: parsed.data.email, role: parsed.data.role, passwordHash },
        });

    await prisma.activityLog.create({
      data: {
        action: existing ? "admin.update" : "admin.create",
        entityType: "admin",
        entityId: user.id,
        summary: `${existing ? "Updated" : "Added"} admin ${user.email} from the command line`,
      },
    });

    const roleLabel = user.role === "SUPER_ADMIN" ? "super admin" : "editor";
    console.log(`${existing ? "Updated" : "Added"} ${user.name} <${user.email}> as ${roleLabel}.`);
    if (generated) {
      console.log(`Temporary password (shown once): ${parsed.data.password}`);
      console.log("Share it securely; they can change it in Admin → Users after signing in.");
    }
    console.log("They can sign in at /admin/login now.");
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Add user failed: ${message}`);
  process.exitCode = 1;
});
