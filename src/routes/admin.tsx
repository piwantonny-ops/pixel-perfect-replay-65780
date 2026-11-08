import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { LogOut, Pencil, Plus, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MovieUpload } from "@/components/site/MovieUpload";
import { SeasonEditor } from "@/components/site/SeasonEditor";
import {
  useDB, useSession, update, setAdmin, isActive, markPaymentPaid, ugx, fmtDate, newId, slugify, ROWS, categoryName,
  saveSettings, loginAdmin, saveMovie, type Movie, type Settings, type Badge,
} from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Admin — VJEMMA MOVIES" },
      { name: "description", content: "VJEMMA MOVIES admin dashboard." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin — VJEMMA MOVIES" },
      { property: "og:description", content: "VJEMMA MOVIES admin dashboard." },
    ],
  }),
  component: AdminPage,
});

const sel = "h-9 w-full rounded-md border border-input bg-background px-3 text-sm";

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="min-w-0 space-y-3 border-t border-border pt-4"><h3 className="font-display text-2xl">{title}</h3>{children}</section>;
}

function AdminLogin() {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        className="w-full max-w-sm space-y-3 rounded-2xl bg-card p-6 shadow-glow"
        onSubmit={(e) => {
          e.preventDefault();
          loginAdmin(u, p).then(() => toast.success("Welcome, admin")).catch(() => toast.error("Wrong username or PIN"));
        }}
      >
        <h1 className="font-display text-4xl tracking-wide">Admin Login</h1>
        <Input placeholder="Username" value={u} onChange={(e) => setU(e.target.value)} />
        <Input type="password" inputMode="numeric" placeholder="Password / PIN" value={p} onChange={(e) => setP(e.target.value)} />
        <Button type="submit" variant="hero" className="w-full">Log in</Button>
        <Link to="/" className="block text-center text-sm text-muted-foreground">← Back to site</Link>
      </form>
    </div>
  );
}

function AdminPage() {
  const { isAdmin } = useSession();
  const { settings } = useDB();
  if (!isAdmin) return <AdminLogin />;
  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-5">
      <div className="mb-4 flex items-center justify-between">
        <Link to="/" className="font-display text-3xl tracking-wider"><span className="bg-gradient-brand bg-clip-text text-transparent">{settings.logoText}</span> <span className="text-muted-foreground">Admin</span></Link>
        <Button variant="ghost" size="sm" onClick={() => setAdmin(false)}><LogOut /> Log out</Button>
      </div>
      <Tabs defaultValue="overview">
        <TabsList className="no-scrollbar w-full justify-start overflow-x-auto">
          {["overview", "media", "shop", "users", "wallet", "settings"].map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize">{t === "users" ? "Users / Clients" : t}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="overview"><Overview /></TabsContent>
        <TabsContent value="media"><Media /></TabsContent>
        <TabsContent value="shop"><ShopAdmin /></TabsContent>
        <TabsContent value="users"><Users /></TabsContent>
        <TabsContent value="wallet"><Wallet /></TabsContent>
        <TabsContent value="settings"><SettingsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Overview() {
  const db = useDB();
  const paid = db.payments.filter((p) => p.status === "Paid");
  const total = paid.reduce((a, p) => a + p.amount, 0);
  const since = Date.now() - 30 * 86400000;
  const last30 = paid.filter((p) => p.createdAt >= since).reduce((a, p) => a + p.amount, 0);
  const active = db.users.filter((u) => isActive(u)).length;
  const conv = db.users.length ? Math.round((new Set(paid.map((p) => p.userId)).size / db.users.length) * 100) : 0;
  const chart = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() - (13 - i) * 86400000);
    const key = d.toDateString();
    return { day: `${d.getDate()}/${d.getMonth() + 1}`, revenue: paid.filter((p) => new Date(p.createdAt).toDateString() === key).reduce((a, p) => a + p.amount, 0) };
  }), [paid]);
  return (
    <div className="space-y-4 pt-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Stat label="Total Users" value={db.users.length} />
        <Stat label="Active Subscriptions" value={active} />
        <Stat label="Total Revenue (UGX)" value={total.toLocaleString()} sub={`${ugx(last30)} in last 30 days`} />
        <Stat label="Titles in Library" value={db.movies.length} />
        <Stat label="Live TV Channels" value={db.settings.liveTvChannels} />
        <Stat label="Conversion" value={`${conv}%`} sub="users who paid" />
      </div>
      <div className="h-64 rounded-xl bg-card p-4">
        <p className="mb-2 text-sm font-semibold">Revenue — last 14 days</p>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={chart}>
            <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)" }} formatter={(v: number) => ugx(v)} />
            <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const emptyMovie = (): Movie => ({
  type: "movie", seasons: [],
  id: "", title: "", vj: "VJ Emma", category: "movies", genres: [], year: new Date().getFullYear(), duration: "", description: "",
  poster: "", banner: "", videoUrl: "", trailerUrl: "", downloadUrl: "", badge: "None", isFree: false, completed: true, featured: false,
  rows: ["latest"], createdAt: Date.now(),
});

