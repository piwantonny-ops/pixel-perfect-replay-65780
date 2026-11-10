import { useSyncExternalStore } from "react";
import banner1 from "@/assets/banner-1.jpg";
import banner2 from "@/assets/banner-2.jpg";
import poster1 from "@/assets/poster-1.jpg";
import poster2 from "@/assets/poster-2.jpg";
import { getPublicData, adminLogin, adminSync, userMe, adminSaveMovie } from "./vj.functions";
import { PINNED_MOVIES } from "./pinned-movies";
import { supabase } from "@/integrations/supabase/client";

export const ADMIN_EMAIL = "piwantonny@gmail.com";

/** Built-in movies always appear first; a saved copy with the same id wins. */
export function withPinned(movies: Movie[]): Movie[] {
  const ids = new Set(movies.map((m) => m.id));
  return [...PINNED_MOVIES.filter((m) => !ids.has(m.id)), ...movies];
}

export type Badge = "TOP" | "VIP" | "Exclusive" | "None";
export interface Episode { id: string; number: number; title: string; videoUrl: string; duration: string; thumbnail: string }
export interface Season { id: string; number: number; episodes: Episode[] }
export interface Movie {
  type?: "movie" | "series";
  seasons?: Season[];
  id: string;
  title: string;
  vj: string;
  category: string; // category slug
  genres: string[];
  year: number;
  duration: string;
  description: string;
  poster: string;
  banner: string;
  videoUrl: string;
  trailerUrl: string;
  downloadUrl: string;
  badge: Badge;
  isFree: boolean;
  completed: boolean;
  featured: boolean;
  rows: string[]; // latest, trending, top50, recommended, week, upcoming
  createdAt: number;
}
export interface Category { id: string; name: string; slug: string }
export interface Genre { id: string; name: string }
export interface Plan { id: string; name: string; price: number; days: number }
export interface User {
  id: string; name: string; phone: string; password: string;
  blocked: boolean; planName?: string | undefined; expiresAt?: number | undefined; watchlist: string[]; createdAt: number;
}
export interface Payment {
  id: string; userId: string; userName: string; phone: string; planId: string; planName: string;
  amount: number; days: number; method: "pesapal" | "manual"; status: "Paid" | "Pending"; createdAt: number;
}
export interface Product { id: string; name: string; price: number; image: string; description: string }
export interface Comment { id: string; movieId: string; name: string; text: string; createdAt: number }
export interface Rating { movieId: string; key: string; stars: number }
export interface Settings {
  siteName: string; logoText: string; tagline: string;
  adminUser: string; adminPassword: string;
  whatsapp: string; whatsapp2: string; tiktok: string; youtube: string; facebook: string;
  pesapalKey: string; pesapalSecret: string;
  r2Endpoint: string; r2Token: string; r2AccessKey: string; r2Secret: string; r2PublicUrl: string;
  appVersion: string; appLink: string; appNotes: string; appFileUrl: string;
  liveTvChannels: number;
  momoNumber?: string; pesapalReady?: boolean;
}
export interface DB {
  contactLinksVersion?: number;
  movies: Movie[]; products: Product[]; categories: Category[]; genres: Genre[]; plans: Plan[]; users: User[];
  payments: Payment[]; comments: Comment[]; ratings: Rating[]; settings: Settings;
}

export const ROWS = [
  { key: "latest", label: "Latest" },
  { key: "trending", label: "Trending" },
  { key: "top50", label: "Top 50" },
  { key: "recommended", label: "Recommended" },
  { key: "week", label: "For the Week" },
  { key: "upcoming", label: "Upcoming Selections" },
];

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
export const newId = uid;
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
export const slugify = slug;

