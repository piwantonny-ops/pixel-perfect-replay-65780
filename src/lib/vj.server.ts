export const PRIVATE_KEYS = ["adminUser", "adminPassword", "pesapalKey", "pesapalSecret", "r2Endpoint", "r2Token", "r2AccessKey", "r2Secret"] as const;
export type Obj = Record<string, unknown>;
export type AdminAuth = { token: string };

export async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as { from: (t: string) => any };
}

export async function hash(pw: string, salt: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: enc.encode(salt), iterations: 100000, hash: "SHA-256" }, key, 256);
  return Array.from(new Uint8Array(bits)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
export const rand = () => Array.from(crypto.getRandomValues(new Uint8Array(24))).map((b) => b.toString(16).padStart(2, "0")).join("");
export const normPhone = (p: string) => { let d = String(p).replace(/\D/g, ""); if (d.startsWith("0")) d = "256" + d.slice(1); return d; };

export function toUser(r: Obj) {
  return { id: r["id"] as string, name: r["name"] as string, phone: r["phone"] as string, password: "", blocked: !!r["blocked"],
    planName: (r["plan_name"] as string) ?? undefined, expiresAt: r["expires_at"] ? Number(r["expires_at"]) : undefined,
    watchlist: (r["watchlist"] as string[]) ?? [], createdAt: new Date(r["created_at"] as string).getTime() };
}
export function toPayment(r: Obj) {
  return { id: r["id"] as string, userId: r["user_id"] as string, userName: r["user_name"] as string, phone: r["phone"] as string, planId: r["plan_id"] as string,
    planName: r["plan_name"] as string, amount: r["amount"] as number, days: r["days"] as number, method: r["method"] as "pesapal" | "manual",
    status: r["status"] as "Paid" | "Pending", createdAt: new Date(r["created_at"] as string).getTime() };
}

export async function privateSettings(db: Awaited<ReturnType<typeof admin>>) {
  const { data } = await db.from("site_settings").select("value").eq("key", "private").maybeSingle();
  return (data?.value ?? { adminUser: "admin", adminPassword: "1234" }) as Obj;
}
export async function checkAdmin(auth: AdminAuth) {
  const { createClient } = await import("@supabase/supabase-js");
  const { isAdminIdentity } = await import("./admin-access");
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key || !auth?.token) throw new Error("Admin sign-in required");
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${auth.token}` }, fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } },
  });
  const { data: identity, error } = await client.auth.getUser(auth.token);
  if (error || !identity.user) throw new Error("Admin sign-in required");
  const { data: role } = await client.from("user_roles").select("role").eq("user_id", identity.user.id).eq("role", "admin").maybeSingle();
  if (!isAdminIdentity(identity.user.email, role?.role)) throw new Error("This account does not have admin access");
  const db = await admin();
  const priv = await privateSettings(db);
  delete priv["adminUser"];
  delete priv["adminPassword"];
  return { db, priv };
}
export async function userByToken(token: string) {
  if (!token) throw new Error("Please sign in");
  const db = await admin();
  const { data } = await db.from("users").select("*").eq("session_token", token).maybeSingle();
  if (!data) throw new Error("Please sign in again");
  return { db, row: data as Obj };
}


export async function replaceAll(db: Awaited<ReturnType<typeof admin>>, table: string, rows: Obj[]) {
  const ids = rows.map((r) => r["id"] as string);
  if (rows.length) { const { error } = await db.from(table).upsert(rows); if (error) throw new Error(error.message); }
  const { data: existing } = await db.from(table).select("id");
  const gone = ((existing ?? []) as Obj[]).map((r) => r["id"] as string).filter((id) => !ids.includes(id));
  if (gone.length) await db.from(table).delete().in("id", gone);
}