function MovieForm({ movie, onClose }: { movie: Movie; onClose: () => void }) {
  const db = useDB();
  const [m, setM] = useState<Movie>(movie);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Movie>(k: K, v: Movie[K]) => setM((x) => ({ ...x, [k]: v }));
  const toggle = (k: "genres" | "rows", v: string) => set(k, m[k].includes(v) ? m[k].filter((x) => x !== v) : [...m[k], v]);
  const save = async (videoUrl = m.videoUrl) => {
    if (!m.title.trim() || !m.poster.trim()) { toast.error("Title and Poster URL are required"); return; }
    if (m.type === "series") {
      const seasons = m.seasons ?? [];
      if (!seasons.length || seasons.some((s) => s.number < 1 || !Number.isInteger(s.number) || !s.episodes.length || new Set(s.episodes.map((e) => e.number)).size !== s.episodes.length || s.episodes.some((e) => !Number.isInteger(e.number) || e.number < 1 || !e.title.trim() || !e.videoUrl.trim())) || new Set(seasons.map((s) => s.number)).size !== seasons.length) {
        toast.error("Add unique seasons and episodes with a title and video link for each episode"); return;
      }
    }
    setSaving(true);
    try {
      const saved = await saveMovie({ ...m, videoUrl });
      setM(saved);
      toast.success("Content saved to Supabase");
      if (!uploadBusy) onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Movie could not be saved");
      throw error;
    } finally { setSaving(false); }
  };
  const F = ({ label, k, ph }: { label: string; k: keyof Movie; ph?: string }) => (
    <div className="space-y-1"><Label>{label}</Label><Input placeholder={ph} value={String(m[k] ?? "")} onChange={(e) => set(k, (k === "year" ? Number(e.target.value) : e.target.value) as never)} /></div>
  );
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-1 sm:col-span-2"><Label htmlFor="content-type">Type</Label><select id="content-type" className={sel} value={m.type ?? "movie"} onChange={(e) => set("type", e.target.value as "movie" | "series")}><option value="movie">Movie</option><option value="series">Series</option></select></div>
      {F({ label: "Title *", k: "title" })}
      {F({ label: "VJ Name", k: "vj" })}
      <div className="space-y-1"><Label>Category</Label>
        <select className={sel} value={m.category} onChange={(e) => set("category", e.target.value)}>
          {db.categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
      </div>
      <div className="space-y-1"><Label>Badge</Label>
        <select className={sel} value={m.badge} onChange={(e) => set("badge", e.target.value as Badge)}>
          {["None", "TOP", "VIP", "Exclusive"].map((b) => <option key={b}>{b}</option>)}
        </select>
      </div>
      {F({ label: "Year", k: "year" })}
      {F({ label: "Duration", k: "duration", ph: "1h 45m" })}
      {F({ label: "Poster Image URL *", k: "poster", ph: "https://…/poster.jpg" })}
      {F({ label: "Banner Image URL (carousel)", k: "banner", ph: "https://…/banner.jpg" })}
      {m.type !== "series" && F({ label: "Video Link", k: "videoUrl", ph: "https://…/movie.mp4" })}
      {m.type !== "series" && <MovieUpload onBusy={setUploadBusy} onUploaded={async (url) => {
        set("videoUrl", url);
        if (!m.title.trim() || !m.poster.trim()) throw new Error("Video uploaded. Add the title and poster, then save content.");
        await save(url);
      }} />}
      {m.type === "series" && <SeasonEditor seasons={m.seasons ?? []} onChange={(seasons) => set("seasons", seasons)} />}
      {F({ label: "Trailer URL", k: "trailerUrl" })}
      {F({ label: "Download URL (optional)", k: "downloadUrl" })}
      <div className="space-y-1 sm:col-span-2"><Label>Description</Label><Textarea value={m.description} onChange={(e) => set("description", e.target.value)} /></div>
      <div className="sm:col-span-2"><Label>Genres</Label>
        <div className="mt-1 flex flex-wrap gap-1.5">{db.genres.map((g) => (
          <button type="button" key={g.id} onClick={() => toggle("genres", g.name)} className={`rounded-full border px-3 py-1 text-xs ${m.genres.includes(g.name) ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{g.name}</button>
        ))}</div>
      </div>
      <div className="sm:col-span-2"><Label>Show in home rows</Label>
        <div className="mt-1 flex flex-wrap gap-1.5">{ROWS.map((r) => (
          <button type="button" key={r.key} onClick={() => toggle("rows", r.key)} className={`rounded-full border px-3 py-1 text-xs ${m.rows.includes(r.key) ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{r.label}</button>
        ))}</div>
      </div>
      <label className="flex items-center gap-2 text-sm"><Switch checked={m.isFree} onCheckedChange={(v) => set("isFree", v)} /> Free (off = VIP)</label>
      <label className="flex items-center gap-2 text-sm"><Switch checked={m.completed} onCheckedChange={(v) => set("completed", v)} /> Completed (off = Ongoing)</label>
      <label className="flex items-center gap-2 text-sm"><Switch checked={m.featured} onCheckedChange={(v) => set("featured", v)} /> Featured in carousel</label>
      <div className="flex gap-2 sm:col-span-2"><Button variant="hero" disabled={uploadBusy || saving} onClick={() => void save().catch(() => {})}>Save content</Button><Button variant="ghost" disabled={uploadBusy || saving} onClick={onClose}>Cancel</Button></div>
    </div>
  );
}

function NameList({ title, items, onAdd, onRename, onDelete, withSlug }: {
  title: string; items: { id: string; name: string; slug?: string }[]; withSlug?: boolean;
  onAdd: (name: string, slug: string) => void; onRename: (id: string, name: string, slug: string) => void; onDelete: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [sl, setSl] = useState("");
  return (
    <div className="rounded-xl bg-card p-4">
      <h3 className="font-display text-2xl tracking-wide">{title}</h3>
      <div className="mt-2 flex gap-2">
        <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        {withSlug && <Input placeholder="slug (auto)" value={sl} onChange={(e) => setSl(e.target.value)} />}
        <Button size="icon" variant="hero" aria-label="Add" onClick={() => { if (!name.trim()) return; onAdd(name.trim(), slugify(sl || name)); setName(""); setSl(""); }}><Plus /></Button>
      </div>
      <ul className="mt-3 max-h-72 space-y-1 overflow-y-auto text-sm">
        {items.map((it) => (
          <li key={it.id} className="flex items-center justify-between rounded bg-muted px-3 py-1.5">
            <span>{it.name}{withSlug && <span className="text-muted-foreground"> /{it.slug}</span>}</span>
            <span className="flex gap-1">
              <button aria-label="Edit" onClick={() => { const n = prompt("New name", it.name); if (n?.trim()) onRename(it.id, n.trim(), withSlug ? (prompt("Slug", it.slug) || it.slug || slugify(n)) : ""); }}><Pencil className="h-4 w-4" /></button>
              <button aria-label="Delete" onClick={() => confirm(`Delete ${it.name}?`) && onDelete(it.id)}><Trash2 className="h-4 w-4 text-destructive" /></button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Taxonomy() {
  const db = useDB();
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <NameList title="Categories" withSlug items={db.categories}
        onAdd={(name, slug) => db.categories.some((c) => c.slug === slug) ? toast.error("Slug already exists") : update((d) => ({ ...d, categories: [...d.categories, { id: newId(), name, slug }] }))}
        onRename={(id, name, slug) => update((d) => {
          const old = d.categories.find((c) => c.id === id)!;
          return { ...d, categories: d.categories.map((c) => (c.id === id ? { ...c, name, slug } : c)), movies: d.movies.map((m) => (m.category === old.slug ? { ...m, category: slug } : m)) };
        })}
        onDelete={(id) => update((d) => ({ ...d, categories: d.categories.filter((c) => c.id !== id) }))} />
      <NameList title="Genres" items={db.genres}
        onAdd={(name) => update((d) => ({ ...d, genres: [...d.genres, { id: newId(), name }] }))}
        onRename={(id, name) => update((d) => {
          const old = d.genres.find((g) => g.id === id)!.name;
          return { ...d, genres: d.genres.map((g) => (g.id === id ? { ...g, name } : g)), movies: d.movies.map((m) => ({ ...m, genres: m.genres.map((x) => (x === old ? name : x)) })) };
        })}
        onDelete={(id) => update((d) => ({ ...d, genres: d.genres.filter((g) => g.id !== id) }))} />
    </div>
  );
}

function Media() {
  const db = useDB();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Movie | null>(null);
  const list = db.movies.filter((m) => m.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-4 pt-3">
      <div className="flex gap-2">
        <Input placeholder="Search movies…" value={q} onChange={(e) => setQ(e.target.value)} />
        <Button variant="hero" className="shrink-0" onClick={() => setEditing(emptyMovie())}><Plus /> Add Content</Button>
      </div>
      <div className="space-y-2">
        {list.map((m) => (
          <div key={m.id} className="flex items-center gap-3 rounded-xl bg-card p-2">
            <img src={m.poster} alt="" className="h-16 w-11 rounded object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{m.title}</p>
              <p className="truncate text-xs text-muted-foreground">{categoryName(db, m.category)} · {m.isFree ? "Free" : "VIP"} · {m.badge !== "None" ? m.badge : "No badge"} · {m.completed ? "Completed" : "Ongoing"}{m.featured ? " · Carousel" : ""}</p>
            </div>
            <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => setEditing(m)}><Pencil /></Button>
            <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => { if (confirm(`Delete ${m.title}?`)) { update((d) => ({ ...d, movies: d.movies.filter((x) => x.id !== m.id) })); toast.success("Deleted"); } }}><Trash2 className="text-destructive" /></Button>
          </div>
        ))}
      </div>
      <Taxonomy />
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display text-3xl tracking-wide">{editing?.id ? "Edit Content" : "Add Content"}</DialogTitle></DialogHeader>
          {editing && <MovieForm movie={editing} onClose={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Users() {
  const db = useDB();
  const [q, setQ] = useState("");
  const list = db.users.filter((u) => `${u.name} ${u.phone}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-3 pt-3">
      <Input placeholder="Search by name or phone…" value={q} onChange={(e) => setQ(e.target.value)} />
      {list.length === 0 && <p className="text-sm text-muted-foreground">No users yet.</p>}
      <div className="overflow-x-auto rounded-xl bg-card">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground"><tr>{["Name", "Phone", "Plan", "Expiry", "Status", ""].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="p-3">{u.name}</td><td className="p-3">{u.phone}</td><td className="p-3">{u.planName ?? "—"}</td>
                <td className="p-3">{u.expiresAt ? fmtDate(u.expiresAt) : "—"}</td>
                <td className="p-3">{u.blocked ? <span className="text-destructive">Blocked</span> : isActive(u) ? <span className="text-success">Active</span> : <span className="text-muted-foreground">Expired</span>}</td>
                <td className="flex gap-1 p-3">
                  <Button size="sm" variant="secondary" onClick={() => update((d) => ({ ...d, users: d.users.map((x) => (x.id === u.id ? { ...x, blocked: !x.blocked } : x)) }))}>{u.blocked ? "Unblock" : "Block"}</Button>
                  <Button size="sm" variant="ghost" aria-label="Delete user" onClick={() => confirm(`Delete ${u.name}?`) && update((d) => ({ ...d, users: d.users.filter((x) => x.id !== u.id) }))}><Trash2 className="text-destructive" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Wallet() {
  const db = useDB();
  const paid = db.payments.filter((p) => p.status === "Paid");
  const total = paid.reduce((a, p) => a + p.amount, 0);
  const last30 = paid.filter((p) => p.createdAt >= Date.now() - 30 * 86400000).reduce((a, p) => a + p.amount, 0);
  return (
    <div className="space-y-3 pt-3">
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Total Revenue" value={ugx(total)} />
        <Stat label="Last 30 days" value={ugx(last30)} />
      </div>
      <p className="text-sm text-muted-foreground">Manual (WhatsApp) payments arrive as Pending. Check your mobile money, then tap “Mark Paid” to activate the customer’s plan.</p>
      {db.payments.length === 0 && <p className="text-sm text-muted-foreground">No payments yet.</p>}
      <div className="space-y-2">
        {db.payments.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-card p-3 text-sm">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{p.userName} <span className="font-normal text-muted-foreground">{p.phone}</span></p>
              <p className="text-xs text-muted-foreground">{p.planName} · {ugx(p.amount)} · {fmtDate(p.createdAt)} · {p.method === "manual" ? "WhatsApp" : "Pesapal"}</p>
            </div>
            <span className={p.status === "Paid" ? "text-success" : "text-accent"}>{p.status}</span>
            {p.status === "Pending" && <Button size="sm" variant="success" onClick={() => { markPaymentPaid(p.id); toast.success("Plan activated"); }}>Mark Paid</Button>}
            <Button size="icon" variant="ghost" aria-label="Delete payment" onClick={() => confirm("Delete this payment record?") && update((d) => ({ ...d, payments: d.payments.filter((x) => x.id !== p.id) }))}><Trash2 className="text-destructive" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsTab() {
  const db = useDB();
  const [s, setS] = useState<Settings>(db.settings);
  const [plan, setPlan] = useState({ name: "", price: "", days: "" });
  const set = (k: keyof Settings, v: string | number) => setS((x) => ({ ...x, [k]: v }));
  const save = (label: string) => {
    try { saveSettings(s, db.plans); toast.success(`${label} saved`); }
    catch { toast.error("Settings could not be saved. Check available browser storage and try again."); }
  };
  const F = (label: string, k: keyof Settings, type = "text", ph = "") => (
    <div className="space-y-1"><Label htmlFor={`setting-${k}`}>{label}</Label><Input id={`setting-${k}`} type={type} placeholder={ph} value={String(s[k] ?? "")} onChange={(e) => set(k, type === "number" ? Number(e.target.value) : e.target.value)} /></div>
  );
  const testR2 = async () => {
    if (!s.r2PublicUrl) { toast.error("Add the R2 Public Link first"); return; }
    try { await fetch(s.r2PublicUrl, { method: "HEAD", mode: "no-cors" }); toast.success("R2 public link is reachable"); }
    catch { toast.error("Could not reach the R2 public link"); }
  };
  return (
    <div className="grid gap-4 pt-3 md:grid-cols-2">
      <div className="md:col-span-2"><Button variant="hero" onClick={() => save("All settings")}>Save All Settings</Button></div>
      <SettingsSection title="Upload backend (Cloudflare R2)">
        {F("Upload backend link", "r2Endpoint", "text", "https://<account>.r2.cloudflarestorage.com")}
        {F("Upload token", "r2Token", "password")}
        {F("R2 Access Key", "r2AccessKey", "password")}
        {F("R2 Secret", "r2Secret", "password")}
        {F("R2 Public Link", "r2PublicUrl", "text", "https://pub-xxxx.r2.dev")}
        <div className="flex gap-2"><Button variant="hero" onClick={() => save("Upload backend")}>Save upload backend</Button><Button variant="secondary" onClick={testR2}>Test connection</Button></div>
        <p className="text-xs text-muted-foreground">For now, paste video and poster links directly when adding a movie.</p>
      </SettingsSection>
      <SettingsSection title="Payments">
        <div className="space-y-1 rounded-lg bg-muted p-3 text-sm">
          <p>Provider: <b>Pesapal</b></p>
          <p>Mode: <b className={s.pesapalKey && s.pesapalSecret ? "text-success" : "text-accent"}>{s.pesapalKey && s.pesapalSecret ? "Pesapal keys added" : "Manual (WhatsApp) — no keys yet"}</b></p>
        </div>
        {F("Pesapal Consumer Key", "pesapalKey", "password")}
        {F("Pesapal Consumer Secret", "pesapalSecret", "password")}
        <Button variant="hero" onClick={() => save("Payment settings")}>Save payment keys</Button>
      </SettingsSection>
      <SettingsSection title="Subscription plans">
        <ul className="space-y-1 text-sm">
          {db.plans.map((p) => (
            <li key={p.id} className="flex items-center justify-between rounded bg-muted px-3 py-1.5">
              <span>{p.name} · {ugx(p.price)} · {p.days} days</span>
              <span className="flex gap-1">
                <button aria-label="Edit plan" onClick={() => {
                  const name = prompt("Plan name", p.name); if (!name) return;
                  const price = Number(prompt("Price (UGX)", String(p.price))); const days = Number(prompt("Days", String(p.days)));
                  if (!price || !days) { toast.error("Invalid price or days"); return; }
                  update((d) => ({ ...d, plans: d.plans.map((x) => (x.id === p.id ? { ...x, name, price, days } : x)) }));
                }}><Pencil className="h-4 w-4" /></button>
                <button aria-label="Delete plan" onClick={() => confirm(`Delete ${p.name}?`) && update((d) => ({ ...d, plans: d.plans.filter((x) => x.id !== p.id) }))}><Trash2 className="h-4 w-4 text-destructive" /></button>
              </span>
            </li>
          ))}
        </ul>
        <div className="grid grid-cols-3 gap-2">
          <Input placeholder="Name" value={plan.name} onChange={(e) => setPlan({ ...plan, name: e.target.value })} />
          <Input placeholder="Price UGX" type="number" value={plan.price} onChange={(e) => setPlan({ ...plan, price: e.target.value })} />
          <Input placeholder="Days" type="number" value={plan.days} onChange={(e) => setPlan({ ...plan, days: e.target.value })} />
        </div>
        <Button variant="secondary" onClick={() => {
          const price = Number(plan.price), days = Number(plan.days);
          if (!plan.name.trim() || !price || !days) { toast.error("Fill name, price and days"); return; }
          update((d) => ({ ...d, plans: [...d.plans, { id: newId(), name: plan.name.trim(), price, days }] }));
          setPlan({ name: "", price: "", days: "" });
        }}><Plus /> Add plan</Button>
      </SettingsSection>
      <SettingsSection title="Mobile app">
        {F("Version", "appVersion")}
        {F("App download link", "appLink", "text", "https://…")}
        {F("App file (.apk / .ipa) URL", "appFileUrl", "text", "https://…/vjemma.apk")}
        <div className="space-y-1"><Label>Release notes</Label><Textarea value={s.appNotes} onChange={(e) => set("appNotes", e.target.value)} /></div>
        <Button variant="hero" onClick={() => save("App release")}>Save app release</Button>
      </SettingsSection>
      <SettingsSection title="Social settings">
        {F("MTN MoMo number (for VIP payments)", "momoNumber", "tel")}
        {F("WhatsApp 1", "whatsapp", "tel")}
        {F("WhatsApp 2", "whatsapp2", "tel")}
        {F("TikTok Link", "tiktok")}
        {F("YouTube Link", "youtube")}
        {F("Facebook Link", "facebook")}
        <Button variant="hero" onClick={() => save("Social links")}>Save social links</Button>
      </SettingsSection>
      <SettingsSection title="Site settings">
        {F("Site Name", "siteName")}
        {F("Logo Text", "logoText")}
        {F("Tagline", "tagline")}
        {F("Live TV channels count", "liveTvChannels", "number")}
        {F("Admin Username", "adminUser")}
        {F("Admin Password / PIN", "adminPassword", "password")}
        <Button variant="hero" onClick={() => { if (s.adminPassword.length < 4) { toast.error("Password must be at least 4 characters"); return; } save("Site settings"); }}>Save site settings</Button>
      </SettingsSection>
      <div className="md:col-span-2"><Taxonomy /></div>
    </div>
  );
}

function ShopAdmin() {
  const db = useDB();
  const blank = { name: "", price: "", image: "", description: "" };
  const [f, setF] = useState(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const save = () => {
    const price = Number(f.price);
    if (!f.name.trim() || !price) { toast.error("Fill product name and price"); return; }
    const item = { id: editing ?? newId(), name: f.name.trim(), price, image: f.image.trim(), description: f.description.trim() };
    update((d) => ({ ...d, products: editing ? d.products.map((x) => (x.id === editing ? item : x)) : [item, ...d.products] }));
    toast.success(editing ? "Product updated" : "Product added");
    setF(blank); setEditing(null);
  };
  return (
    <div className="grid gap-4 pt-3 md:grid-cols-2">
      <div className="space-y-2 rounded-xl bg-card p-4">
        <h3 className="font-display text-2xl">{editing ? "Edit product" : "Add VIP product"}</h3>
        <Input placeholder="Product name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <Input placeholder="Price UGX" type="number" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />
        <Input placeholder="Image link (https://…)" value={f.image} onChange={(e) => setF({ ...f, image: e.target.value })} />
        <Textarea placeholder="Description" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
        <div className="flex gap-2">
          <Button variant="hero" onClick={save}>{editing ? "Save product" : <><Plus /> Add product</>}</Button>
          {editing && <Button variant="ghost" onClick={() => { setEditing(null); setF(blank); }}>Cancel</Button>}
        </div>
      </div>
      <ul className="space-y-2">
        {db.products.length === 0 && <p className="text-sm text-muted-foreground">No shop products yet.</p>}
        {db.products.map((p) => (
          <li key={p.id} className="flex items-center gap-3 rounded-xl bg-card p-3">
            {p.image ? <img src={p.image} alt={p.name} className="h-12 w-12 rounded object-cover" /> : <div className="h-12 w-12 rounded bg-muted" />}
            <div className="min-w-0 flex-1"><p className="truncate font-semibold">{p.name}</p><p className="text-sm text-muted-foreground">{ugx(p.price)}</p></div>
            <Button size="icon" variant="ghost" aria-label="Edit product" onClick={() => { setEditing(p.id); setF({ name: p.name, price: String(p.price), image: p.image, description: p.description }); }}><Pencil /></Button>
            <Button size="icon" variant="ghost" aria-label="Delete product" onClick={() => confirm(`Delete ${p.name}?`) && update((d) => ({ ...d, products: d.products.filter((x) => x.id !== p.id) }))}><Trash2 className="text-destructive" /></Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
