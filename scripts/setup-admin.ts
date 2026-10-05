import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

import { hashPassword, verifyPassword } from "../src/lib/password";

const ENV_PATH = resolve(process.cwd(), ".env.local");
interface SetupOptions {
  email: string;
  password: string;
  siteUrl?: string;
  vercel: boolean;
  deploy: boolean;
}

function readArgument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function parseOptions(): SetupOptions {
  const email = readArgument("--email")?.trim() ?? "";
  const siteUrl = readArgument("--site-url")?.trim().replace(/\/+$/, "");
  const password = process.env.ADMIN_SETUP_PASSWORD ?? "";
  const vercel = process.argv.includes("--vercel");
  const deploy = process.argv.includes("--deploy");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Provide a valid email with --email "you@example.com".');
  }
  if (password.length < 12) {
    throw new Error(
      "Set ADMIN_SETUP_PASSWORD to a password of at least 12 characters.",
    );
  }
  if (siteUrl) {
    try {
      const parsed = new URL(siteUrl);
      if (parsed.protocol !== "https:") throw new Error();
    } catch {
      throw new Error("--site-url must be a valid HTTPS URL.");
    }
  }
  if (deploy && !vercel) {
    throw new Error("--deploy requires --vercel.");
  }

  return { email, password, siteUrl, vercel, deploy };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function upsertEnvironmentValue(
  source: string,
  key: string,
  value: string,
): string {
  const escapedValue = value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\$/g, "\\$");
  const line = `${key}="${escapedValue}"`;
  const pattern = new RegExp(`^${escapeRegExp(key)}=.*$`, "gm");

  if (!pattern.test(source)) {
    return `${source.trimEnd()}\n${line}\n`;
  }

  let replaced = false;
  return source
    .split(/\r?\n/)
    .filter((entry) => {
      if (!entry.startsWith(`${key}=`)) return true;
      if (replaced) return false;
      replaced = true;
      return true;
    })
    .map((entry) => (entry.startsWith(`${key}=`) ? line : entry))
    .join("\n")
    .concat("\n");
}

function writeLocalEnvironment(values: Record<string, string>): void {
  let contents = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, "utf8") : "";
  for (const [key, value] of Object.entries(values)) {
    contents = upsertEnvironmentValue(contents, key, value);
  }
  writeFileSync(ENV_PATH, contents, { encoding: "utf8", mode: 0o600 });
}

function runVercel(args: string[], input?: string): void {
  const result = spawnSync("npx", ["vercel", ...args], {
    cwd: process.cwd(),
    input,
    stdio: [input === undefined ? "inherit" : "pipe", "inherit", "inherit"],
    encoding: "utf8",
    shell: process.platform === "win32",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`Vercel command failed with exit code ${result.status}.`);
  }
}

function provisionVercel(values: Record<string, string>): void {
  for (const [key, value] of Object.entries(values)) {
    runVercel(
      ["env", "add", key, "production", "--force", "--yes"],
      `${value}\n`,
    );
  }
}

async function main(): Promise<void> {
  const options = parseOptions();
  const passwordHash = await hashPassword(options.password);
  const authSecret = randomBytes(48).toString("base64url");
  const values = {
    ADMIN_EMAIL: options.email,
    ADMIN_PASSWORD_HASH: passwordHash,
    AUTH_SECRET: authSecret,
    ...(options.siteUrl ? { NEXT_PUBLIC_SITE_URL: options.siteUrl } : {}),
  };

  if (!(await verifyPassword(options.password, passwordHash))) {
    throw new Error("Generated password hash failed verification.");
  }

  writeLocalEnvironment(values);
  console.log(`Local admin configured for ${options.email}.`);

  if (options.vercel) {
    provisionVercel(values);
    console.log("Vercel Production admin variables configured.");
  }

  if (options.deploy) {
    runVercel(["--prod", "--yes"]);
    console.log("Production deployment completed.");
  } else if (options.vercel) {
    console.log("Redeploy Production before testing the new credentials.");
  } else {
    console.log("Restart the local development server before signing in.");
  }
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Admin setup failed: ${message}`);
  process.exitCode = 1;
});
