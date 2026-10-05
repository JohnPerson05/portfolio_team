// ---------------------------------------------------------------------------
// Admin password hash generator (Task 10).
//
// Generates the value for the `ADMIN_PASSWORD_HASH` environment variable using
// the same scrypt format the app verifies against (`@/lib/password`).
//
// Usage (plaintext passed as an argument):
//   npm run auth:hash -- "your-strong-password"
//
// Or via stdin (avoids the password landing in shell history):
//   echo -n "your-strong-password" | npm run auth:hash
//
// Copy the printed `scrypt$...` string into `.env` as ADMIN_PASSWORD_HASH.
// ---------------------------------------------------------------------------

import { hashPassword } from "../src/lib/password";

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8").replace(/\r?\n$/, "");
}

async function main(): Promise<void> {
  const argPassword = process.argv[2];
  const password =
    argPassword !== undefined && argPassword !== ""
      ? argPassword
      : await readStdin();

  if (!password) {
    console.error(
      'Provide a password: npm run auth:hash -- "your-password"\n' +
        '   or: echo -n "your-password" | npm run auth:hash',
    );
    process.exit(1);
    return;
  }

  const hash = await hashPassword(password);
  console.log(hash);
}

void main();
