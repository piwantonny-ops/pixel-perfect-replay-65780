import { useSyncExternalStore } from "react";
import banner1 from "@/assets/banner-1.jpg";
import banner2 from "@/assets/banner-2.jpg";
import poster1 from "@/assets/poster-1.jpg";
import poster2 from "@/assets/poster-2.jpg";

export type Badge = "TOP" | "VIP" | "Exclusive" | "None";
export interface Movie {
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
  blocked: boolean; planName?: string; expiresAt?: number; watchlist: string[]; createdAt: number;
}
export interface Payment {
  id: string; userId: string; userName: string; phone: string; planId: string; planName: string;
  amount: number; days: number; method: "pesapal" | "manual"; status: "Paid" | "Pending"; createdAt: number;
}
export interface Comment { id: string; movieId: string; name: string; text: string; createdAt: number }
export interface Rating { movieId: string; key: string; stars: number }
export interface Settings {
  siteName: string; logoText: string; tagline: string;
  adminUser: string; adminPassword: string;
  whatsapp: string; tiktok: string; youtube: string; facebook: string;
  pesapalKey: string; pesapalSecret: string;
  r2Endpoint: string; r2Token: string; r2AccessKey: string; r2Secret: string; r2PublicUrl: string;
  appVersion: string; appLink: string; appNotes: string; appFileUrl: string;
  liveTvChannels: number;
}
export interface DB {
  movies: Movie[]; categories: Category[]; genres: Genre[]; plans: Plan[]; users: User[];
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

function seedMovies(): Movie[] {
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
    featured: i < 3, rows: rowSets[i], createdAt: Date.now() - i * 86400000,
  }));
}

export function seedDB(): DB {
  return {
    movies: seedMovies(),
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
      siteName: "VJEMMA MOVIES", logoText: "VJ EMMA", tagline: "VJ EMMA - Translated Movies",
      adminUser: "admin", adminPassword: "1234",
      whatsapp: "256700000000", tiktok: "https://www.tiktok.com/", youtube: "https://www.youtube.com/", facebook: "https://www.facebook.com/",
      pesapalKey: "", pesapalSecret: "", r2Endpoint: "", r2Token: "", r2AccessKey: "", r2Secret: "", r2PublicUrl: "",
      appVersion: "1.0.4", appLink: "", appNotes: "", appFileUrl: "", liveTvChannels: 0,
    },
  };
}

const KEY = "vjemma-db-v1";
const SERVER = seedDB();
let state: DB | null = null;
const listeners = new Set<() => void>();

function load(): DB {
  if (state) return state;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DB;
      state = { ...SERVER, ...parsed, settings: { ...SERVER.settings, ...parsed.settings } };
      return state;
    }
  } catch { /* ignore */ }
  state = seedDB();
  return state;
}

export function update(fn: (db: DB) => DB) {
  state = fn(load());
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
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
  if (on) sessionStorage.setItem(ADMIN, "1"); else sessionStorage.removeItem(ADMIN);
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