const CATS = ["Movies", "Recommended", "Top 50", "Drama", "Love Story", "Animation", "Old Skull", "Nigerian", "Short Series", "Live TV", "Upcoming Selections", "For the Week", "Christian Movies"];
const GENRES = ["Action", "Adventure", "Military", "Action Adventure", "Horror", "SciFi", "Comedy", "Nigerian", "Indian", "Drama", "Series"];
const SAMPLE_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export function seedMovies(): Movie[] {
  const list: [string, string, string[], string, string, Badge, boolean][] = [
    ["Blood River Completed", "movies", ["Action", "Adventure"], banner1, banner1, "TOP", false],
    ["Neon Warfare", "movies", ["Military", "SciFi"], banner2, banner2, "VIP", false],
    ["City of Hearts", "love-story", ["Drama"], poster1, banner2, "Exclusive", true],
    ["Whispering Woods", "movies", ["Horror"], poster2, banner1, "None", true],
    ["Spear of the King", "drama", ["Action", "Drama"], banner1, banner1, "VIP", false],
    ["Last Battalion", "movies", ["Military", "Action"], banner2, banner2, "TOP", false],
    ["Lagos Nights", "nigerian", ["Nigerian", "Comedy"], poster1, banner1, "None", true],
    ["The Haunting Hour", "short-series", ["Horror", "Series"], poster2, banner2, "Exclusive", false],
    ["Mumbai Promise", "love-story", ["Indian", "Drama"], poster1, banner1, "VIP", false],
    ["Star Raiders", "animation", ["SciFi", "Adventure"], banner2, banner2, "None", true],
    ["Old Warrior", "old-skull", ["Action"], banner1, banner1, "TOP", false],
    ["Grace Abounding", "christian-movies", ["Drama"], poster1, banner2, "None", true],
  ];
  const rowSets = [
    ["latest", "trending", "top50"], ["latest", "trending", "recommended"], ["latest", "week"],
    ["latest", "upcoming", "trending"], ["top50", "recommended", "week"], ["trending", "top50"],
    ["latest", "recommended"], ["week", "upcoming"], ["recommended", "top50"], ["upcoming", "latest"],
    ["top50", "week"], ["recommended", "upcoming"],
  ];
  return list.map(([title, category, genres, poster, banner, badge, isFree], i) => ({
    id: slug(title), title, vj: "VJ Emma", category, genres, year: 2026 - (i % 4), duration: `${1 + (i % 2)}h ${10 + i * 3}m`,
    description: `${title} — translated by VJ Emma. A gripping story full of twists, courage and emotion that will keep you watching until the very end.`,
    poster, banner, videoUrl: SAMPLE_VIDEO, trailerUrl: SAMPLE_VIDEO, downloadUrl: "", badge, isFree, completed: i % 3 !== 1,
    featured: i < 3, rows: rowSets[i] ?? ["latest"], createdAt: Date.now() - i * 86400000,
  }));
}

export function seedDB(): DB {
  return {
    contactLinksVersion: 1,
    movies: [...PINNED_MOVIES],
    products: [],
    categories: CATS.map((name) => ({ id: slug(name), name, slug: slug(name) })),
    genres: GENRES.map((name) => ({ id: slug(name), name })),
    plans: [
      { id: "1-day", name: "1 Day", price: 2000, days: 1 },
      { id: "3-days", name: "3 Days", price: 3000, days: 3 },
      { id: "1-week", name: "1 Week", price: 7000, days: 7 },
      { id: "1-month", name: "1 Month", price: 15000, days: 30 },
    ],
    users: [], payments: [], comments: [], ratings: [],
    settings: {
      siteName: "VJEMMA MOVIES", logoText: "VJ EMMA", tagline: "VJ Emma — Movies translated to Luo · Obangaber Cinema Club",
      adminUser: "piwantonny@gmail.com", adminPassword: "1234",
      whatsapp: "0776043203", whatsapp2: "0779818746", tiktok: "https://www.tiktok.com/@vjemmaoffical", youtube: "https://youtube.com/@vjemmaofficial", facebook: "",
      pesapalKey: "", pesapalSecret: "", r2Endpoint: "", r2Token: "", r2AccessKey: "", r2Secret: "", r2PublicUrl: "",
      appVersion: "1.0.4", appLink: "", appNotes: "", appFileUrl: "", liveTvChannels: 0, momoNumber: "0776043203",
    },
  };
}

const KEY = "vjemma-db-v1";
const SERVER = seedDB();
let state: DB | null = null;
const listeners = new Set<() => void>();

export function restoreDB(parsed: Partial<DB>): DB {
  const settings = { ...SERVER.settings, ...parsed.settings };
  if (parsed.contactLinksVersion !== 1) {
    settings.whatsapp = SERVER.settings.whatsapp;
    settings.whatsapp2 = SERVER.settings.whatsapp2;
    settings.tiktok = SERVER.settings.tiktok;
    settings.youtube = SERVER.settings.youtube;
    if (settings.facebook === "https://www.facebook.com/") settings.facebook = "";
  }
  return { ...SERVER, ...parsed, movies: withPinned(parsed.movies ?? []), products: parsed.products ?? [], settings, contactLinksVersion: 1 };
}

export function seriesEpisodes(m: Movie) {
  return [...(m.seasons ?? [])].sort((a, b) => a.number - b.number).flatMap((season) =>
    [...season.episodes].sort((a, b) => a.number - b.number).map((episode) => ({ ...episode, seasonNumber: season.number })));
}

export function seriesSummary(m: Movie) {
  if (m.type !== "series") return "";
  const season = [...(m.seasons ?? [])].sort((a, b) => a.number - b.number)[0];
  const count = season?.episodes.length ?? 0;
  return `Series - Season ${season?.number ?? 1} - ${count} Episode${count === 1 ? "" : "s"}`;
}

