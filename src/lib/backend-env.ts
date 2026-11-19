// Works in BOTH Node (vite.config.ts) and Browser (your site)
// In Node, import.meta.env is undefined, so we use process.env

function getEnv(name: string): string | undefined {
  // 1. Browser / Vite
  try {
    const metaEnv = (globalThis as any)?.import?.meta?.env
      ?? (typeof import.meta !== "undefined" ? (import.meta as any).env : undefined);
    if (metaEnv && metaEnv[name]) return metaEnv[name];
  } catch {}
  // 2. Node / Build
  try {
    if (typeof process !== "undefined" && process.env && process.env[name]) {
      return process.env[name];
    }
  } catch {}
  return undefined;
}

const SUPABASE_URL =
  getEnv("VITE_SUPABASE_URL") ||
  getEnv("SUPABASE_URL") ||
  "";

const SUPABASE_SERVICE_ROLE_KEY =
  getEnv("VITE_SUPABASE_SERVICE_ROLE_KEY") ||
  getEnv("SUPABASE_SERVICE_ROLE_KEY") ||
  getEnv("VITE_SUPABASE_ANON_KEY") ||
  getEnv("VITE_SUPABASE_PUBLISHABLE_KEY") ||
  getEnv("SUPABASE_ANON_KEY") ||
  "";

// Don't throw during build (vite.config.ts imports this in Node)
// Only throw in the browser when it's actually used
function assertEnv() {
  const missing: string[] = [];
  if (!SUPABASE_URL) missing.push("SUPABASE_URL");
  if (!SUPABASE_SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (missing.length > 0) {
    throw new Error(
      `Missing Supabase environment variable(s): ${missing.join(", ")}. Connect Supabase in Lovable Cloud.`
    );
  }
}

// Only check immediately in browser, not during vite build
if (typeof window !== "undefined") {
  assertEnv();
}

export const backendEnv = {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
};

// REQUIRED by vite.config.ts - do not delete
export function applyNetlifyBackendEnv(config: any = {}) {
  if (!config) return config;
  if (!config.define) config.define = {};
  config.define["process.env.SUPABASE_URL"] = JSON.stringify(SUPABASE_URL);
  config.define["process.env.SUPABASE_SERVICE_ROLE_KEY"] = JSON.stringify(SUPABASE_SERVICE_ROLE_KEY);
  return config;
}

export default backendEnv;
