// Fix: Vite only exposes VITE_ variables to the browser
// So we check VITE_ first, then the plain name as fallback

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  (import.meta.env as any).SUPABASE_URL;

const SUPABASE_SERVICE_ROLE_KEY =
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  (import.meta.env as any).SUPABASE_SERVICE_ROLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const missing: string[] = [];
if (!SUPABASE_URL) missing.push("SUPABASE_URL");
if (!SUPABASE_SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");

if (missing.length > 0) {
  throw new Error(
    `Missing Supabase environment variable(s): ${missing.join(", ")}. Connect Supabase in Lovable Cloud.`
  );
}

export const backendEnv = {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
};

// This export is REQUIRED by vite.config.ts - do not delete it
export function applyNetlifyBackendEnv(config: any = {}) {
  if (!config) return config;
  if (!config.define) config.define = {};
  config.define["process.env.SUPABASE_URL"] = JSON.stringify(SUPABASE_URL);
  config.define["process.env.SUPABASE_SERVICE_ROLE_KEY"] = JSON.stringify(SUPABASE_SERVICE_ROLE_KEY);
  return config;
}

export default backendEnv;
