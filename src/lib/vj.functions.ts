import { createServerFn } from "@tanstack/react-start";

/* All database access goes through these server functions. Customer accounts,
   payments and secret keys are never readable from the browser directly. */

const PRIVATE_KEYS = ["adminUser", "adminPassword", "pesapalKey", "pesapalSecret", "r2Endpoint", "r2Token", "r2AccessKey", "r2Secret"] as const;
type Obj = Record<string, unknown>;
type AdminAuth = { u: string; p: string };

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as { from: (t: string) => any };
}

async function hash(pw: string, salt: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: enc.encode(salt), iterations: 100000, hash: "SHA-256" }, key, 256);
  return Array.from(new Uint8Array(bits)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
const rand = () => Array.from(crypto.getRandomValues(new Uint8Array(24))).map((b) => b.toString(16).padStart(2, "0")).join("");
const normPhone = (p: string) => { let d = String(p).replace(/\D/g, ""); if (d.startsWith("0")) d = "256" + d.slice(1); return d; };

function toUser(r: Obj) {
  return { id: r.id as string, name: r.name as string, phone: r.phone as string, password: "", blocked: !!r.blocked,
    planName: (r.plan_name as string) ?? undefined, expiresAt: r.expires_at ? Number(r.expires_at) : undefined,
    watchlist: (r.watchlist as string[]) ?? [], createdAt: new Date(r.created_at as string).getTime() };
}
function toPayment(r: Obj) {
  return { id: r.id as string, userId: r.user_id as string, userName: r.user_name as string, phone: r.phone as string, planId: r.plan_id as string,
    planName: r.plan_name as string, amount: r.amount as number, days: r.days as number, method: r.method as "pesapal" | "manual",
    status: r.status as "Paid" | "Pending", createdAt: new Date(r.created_at as string).getTime() };
}

async function privateSettings(db: Awaited<ReturnType<typeof admin>>) {
  const { data } = await db.from("site_settings").select("value").eq("key", "private").maybeSingle();
  return (data?.value ?? { adminUser: "admin", adminPassword: "1234" }) as Obj;
}
async function checkAdmin(auth: AdminAuth) {
  const db = await admin();
  const priv = await privateSettings(db);
  if (!auth || auth.u !== priv.adminUser || auth.p !== priv.adminPassword) throw new Error("Admin login required");
  return { db, priv };
}
async function userByToken(token: string) {
  if (!token) throw new Error("Please sign in");
  const db = await admin();
  const { data } = await db.from("users").select("*").eq("session_token", token).maybeSingle();
  if (!data) throw new Error("Please sign in again");
  return { db, row: data as Obj };
}

export const getPublicData = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const db = await admin();
    const [m, p, pr, s] = await Promise.all([
      db.from("movies").select("data").order("created_at", { ascending: false }),
      db.from("vip_plans").select("*").order("days"),
      db.from("vip_products").select("*").order("created_at", { ascending: false }),
      db.from("site_settings").select("value").eq("key", "public").maybeSingle(),
    ]);
    return {
      ok: true,
      movies: ((m.data ?? []) as Obj[]).map((r) => r.data as Obj),
      plans: ((p.data ?? []) as Obj[]).map((r) => ({ id: r.id, name: r.name, price: r.price, days: r.days })),
      products: ((pr.data ?? []) as Obj[]).map((r) => ({ id: r.id, name: r.name, price: r.price, image: r.image, description: r.description })),
      settings: (s.data?.value ?? null) as Obj | null,
    } as unknown as PublicData;
  } catch (e) {
    console.error(e);
    return { ok: false, movies: [], plans: [], products: [], settings: null } as unknown as PublicData;
  }
});
export interface PublicData { ok: boolean; movies: Obj[]; plans: Obj[]; products: Obj[]; settings: Obj | null }

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d: AdminAuth) => d)
  .handler(async ({ data }) => {
    const { db, priv } = await checkAdmin(data);
    const [u, p] = await Promise.all([
      db.from("users").select("*").order("created_at", { ascending: false }),
      db.from("payments").select("*").order("created_at", { ascending: false }),
    ]);
    return { users: ((u.data ?? []) as Obj[]).map(toUser), payments: ((p.data ?? []) as Obj[]).map(toPayment), privateSettings: priv as Record<string, string> };
  });

async function replaceAll(db: Awaited<ReturnType<typeof admin>>, table: string, rows: Obj[]) {
  const ids = rows.map((r) => r.id as string);
  if (rows.length) { const { error } = await db.from(table).upsert(rows); if (error) throw new Error(error.message); }
  const { data: existing } = await db.from(table).select("id");
  const gone = ((existing ?? []) as Obj[]).map((r) => r.id as string).filter((id) => !ids.includes(id));
  if (gone.length) await db.from(table).delete().in("id", gone);
}

