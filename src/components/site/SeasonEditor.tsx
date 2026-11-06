import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { newId, type Season, type Episode } from "@/lib/store";

export function SeasonEditor({ seasons, onChange }: { seasons: Season[]; onChange: (seasons: Season[]) => void }) {
  const editSeason = (id: string, fn: (s: Season) => Season) => onChange(seasons.map((s) => s.id === id ? fn(s) : s));
  const editEpisode = (seasonId: string, episodeId: string, patch: Partial<Episode>) => editSeason(seasonId, (s) => ({ ...s, episodes: s.episodes.map((e) => e.id === episodeId ? { ...e, ...patch } : e) }));
  return <section className="space-y-4 sm:col-span-2">
    {seasons.map((s) => <div key={s.id} className="space-y-3 border-t border-border pt-4">
      <div className="flex items-center gap-2"><Label htmlFor={`season-${s.id}`}>Season</Label><Input id={`season-${s.id}`} type="number" min={1} className="w-20" value={s.number} onChange={(e) => editSeason(s.id, (x) => ({ ...x, number: Number(e.target.value) }))} /><Button size="icon" variant="ghost" aria-label={`Remove season ${s.number}`} onClick={() => onChange(seasons.filter((x) => x.id !== s.id))}><Trash2 /></Button></div>
      {s.episodes.map((e) => <div key={e.id} className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-2">
        {([{ key: "number", label: "Episode Number", type: "number" }, { key: "title", label: "Episode Title" }, { key: "videoUrl", label: "Video Link" }, { key: "duration", label: "Duration" }, { key: "thumbnail", label: "Thumbnail" }] as const).map((f) => <div key={f.key} className="min-w-0 space-y-1"><Label htmlFor={`${e.id}-${f.key}`}>{f.label}</Label><Input id={`${e.id}-${f.key}`} type={"type" in f ? f.type : "text"} value={e[f.key]} onChange={(event) => editEpisode(s.id, e.id, { [f.key]: f.key === "number" ? Number(event.target.value) : event.target.value })} /></div>)}
        <Button variant="ghost" size="sm" className="self-end" onClick={() => editSeason(s.id, (x) => ({ ...x, episodes: x.episodes.filter((ep) => ep.id !== e.id) }))}><Trash2 /> Remove episode</Button>
      </div>)}
      <Button variant="secondary" onClick={() => editSeason(s.id, (x) => ({ ...x, episodes: [...x.episodes, { id: newId(), number: Math.max(0, ...x.episodes.map((e) => e.number)) + 1, title: "", videoUrl: "", duration: "", thumbnail: "" }] }))}><Plus /> Add Episode</Button>
    </div>)}
    <Button variant="secondary" onClick={() => onChange([...seasons, { id: newId(), number: Math.max(0, ...seasons.map((s) => s.number)) + 1, episodes: [] }])}><Plus /> Add Season</Button>
  </section>;
}