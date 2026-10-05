/**
 * Password hashing & verification (Requirement 9.2, 9.3).
 *
 * NODE-ONLY MODULE. Uses `node:crypto`'s `scrypt` (a memory-hard KDF) so we
 * avoid adding a native or third-party dependency such as bcrypt. This module
 * must NEVER be imported by `middleware.ts` (the Edge runtime lacks
 * `node:crypto`); credential verification only happens in the Node-only login
 * Server Action.
 *
 * Hash format (single self-describing string, safe to store in
 * `ADMIN_PASSWORD_HASH`):
 *
 *   scrypt$N$r$p$<saltHex>$<derivedKeyHex>
 *
 *   - `scrypt`  literal algorithm tag
 *   - N, r, p   scrypt cost parameters (decimal)
 *   - saltHex   random 16-byte salt, hex-encoded
 *   - keyHex    64-byte derived key, hex-encoded
 *
 * Verification is timing-safe: it recomputes the derived key with the stored
 * parameters/salt and compares with `crypto.timingSafeEqual`.
 */

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

/** Algorithm tag stored at the start of every hash string. */
const ALGORITHM = "scrypt";
/** scrypt CPU/memory cost parameter (must be a power of two). */
const COST_N = 16384;
/** scrypt block size parameter. */
const BLOCK_SIZE_R = 8;
/** scrypt parallelization parameter. */
const PARALLELISM_P = 1;
/** Salt length in bytes. */
const SALT_BYTES = 16;
/** Derived key length in bytes. */
const KEY_BYTES = 64;

/** Promise wrapper around the callback-based `scrypt`. */
function scryptAsync(
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number },
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keylen, options, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(derivedKey);
    });
  });
}

/**
 * Hash a plaintext password into the self-describing `scrypt$...` format.
 *
 * Use this to GENERATE the value for `ADMIN_PASSWORD_HASH` (see the
 * `auth:hash` npm script / `scripts/hash-password.ts`).
 */
export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const derivedKey = await scryptAsync(plain, salt, KEY_BYTES, {
    N: COST_N,
    r: BLOCK_SIZE_R,
    p: PARALLELISM_P,
  });
  return [
    ALGORITHM,
    COST_N,
    BLOCK_SIZE_R,
    PARALLELISM_P,
    salt.toString("hex"),
    derivedKey.toString("hex"),
  ].join("$");
}

/**
 * Verify a plaintext password against a stored `scrypt$...` hash.
 *
 * Returns `false` (never throws) for malformed/empty hashes or on any internal
 * error, so a misconfigured `ADMIN_PASSWORD_HASH` simply denies access rather
 * than crashing the login path. The final comparison is timing-safe.
 */
export async function verifyPassword(
  plain: string,
  storedHash: string | undefined | null,
): Promise<boolean> {
  if (!storedHash) {
    return false;
  }

  try {
    const parts = storedHash.split("$");
    if (parts.length !== 6) {
      return false;
    }
    const [algorithm, nRaw, rRaw, pRaw, saltHex, keyHex] = parts;
    if (algorithm !== ALGORITHM) {
      return false;
    }

    const N = Number.parseInt(nRaw as string, 10);
    const r = Number.parseInt(rRaw as string, 10);
    const p = Number.parseInt(pRaw as string, 10);
    if (!Number.isInteger(N) || !Number.isInteger(r) || !Number.isInteger(p)) {
      return false;
    }

    const salt = Buffer.from(saltHex as string, "hex");
    const expected = Buffer.from(keyHex as string, "hex");
    if (salt.length === 0 || expected.length === 0) {
      return false;
    }

    const derivedKey = await scryptAsync(plain, salt, expected.length, {
      N,
      r,
      p,
    });

    // Lengths are guaranteed equal here (keylen === expected.length), so
    // timingSafeEqual is safe to call directly.
    return timingSafeEqual(derivedKey, expected);
  } catch {
    return false;
  }
}