function load(): DB {
  if (state) return state;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DB;
      state = restoreDB(parsed);
      return state;
    }
  } catch { /* ignore */ }
  state = seedDB();
  return state;
}

function commit(next: DB) {
  localStorage.setItem(KEY, JSON.stringify(next));
  state = next;
  listeners.forEach((l) => l());
}

export function update(fn: (db: DB) => DB) {
  const prev = load();
  const next = fn(prev);
  commit(next);
  void persist(prev, next);
}

/* ---------- Supabase sync ---------- */
const ADMIN_AUTH = "vjemma-admin-auth";
const TOKEN = "vjemma-token";
/** The admin's signed-in email-link session, if any. */
export const getAdminAuth = async () => {
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  return session && session.user.email?.toLowerCase() === ADMIN_EMAIL ? { token: session.access_token } : null;
};
export const getUserToken = () => localStorage.getItem(TOKEN) ?? "";

async function persist(prev: DB, next: DB) {
  const auth = await getAdminAuth();
  if (!auth || !readSession().admin) return;
  const payload: Parameters<typeof adminSync>[0]["data"] = { auth };
  if (prev.movies !== next.movies) payload.movies = next.movies as never;
  if (prev.plans !== next.plans) payload.plans = next.plans as never;
  if (prev.products !== next.products) payload.products = next.products as never;
  if (prev.settings !== next.settings) payload.settings = next.settings as never;
  if (prev.categories !== next.categories) payload.categories = next.categories as never;
  if (prev.genres !== next.genres) payload.genres = next.genres as never;
  if (prev.users !== next.users) payload.users = next.users as never;
  if (prev.payments !== next.payments) payload.payments = next.payments as never;
  if (Object.keys(payload).length === 1) return;
  try { await adminSync({ data: payload }); }
  catch (e) { console.error(e); import("sonner").then(({ toast }) => toast.error("Could not save to the database. Check your connection.")); }
}

let hydrated = false;
export async function refreshFromServer() {
  const pub = await getPublicData();
  if (pub.ok) {
    const cur = load();
    const ps = (pub.settings ?? {}) as Partial<DB> & { settings?: Partial<Settings> };
    commit({
      ...cur,
      movies: withPinned(pub.movies.length ? (pub.movies as unknown as Movie[]) : cur.movies),
      plans: pub.plans.length ? (pub.plans as unknown as Plan[]) : cur.plans,
      products: pub.products as unknown as Product[],
      categories: ps.categories ?? cur.categories,
      genres: ps.genres ?? cur.genres,
      settings: ps.settings ? { ...cur.settings, ...ps.settings } : cur.settings,
    });
  }
  const token = getUserToken();
  if (token) {
    const me = await userMe({ data: { token } });
    if (me.user) {
      const currentUser = me.user;
      const cur = load();
      commit({ ...cur, users: [me.user, ...cur.users.filter((u) => u.id !== currentUser.id)],
        payments: [...me.payments, ...cur.payments.filter((p) => p.userId !== currentUser.id)] });
    } else { localStorage.removeItem(TOKEN); setSessionUser(null); }
  }
  const auth = await getAdminAuth();
  if (auth) await restoreAdmin(auth).catch(() => setAdmin(false));
  return pub.ok;
}

/** Emails a one-time login link to the admin address. Only the admin email is accepted. */
export async function sendAdminLoginLink(email: string) {
  if (email.trim().toLowerCase() !== ADMIN_EMAIL) throw new Error("This email is not the admin email.");
  const { error } = await supabase.auth.signInWithOtp({
    email: ADMIN_EMAIL,
    options: { emailRedirectTo: `${window.location.origin}/admin`, shouldCreateUser: true },
  });
  if (error) throw new Error(error.message);
}

/** Verifies the admin session on the server, loads private data and uploads any collections the database is still missing. */
async function restoreAdmin(auth: { token: string }) {
  sessionStorage.removeItem(ADMIN_AUTH);
  const res = await adminLogin({ data: auth });
  const pub = await getPublicData();
  const cur = load();
  commit({ ...cur, users: res.users, payments: res.payments, settings: { ...cur.settings, ...res.privateSettings } });
  if (pub.ok) {
    const missing: Parameters<typeof adminSync>[0]["data"] = { auth };
    if (!pub.movies.length && cur.movies.length) missing.movies = cur.movies as never;
    if (!pub.settings) { missing.settings = load().settings as never; missing.categories = cur.categories as never; missing.genres = cur.genres as never; }
    if (Object.keys(missing).length > 1) await adminSync({ data: missing });
  }
  setAdmin(true);
}

