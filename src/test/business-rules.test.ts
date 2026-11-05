import { describe, expect, it } from "vitest";
import { canWatch, extendExpiry, isActive, normalizePhone, seedDB } from "@/lib/store";

const DAY = 86400000;

describe("VJEMMA business rules", () => {
  it("default plans match the agreed UGX prices", () => {
    const plans = seedDB().plans.map((p) => [p.name, p.price, p.days]);
    expect(plans).toEqual([["1 Day", 2000, 1], ["3 Days", 3000, 3], ["1 Week", 7000, 7], ["1 Month", 15000, 30]]);
  });
  it("default admin login is admin / 1234", () => {
    const s = seedDB().settings;
    expect([s.adminUser, s.adminPassword]).toEqual(["admin", "1234"]);
  });
  it("VIP movies need an active, unblocked subscription; free ones do not", () => {
    const vip = { ...seedDB().movies[0]!, isFree: false };
    const now = Date.now();
    const user = { id: "u", name: "A", phone: "256", password: "x", blocked: false, watchlist: [], createdAt: now, expiresAt: now + DAY };
    expect(canWatch(vip, null)).toBe(false);
    expect(canWatch(vip, user)).toBe(true);
    expect(canWatch(vip, { ...user, expiresAt: now - 1 })).toBe(false);
    expect(canWatch(vip, { ...user, blocked: true })).toBe(false);
    expect(canWatch({ ...vip, isFree: true }, null)).toBe(true);
    expect(isActive({ ...user, expiresAt: undefined })).toBe(false);
  });
  it("buying again adds days on top of an active plan", () => {
    const now = 1_000_000_000_000;
    expect(extendExpiry(undefined, 7, now)).toBe(now + 7 * DAY);
    expect(extendExpiry(now + 2 * DAY, 1, now)).toBe(now + 3 * DAY);
    expect(extendExpiry(now - DAY, 1, now)).toBe(now + DAY);
  });
  it("Ugandan phone numbers normalise to 256 format", () => {
    expect(normalizePhone("0772 123456")).toBe("256772123456");
  });
});
