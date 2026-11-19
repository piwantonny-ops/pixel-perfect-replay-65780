// Works in BOTH Browser and Node - uses ?. so it never crashes

const get = (name: string): string => {
  // 1. Browser - Vite injects this at build time
  try {
    const viteEnv = (import.meta as any)?.env;
    if (viteEnv && viteEnv[name]) return viteEnv[name];
  } catch {}
  // 2. Node - vite.config.ts / build
  try {
    if (typeof process !== "undefined" && (process as any).env && (process as any).env[name]) {
      return (process as any).env[name];
    }
  } catch {}
  return "";
};

const SUPABASE_URL =
  get("VITE_SUPABASE_URL") || get("SUPABASE_URL") || "";

const SUPABASE_SERVICE_ROLE_KEY =
  get("VITE_SUPABASE_SERVICE_ROLE_KEY") ||
  get("SUPABASE_SERVICE_ROLE_KEY") ||
  get("VITE_SUPABASE_ANON_KEY") ||
  get("SUPABASE_ANON_KEY") ||
  get("VITE_SUPABASE_PUBLISHABLE_KEY") ||
  "";

if (typeof window !== "undefined") {
  const missing: string[] = [];
  if (!SUPABASE_URL) missing.push("SUPABASE_URL");
  if (!SUPABASE_SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (missing.length > 0) {
    throw new Error(
      `Missing Supabase environment variable(s): ${missing.join(", ")}. Connect Supabase in Lovable Cloud.`
    );
  }
}

export const backendEnv = {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
};

export function applyNetlifyBackendEnv(config: any = {}) {
  if (!config || typeof config !== "object") return config;
  if (!config.define || typeof config.define !== "object") {
    config.define = {};
  }
  config.define["process.env.SUPABASE_URL"] = JSON.stringify(SUPABASE_URL);
  config.define["process.env.SUPABASE_SERVICE_ROLE_KEY"] = JSON.stringify(SUPABASE_SERVICE_ROLE_KEY);
  return config;
}

export default backendEnv;
