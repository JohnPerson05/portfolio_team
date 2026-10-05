/**
 * Signed session token (Requirement 9; Properties 7 & 8).
 *
 * EDGE-SAFE MODULE. Everything here relies only on the Web Crypto API
 * (`crypto.subtle`), `TextEncoder`/`TextDecoder`, and `btoa`/`atob` — all of
 * which are available in BOTH the Node.js and the Edge (middleware) runtimes.
 * It deliberately avoids `node:crypto` and `next/headers` so that
 * `middleware.ts` can import it without pulling Node-only code into the Edge
 * bundle.
 *
 * Token format: `${payloadB64url}.${signatureB64url}` where
 *   - payload  = base64url(JSON.stringify({ sub, iat, exp }))
 *   - signature = base64url(HMAC-SHA256(payload, AUTH_SECRET))
 *
 * Verification recomputes the HMAC and compares it via `crypto.subtle.verify`
 * (a constant-time operation), then checks the expiry. Any tampering with the
 * payload invalidates the signature; an elapsed `exp` invalidates the token.
 */

/** Name of the cookie that carries the signed session token. */
export const SESSION_COOKIE_NAME = "portfolio_session";

/**
 * Path of the admin login page. Defined in this Edge-safe module so both the
 * middleware (Edge) and `@/lib/auth` (Node) can share a single source of truth
 * without the middleware importing Node-only code.
 */
export const ADMIN_LOGIN_PATH = "/admin/login";

/** Default session lifetime: 7 days (in seconds). */
export const DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

/** Decoded session payload carried inside the signed token. */
export interface SessionPayload {
  /** Subject — the owner's email. */
  sub: string;
  /** Issued-at, epoch seconds. */
  iat: number;
  /** Expiry, epoch seconds. */
  exp: number;
}

/** Options shared by the token helpers (primarily for deterministic tests). */
export interface SessionTokenOptions {
  /** Override the signing secret; defaults to `process.env.AUTH_SECRET`. */
  secret?: string;
  /** Override the current time (epoch seconds); defaults to `Date.now()`. */
  now?: number;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * Resolve the HMAC signing secret from the environment.
 *
 * Throws when `AUTH_SECRET` is unset — a hard misconfiguration for the signing
 * path. The verification path treats a throw here as "cannot verify" and
 * returns `null` (see {@link verifySessionToken}).
 */
function resolveSecret(override?: string): string {
  const secret = override ?? process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set; cannot sign or verify sessions.");
  }
  return secret;
}

/** Import the raw secret as an HMAC-SHA256 key usable by Web Crypto. */
async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/** Encode bytes as a URL-safe, unpadded base64 string. */
function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i] as number);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Decode a URL-safe base64 string back to bytes. Throws on malformed input.
 *
 * The result is explicitly backed by a plain `ArrayBuffer` (not
 * `ArrayBufferLike`) so it satisfies the `BufferSource` parameter type expected
 * by `crypto.subtle.verify` under the strict DOM lib types.
 */
function base64UrlDecode(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** Narrow an unknown value to a well-formed {@link SessionPayload}. */
function isSessionPayload(value: unknown): value is SessionPayload {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.sub === "string" &&
    typeof candidate.iat === "number" &&
    typeof candidate.exp === "number"
  );
}

/**
 * Create a signed session token for the given payload (Property 8).
 *
 * The payload already carries its own `iat`/`exp`; this function only encodes
 * and signs it. Rejects if `AUTH_SECRET` is unset.
 */
export async function createSessionToken(
  payload: SessionPayload,
  options: SessionTokenOptions = {},
): Promise<string> {
  const secret = resolveSecret(options.secret);
  const payloadPart = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const key = await importHmacKey(secret);
  const signature = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, encoder.encode(payloadPart)),
  );
  return `${payloadPart}.${base64UrlEncode(signature)}`;
}

/**
 * Verify a session token and return its payload, or `null` if invalid
 * (Property 7 & 8).
 *
 * Returns `null` when: the token is malformed, the signature does not match
 * (tampering), the payload shape is wrong, or the token has expired. Signature
 * comparison uses `crypto.subtle.verify`, which is constant-time. Any internal
 * error (including a missing secret) is treated as a verification failure.
 */
export async function verifySessionToken(
  token: string | undefined | null,
  options: SessionTokenOptions = {},
): Promise<SessionPayload | null> {
  if (!token) {
    return null;
  }

  try {
    const secret = resolveSecret(options.secret);
    const now = options.now ?? Math.floor(Date.now() / 1000);

    const parts = token.split(".");
    if (parts.length !== 2) {
      return null;
    }
    const [payloadPart, signaturePart] = parts;
    if (!payloadPart || !signaturePart) {
      return null;
    }

    const key = await importHmacKey(secret);
    const signatureValid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlDecode(signaturePart),
      encoder.encode(payloadPart),
    );
    if (!signatureValid) {
      return null;
    }

    const decoded: unknown = JSON.parse(
      decoder.decode(base64UrlDecode(payloadPart)),
    );
    if (!isSessionPayload(decoded)) {
      return null;
    }

    // Reject expired tokens (exp is inclusive of "now or earlier" = expired).
    if (decoded.exp <= now) {
      return null;
    }

    return decoded;
  } catch {
    // Malformed base64/JSON, missing secret, etc. — never throw to the caller.
    return null;
  }
}

/**
 * Edge-friendly authorization check used by `middleware.ts`.
 *
 * Returns `true` only when the supplied token is present, correctly signed, and
 * unexpired. Pure with respect to its input (modulo the configured secret/
 * clock), which makes it directly unit-testable without a request object.
 */
export async function isAuthorizedRequest(
  token: string | undefined | null,
  options: SessionTokenOptions = {},
): Promise<boolean> {
  return (await verifySessionToken(token, options)) !== null;
}
