import { describe, expect, it } from "vitest";
import { isAdminIdentity } from "@/lib/admin-access";
describe("single admin identity", () => {
  it("allows only the requested verified email with an assigned admin role", () => {
    expect(isAdminIdentity("piwantonny@gmail.com", "admin")).toBe(true);
    expect(isAdminIdentity("other@gmail.com", "admin")).toBe(false);
    expect(isAdminIdentity("piwantonny@gmail.com", undefined)).toBe(false);
  });
  it("never accepts the legacy username and PIN identity", () => {
    expect(isAdminIdentity("admin", "admin")).toBe(false);
  });
});