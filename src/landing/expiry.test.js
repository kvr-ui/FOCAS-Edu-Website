import { describe, expect, it } from "vitest";
import { getExpiryState, isExpired } from "./expiry";

const DEADLINE = "2026-11-30T23:59:00+05:30";
const at = (iso) => Date.parse(iso);

describe("isExpired", () => {
  it("is false before and exactly at the deadline, true after", () => {
    expect(isExpired(DEADLINE, at("2026-11-30T23:58:59+05:30"))).toBe(false);
    expect(isExpired(DEADLINE, at(DEADLINE))).toBe(false);
    expect(isExpired(DEADLINE, at(DEADLINE) + 1)).toBe(true);
  });

  it("respects the timezone offset", () => {
    // 23:59 IST is 18:29 UTC.
    expect(isExpired(DEADLINE, at("2026-11-30T18:30:00Z"))).toBe(true);
    expect(isExpired(DEADLINE, at("2026-11-30T18:28:00Z"))).toBe(false);
  });

  it("accepts a Date for now", () => {
    expect(isExpired(DEADLINE, new Date("2027-01-01T00:00:00Z"))).toBe(true);
  });

  it("never expires without a usable date", () => {
    const later = at("2099-01-01T00:00:00Z");
    expect(isExpired(undefined, later)).toBe(false);
    expect(isExpired("", later)).toBe(false);
    expect(isExpired("not a date", later)).toBe(false);
    expect(isExpired(12345, later)).toBe(false);
  });
});

describe("getExpiryState", () => {
  const after = at("2027-01-01T00:00:00Z");
  const before = at("2026-01-01T00:00:00Z");

  it("is null while the campaign is live or has no expiry", () => {
    expect(getExpiryState({ expiresAt: DEADLINE, afterExpiry: { mode: "waitlist" } }, before)).toBeNull();
    expect(getExpiryState({}, after)).toBeNull();
    expect(getExpiryState(null, after)).toBeNull();
  });

  it("returns the redirect target in redirect mode", () => {
    const cfg = { expiresAt: DEADLINE, afterExpiry: { mode: "redirect", redirectTo: "/focas" } };
    expect(getExpiryState(cfg, after)).toEqual({ mode: "redirect", redirectTo: "/focas" });
  });

  it("returns the closed message in waitlist mode", () => {
    const cfg = { expiresAt: DEADLINE, afterExpiry: { mode: "waitlist", message: "Closed!" } };
    expect(getExpiryState(cfg, after)).toEqual({ mode: "waitlist", message: "Closed!", cta: undefined });
  });

  it("falls back to waitlist when afterExpiry is missing or a redirect has no target", () => {
    expect(getExpiryState({ expiresAt: DEADLINE }, after)?.mode).toBe("waitlist");
    expect(getExpiryState({ expiresAt: DEADLINE, afterExpiry: { mode: "redirect" } }, after)?.mode).toBe("waitlist");
  });
});
