// Campaign expiry for landing pages. Pure (no React) so it is unit-testable.

/**
 * True when `expiresAt` is a parseable date and `now` is strictly past it.
 * A missing or unparseable `expiresAt` never expires (the build-time
 * validator rejects bad dates, so this only guards against surprises).
 *
 * @param {string|undefined} expiresAt ISO date, e.g. "2026-11-30T23:59:00+05:30"
 * @param {number|Date} [now] defaults to the current time
 */
export function isExpired(expiresAt, now = Date.now()) {
  if (typeof expiresAt !== "string" || expiresAt.trim() === "") return false;
  const deadline = Date.parse(expiresAt);
  if (Number.isNaN(deadline)) return false;
  return Number(now) > deadline;
}

/**
 * What an expired page should do, or `null` while the campaign is live.
 *
 * @param {object} config landing-page config
 * @param {number|Date} [now]
 * @returns {null | { mode: "redirect", redirectTo: string }
 *               | { mode: "waitlist", message?: string, cta?: string }}
 */
export function getExpiryState(config, now = Date.now()) {
  if (!config || !isExpired(config.expiresAt, now)) return null;
  const after = config.afterExpiry && typeof config.afterExpiry === "object" ? config.afterExpiry : {};
  if (after.mode === "redirect" && typeof after.redirectTo === "string" && after.redirectTo.trim()) {
    return { mode: "redirect", redirectTo: after.redirectTo };
  }
  // "waitlist" — also the safe fallback for an expired page with no usable afterExpiry.
  return { mode: "waitlist", message: after.message, cta: after.cta };
}
