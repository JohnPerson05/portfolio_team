import { spawnSync } from "node:child_process";

import { loadEnvConfig } from "@next/env";

function main(): void {
  loadEnvConfig(process.cwd(), true);
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is missing from the local environment.",
    );
  }

  const result = spawnSync(
    "npx",
    [
      "vercel",
      "env",
      "add",
      "BLOB_READ_WRITE_TOKEN",
      "production",
      "--force",
      "--yes",
    ],
    {
      cwd: process.cwd(),
      input: `${token}\n`,
      stdio: ["pipe", "inherit", "inherit"],
      encoding: "utf8",
      shell: process.platform === "win32",
    },
  );

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`Vercel command failed with exit code ${result.status}.`);
  }

  console.log(
    "Production Blob upload token configured. Redeploy before testing uploads.",
  );
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Blob setup failed: ${message}`);
  process.exitCode = 1;
}