export function signInUser(user: User, token: string) {
  localStorage.setItem(TOKEN, token);
  const cur = load();
  commit({ ...cur, users: [user, ...cur.users.filter((u) => u.id !== user.id)] });
  setSessionUser(user.id);
}
export function signOutUser() { localStorage.removeItem(TOKEN); setSessionUser(null); }

/** Local-only state change (already saved on the server by a dedicated call). */
export function updateLocal(fn: (db: DB) => DB) { commit(fn(load())); }

export function saveSettings(settings: Settings, plans: Plan[]) {
  update((db) => ({ ...db, settings: { ...settings }, plans: plans.map((p) => ({ ...p })) }));
}

function subscribe(l: () => void) {
  listeners.add(l);
  if (!hydrated) {
    hydrated = true;
    void refreshFromServer().catch((e) => console.error(e));
    supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" || session?.user.email?.toLowerCase() !== ADMIN_EMAIL || readSession().admin) return;
      void restoreAdmin({ token: session.access_token }).catch((e) => { console.error(e); setAdmin(false); });
    });
  }
  const onStorage = (e: StorageEvent) => { if (e.key === KEY || e.key === SESSION) { state = null; l(); } };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(l); window.removeEventListener("storage", onStorage); };
}

export function useDB(): DB {
  return useSyncExternalStore(subscribe, load, () => SERVER);
}

/* ---------- session ---------- */
const SESSION = "vjemma-session";
const ADMIN = "vjemma-admin";
let sessionCache: { user: string | null; admin: boolean } | null = null;
const SERVER_SESSION = { user: null, admin: false };
function readSession() {
  if (!sessionCache) {
    sessionCache = { user: localStorage.getItem(SESSION), admin: sessionStorage.getItem(ADMIN) === "1" };
  }
  return sessionCache;
}
function emit() { sessionCache = null; listeners.forEach((l) => l()); }
export function useSession() {
  const s = useSyncExternalStore(subscribe, readSession, () => SERVER_SESSION);
  const db = useDB();
  const user = db.users.find((u) => u.id === s.user) ?? null;
  return { user, isAdmin: s.admin };
}
export function setSessionUser(id: string | null) {
  if (id) localStorage.setItem(SESSION, id); else localStorage.removeItem(SESSION);
  emit();
}
export function setAdmin(on: boolean) {
  if (on) sessionStorage.setItem(ADMIN, "1"); else { sessionStorage.removeItem(ADMIN); sessionStorage.removeItem("vjemma-admin-auth"); void supabase.auth.signOut(); }
  emit();
}

/* ---------- business rules ---------- */
export function isActive(u: User | null | undefined, now = Date.now()) {
  return !!u && !u.blocked && !!u.expiresAt && u.expiresAt > now;
}
export function canWatch(m: Movie, u: User | null | undefined) {
  return m.isFree || isActive(u);
}
/** Extends from current expiry if still active, otherwise from now. */
export function extendExpiry(current: number | undefined, days: number, now = Date.now()) {
  const base = current && current > now ? current : now;
  return base + days * 86400000;
}
export function normalizePhone(p: string) {
  let d = p.replace(/\D/g, "");
  if (d.startsWith("0")) d = "256" + d.slice(1);
  return d;
}
export const ugx = (n: number) => `UGX ${n.toLocaleString("en-US")}`;
export const fmtDate = (t: number) => new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export function markPaymentPaid(paymentId: string) {
  update((db) => {
    const p = db.payments.find((x) => x.id === paymentId);
    if (!p || p.status === "Paid") return db;
    return {
      ...db,
      payments: db.payments.map((x) => (x.id === paymentId ? { ...x, status: "Paid" } : x)),
      users: db.users.map((u) => (u.id === p.userId ? { ...u, planName: p.planName, expiresAt: extendExpiry(u.expiresAt, p.days) } : u)),
    };
  });
}

export function categoryName(db: DB, s: string) {
  return db.categories.find((c) => c.slug === s)?.name ?? s;
}
export function avgRating(db: DB, movieId: string) {
  const r = db.ratings.filter((x) => x.movieId === movieId);
  return r.length ? r.reduce((a, b) => a + b.stars, 0) / r.length : 0;
}

export async function saveMovie(movie: Movie): Promise<Movie> {
  const auth = await getAdminAuth();
  if (!auth) throw new Error("Please sign in as admin");
  const cur = load();
  let id = movie.id || slugify(movie.title) || newId();
  if (!movie.id && cur.movies.some((m) => m.id === id)) id += `-${newId()}`;
  const next = { ...movie, id, createdAt: movie.createdAt || Date.now() };
  await adminSaveMovie({ data: { auth, movie: next } });
  updateLocal((db) => ({ ...db, movies: [next, ...db.movies.filter((m) => m.id !== id)] }));
  return next;
}
