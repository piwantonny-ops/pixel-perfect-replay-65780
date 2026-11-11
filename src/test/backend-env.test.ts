import { describe, expect, it } from "vitest";
import { applyNetlifyBackendEnv, BACKEND } from "@/lib/backend-env";

describe("Netlify backend address", () => {
  it("replaces a mistyped Netlify sign-in address with the correct one", () => {
    const env: Record<string, string | undefined> = { NETLIFY: "true", VITE_SUPABASE_URL: "https://yxcciztokovovtrccwhp.supabase.co" };
    expect(applyNetlifyBackendEnv(env)).toBe(true);
    expect(env["VITE_SUPABASE_URL"]).toBe(BACKEND.url);
    expect(env["VITE_SUPABASE_PUBLISHABLE_KEY"]).toBe(BACKEND.publishableKey);
  });
  it("leaves non-Netlify builds alone", () => {
    const env: Record<string, string | undefined> = { VITE_SUPABASE_URL: "https://example.test" };
    expect(applyNetlifyBackendEnv(env)).toBe(false);
    expect(env["VITE_SUPABASE_URL"]).toBe("https://example.test");
  });
});
