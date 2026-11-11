/**
 * Public sign-in/database address for this app (safe to ship: publishable key only).
 * Netlify builds can carry stale or mistyped VITE_SUPABASE_* values in their dashboard,
 * which override the repo's .env. On Netlify we force the correct values instead.
 */
export const BACKEND = {
  url: "https://c--a36a8cb8-e974-42af-b7dc-6a95c25f2fdf-prod.lovable.cloud",
  publishableKey: "sb_publishable_4zR3-XQAfKqkwLj1ahZUqg_1N_WxfIQ",
  projectId: "tcphseyctfxcvoqtollg",
} as const;

export function applyNetlifyBackendEnv(env: Record<string, string | undefined>) {
  if (env["NETLIFY"] !== "true") return false;
  env["VITE_SUPABASE_URL"] = BACKEND.url;
  env["VITE_SUPABASE_PUBLISHABLE_KEY"] = BACKEND.publishableKey;
  env["VITE_SUPABASE_ANON_KEY"] = BACKEND.publishableKey;
  env["VITE_SUPABASE_PROJECT_ID"] = BACKEND.projectId;
  env["SUPABASE_URL"] = BACKEND.url;
  env["SUPABASE_PUBLISHABLE_KEY"] = BACKEND.publishableKey;
  env["SUPABASE_PROJECT_ID"] = BACKEND.projectId;
  return true;
}
