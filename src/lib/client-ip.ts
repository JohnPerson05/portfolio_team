/** Fallback client identifier when no forwarding header is present. */
const UNKNOWN_IP = "unknown";

/**
 * Derive the client IP from a request `Headers` object.
 *
 * Uses the first hop of `x-forwarded-for` (the original client as seen by the
 * edge/proxy), falling back to `x-real-ip`, then to `unknown`.
 */
export function getClientIp(requestHeaders: Headers): string {
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  if (forwardedFor) {
    const [firstHop] = forwardedFor.split(",");
    const trimmed = firstHop?.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  const realIp = requestHeaders.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  return UNKNOWN_IP;
}