export const adminSync = createServerFn({ method: "POST" })
  .inputValidator((d: { auth: AdminAuth; movies?: Obj[]; plans?: Obj[]; products?: Obj[]; settings?: Obj; categories?: Obj[]; genres?: Obj[]; contactLinksVersion?: number; users?: Obj[]; payments?: Obj[] }) => d)
  .handler(async ({ data }) => {
    const { db, priv } = await checkAdmin(data.auth);
    if (data.movies) await replaceAll(db, "movies", data.movies.map((m) => ({ id: m.id, data: m, created_at: new Date((m.createdAt as number) || Date.now()).toISOString() })));
    if (data.plans) await replaceAll(db, "vip_plans", data.plans.map((p) => ({ id: p.id, name: p.name, price: p.price, days: p.days })));
    if (data.products) await replaceAll(db, "vip_products", data.products.map((p) => ({ id: p.id, name: p.name, price: p.price, image: p.image ?? "", description: p.description ?? "" })));
    if (data.settings || data.categories || data.genres) {
      const { data: cur } = await db.from("site_settings").select("value").eq("key", "public").maybeSingle();
      const pub = { ...((cur?.value ?? {}) as Obj) };
      if (data.settings) {
        const s = { ...data.settings };
        const nextPriv = { ...priv };
        for (const k of PRIVATE_KEYS) { if (typeof s[k] === "string") nextPriv[k] = s[k]; delete s[k]; }
        pub.settings = { ...s, pesapalReady: !!(nextPriv.pesapalKey && nextPriv.pesapalSecret) };
        await db.from("site_settings").upsert({ key: "private", value: nextPriv, updated_at: new Date().toISOString() });
      }
      if (data.categories) pub.categories = data.categories;
      if (data.genres) pub.genres = data.genres;
      pub.contactLinksVersion = 1;
      await db.from("site_settings").upsert({ key: "public", value: pub, updated_at: new Date().toISOString() });
    }
    if (data.users) {
      const ids = data.users.map((u) => u.id as string);
      for (const u of data.users) {
        await db.from("users").update({ name: u.name, blocked: !!u.blocked, plan_name: u.planName ?? null, expires_at: u.expiresAt ?? null }).eq("id", u.id);
      }
      const { data: existing } = await db.from("users").select("id");
      const gone = ((existing ?? []) as Obj[]).map((r) => r.id as string).filter((id) => !ids.includes(id));
      if (gone.length) await db.from("users").delete().in("id", gone);
    }
    if (data.payments) {
      await replaceAll(db, "payments", data.payments.map((p) => ({ id: p.id, user_id: p.userId, user_name: p.userName, phone: p.phone, plan_id: p.planId, plan_name: p.planName,
        amount: p.amount, days: p.days, method: p.method, status: p.status, created_at: new Date((p.createdAt as number) || Date.now()).toISOString() })));
    }
    return { ok: true };
  });

export const userSignup = createServerFn({ method: "POST" })
  .inputValidator((d: { name: string; phone: string; password: string }) => d)
  .handler(async ({ data }) => {
    const phone = normPhone(data.phone);
    const name = String(data.name ?? "").trim().slice(0, 80);
    if (phone.length < 10 || !name || String(data.password).length < 4) return { error: "Enter your name, a valid phone and a 4+ character password" };
    const db = await admin();
    const { data: ex } = await db.from("users").select("id").eq("phone", phone).maybeSingle();
    if (ex) return { error: "This phone number already has an account. Sign in instead." };
    const id = rand().slice(0, 16), token = rand();
    const { data: row, error } = await db.from("users").insert({ id, name, phone, password_hash: await hash(data.password, phone), session_token: token }).select("*").single();
    if (error) return { error: "Could not create account. Try again." };
    return { user: toUser(row), token };
  });

export const userLogin = createServerFn({ method: "POST" })
  .inputValidator((d: { phone: string; password: string }) => d)
  .handler(async ({ data }) => {
    const phone = normPhone(data.phone);
    const db = await admin();
    const { data: row } = await db.from("users").select("*").eq("phone", phone).maybeSingle();
    if (!row || row.password_hash !== (await hash(String(data.password), phone))) return { error: "Wrong phone number or password" };
    if (row.blocked) return { error: "This account is blocked. Contact us on WhatsApp." };
    const token = rand();
    await db.from("users").update({ session_token: token }).eq("id", row.id);
    return { user: toUser(row), token };
  });

export const userMe = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string }) => d)
  .handler(async ({ data }) => {
    try {
      const { db, row } = await userByToken(data.token);
      const { data: pays } = await db.from("payments").select("*").eq("user_id", row.id).order("created_at", { ascending: false });
      return { user: toUser(row), payments: ((pays ?? []) as Obj[]).map(toPayment) };
    } catch { return { user: null, payments: [] }; }
  });

export const userSaveWatchlist = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; watchlist: string[] }) => d)
  .handler(async ({ data }) => {
    const { db, row } = await userByToken(data.token);
    await db.from("users").update({ watchlist: (data.watchlist ?? []).slice(0, 500).map(String) }).eq("id", row.id);
    return { ok: true };
  });

export const userRequestPayment = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; planId: string; method: "pesapal" | "manual" }) => d)
  .handler(async ({ data }) => {
    const { db, row } = await userByToken(data.token);
    const { data: plan } = await db.from("vip_plans").select("*").eq("id", data.planId).maybeSingle();
    if (!plan) throw new Error("Plan not found");
    const rec = { id: rand().slice(0, 16), user_id: row.id, user_name: row.name, phone: row.phone, plan_id: plan.id, plan_name: plan.name,
      amount: plan.price, days: plan.days, method: data.method === "pesapal" ? "pesapal" : "manual", status: "Pending" };
    const { data: saved, error } = await db.from("payments").insert(rec).select("*").single();
    if (error) throw new Error("Could not save payment request");
    return toPayment(saved);
  });
