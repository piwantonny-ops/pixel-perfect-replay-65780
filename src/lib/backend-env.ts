// FINAL VERSION - fixes "Cannot create property on string"

const get = (name: string): string => {
  try {
    if (typeof process !== "undefined" && (process as any).env) {
      return (process as any).env[name] || "";
    }
  } catch {}
  return "";
};

const SUPABASE_URL =
  get("VITE_SUPABASE_URL") ||
  get("SUPABASE_URL") ||
  "";

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

// REQUIRED by vite.config.ts - do not delete
export function applyNetlifyBackendEnv(config: any = {}) {
  if (!config || typeof config !== "object") return config;
  // FIX: define might already be a string - force it to an object
  if (!config.define || typeof config.define !== "object") {
    config.define = {};
  }
  config.define["process.env.SUPABASE_URL"] = JSON.stringify(SUPABASE_URL);
  config.define["process.env.SUPABASE_SERVICE_ROLE_KEY"] = JSON.stringify(SUPABASE_SERVICE_ROLE_KEY);
  return config;
}

export default backendEnv;
