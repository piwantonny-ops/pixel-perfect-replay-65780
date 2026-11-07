import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Bookmark, BookmarkCheck, Download, Lock, Play, Share2, Star, Trash2, SkipForward } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { MovieBadges, MovieRow } from "@/components/site/MovieCard";
import { AuthDialog } from "@/components/site/AuthDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDB, useSession, update, canWatch, categoryName, avgRating, newId, fmtDate, seriesEpisodes, seriesSummary, type Episode, updateLocal, getUserToken } from "@/lib/store";
import { userSaveWatchlist } from "@/lib/vj.functions";

export const Route = createFileRoute("/movie/$id")({
  head: ({ params }) => {
    const name = params.id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return {
      meta: [
      { name: "twitter:card", content: "summary_large_image" },
        { title: `${name} — VJ Emma | VJEMMA MOVIES` },
        { name: "description", content: `Watch ${name} translated by VJ Emma on VJEMMA MOVIES.` },
        { property: "og:title", content: `${name} — VJEMMA MOVIES` },
        { property: "og:description", content: `Watch ${name} translated by VJ Emma.` },
        { property: "og:type", content: "video.movie" },
      ],
    };
  },
  component: MoviePage,
});

function MoviePage() {
  const { id } = Route.useParams();
  const db = useDB();
  const { user, isAdmin } = useSession();
  const [playing, setPlaying] = useState<"" | "full" | "trailer">("");
  const [episodeId, setEpisodeId] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [cName, setCName] = useState("");
  const [cText, setCText] = useState("");
  const m = db.movies.find((x) => x.id === id);

  if (!m) {
    return (
      <SiteLayout>
        <div className="px-4 py-20 text-center">
          <h1 className="font-display text-4xl">Movie not found</h1>
          <Link to="/" className="mt-4 inline-block text-primary-glow">Back home</Link>
        </div>
      </SiteLayout>
    );
  }

  const allowed = canWatch(m, user);
  const episodes = seriesEpisodes(m);
  const episode = episodes.find((e) => e.id === episodeId) ?? episodes[0];
  const nextEpisode = episodes[episodes.findIndex((e) => e.id === episode?.id) + 1];
  const videoUrl = m.type === "series" ? episode?.videoUrl : m.videoUrl;
  const avg = avgRating(db, m.id);
  const count = db.ratings.filter((r) => r.movieId === m.id).length;
  const rateKey = user?.id ?? "guest";
  const myRating = db.ratings.find((r) => r.movieId === m.id && r.key === rateKey)?.stars ?? 0;
  const comments = db.comments.filter((c) => c.movieId === m.id).sort((a, b) => b.createdAt - a.createdAt);
  const related = db.movies.filter((x) => x.id !== m.id && (x.category === m.category || x.genres.some((g) => m.genres.includes(g))));
  const inList = !!user?.watchlist.includes(m.id);

  const play = () => {
    if (allowed) {
      if (!videoUrl) { toast.error("No video link available yet"); return; }
      return setPlaying("full");
    }
    if (!user) { toast.info("Sign in to watch VIP movies"); return setAuthOpen(true); }
    toast.info("This is a VIP movie — choose a plan to watch");
  };
  const playEpisode = (selected: Episode) => {
    if (!allowed) return play();
    if (!selected.videoUrl) { toast.error("No video link available yet"); return; }
    setEpisodeId(selected.id);
    setPlaying("full");
  };
  const download = () => {
    if (!allowed) return play();
    const url = m.type === "series" ? videoUrl : m.downloadUrl || m.videoUrl;
    if (url) window.open(url, "_blank");
  };
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) await navigator.share({ title: m.title, url }).catch(() => {});
    else { await navigator.clipboard.writeText(url); toast.success("Link copied"); }
  };
  const toggleList = () => {
    if (!user) return setAuthOpen(true);
    const watchlist = inList ? user.watchlist.filter((x) => x !== m.id) : [...user.watchlist, m.id];
    updateLocal((d) => ({ ...d, users: d.users.map((u) => u.id === user.id ? { ...u, watchlist } : u) }));
    void userSaveWatchlist({ data: { token: getUserToken(), watchlist } }).catch(() => toast.error("Could not save watchlist"));
    toast.success(inList ? "Removed from watchlist" : "Added to watchlist");
  };
  const rate = (stars: number) => {
    update((d) => ({ ...d, ratings: [...d.ratings.filter((r) => !(r.movieId === m.id && r.key === rateKey)), { movieId: m.id, key: rateKey, stars }] }));
    toast.success(`You rated ${stars} star${stars > 1 ? "s" : ""}`);
  };
  const addComment = (e: React.FormEvent) => {
    e.preventDefault();
    const name = (cName || user?.name || "").trim();
    if (!name || !cText.trim()) { toast.error("Enter your name and comment"); return; }
    update((d) => ({ ...d, comments: [...d.comments, { id: newId(), movieId: m.id, name, text: cText.trim(), createdAt: Date.now() }] }));
    setCText("");
  };

  return (
    <SiteLayout>
      <div className="relative">
        <div className="relative aspect-video max-h-[70vh] w-full overflow-hidden bg-card">
          {playing ? (
            <video key={`${playing}-${episode?.id ?? m.id}`} src={playing === "full" ? videoUrl : m.trailerUrl} poster={episode?.thumbnail || m.poster} controls autoPlay playsInline className="h-full w-full bg-background" />
          ) : (
            <>
              <img src={m.banner || m.poster} alt={m.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-hero" />
              <button onClick={play} aria-label="Play" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-brand p-5 shadow-glow">
                {allowed ? <Play className="h-8 w-8 fill-current" /> : <Lock className="h-8 w-8" />}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6 px-4 py-5 sm:flex-row">
        <div className="relative hidden w-48 shrink-0 sm:block">
          <img src={m.poster} alt={m.title} className="aspect-[2/3] w-full rounded-lg object-cover" />
          <MovieBadges m={m} />
        </div>
        <div className="flex-1">
          <h1 className="font-display text-4xl uppercase tracking-wide sm:text-5xl">{m.title}</h1>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="font-semibold text-primary-glow">{m.vj}</span>
            <span>{categoryName(db, m.category)}</span><span>{m.genres.join(", ")}</span><span>{m.year}</span><span>{m.duration}</span>
            <span>{m.completed ? "Completed" : "Ongoing"}</span>
            <span className={m.isFree ? "text-success" : "text-accent"}>{m.isFree ? "FREE" : "VIP"}</span>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{m.description}</p>
          {m.type === "series" && <p className="mt-2 text-sm text-primary-glow">{seriesSummary(m)}</p>}
          {m.type === "series" && episode && <div className="mt-3 flex flex-wrap items-center gap-3"><p className="text-sm font-semibold">Season {episode.seasonNumber} · Episode {episode.number}: {episode.title}</p><Button variant="secondary" size="sm" disabled={!nextEpisode} onClick={() => nextEpisode && playEpisode(nextEpisode)}><SkipForward /> Next Episode</Button></div>}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="hero" onClick={play}>{allowed ? <Play className="fill-current" /> : <Lock />} {allowed ? "Play" : "Watch (VIP)"}</Button>
            {m.trailerUrl && <Button variant="secondary" onClick={() => setPlaying("trailer")}>Trailer</Button>}
            <Button variant="secondary" onClick={download}><Download /> Download</Button>
            <Button variant="secondary" onClick={share}><Share2 /> Share</Button>
            <Button variant="secondary" onClick={toggleList}>{inList ? <BookmarkCheck /> : <Bookmark />} {inList ? "In Watchlist" : "Watchlist"}</Button>
          </div>
          {!allowed && (
            <p className="mt-3 text-sm">VIP movie. <Link to="/plans" className="font-semibold text-accent underline">Get a plan from UGX 2,000</Link></p>
          )}

          <div className="mt-5 flex items-center gap-3">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} aria-label={`Rate ${s}`} onClick={() => rate(s)}>
                  <Star className={`h-6 w-6 ${s <= (myRating || Math.round(avg)) ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">{avg ? avg.toFixed(1) : "No ratings"} {count > 0 && `(${count})`}</span>
          </div>
        </div>
      </div>

      {m.type === "series" && <section className="space-y-5 px-4 py-4">
        <h2 className="font-display text-3xl">Episodes</h2>
        {[...(m.seasons ?? [])].sort((a, b) => a.number - b.number).map((season) => <div key={season.id} className="space-y-2">
          <h3 className="font-display text-2xl">Season {season.number}</h3>
          <div className="grid gap-2 sm:grid-cols-2">{[...season.episodes].sort((a, b) => a.number - b.number).map((e) => <Button key={e.id} variant="secondary" aria-label={`Play Season ${season.number} Episode ${e.number}: ${e.title}`} aria-pressed={episode?.id === e.id && playing === "full"} onClick={() => playEpisode(e)} className={`h-auto min-h-20 w-full justify-start gap-3 whitespace-normal p-2 text-left ${episode?.id === e.id && playing === "full" ? "ring-2 ring-primary" : ""}`}>
            <img src={e.thumbnail || m.poster} alt="" className="aspect-video w-20 shrink-0 rounded object-cover" /><span className="min-w-0 flex-1"><span className="block text-xs text-muted-foreground">Episode {e.number}{e.duration && ` · ${e.duration}`}</span><span className="block break-words">{e.title}</span></span><Play className="shrink-0" />
          </Button>)}</div>
        </div>)}
        {!episodes.length && <p className="text-sm text-muted-foreground">No episodes available yet.</p>}
      </section>}

      <section className="px-4 py-4">
        <h2 className="font-display text-2xl tracking-wide">Comments ({comments.length})</h2>
        <form onSubmit={addComment} className="mt-3 max-w-2xl space-y-2">
          {!user && <Input placeholder="Your name" value={cName} onChange={(e) => setCName(e.target.value)} />}
          <Textarea placeholder="Write a comment…" value={cText} onChange={(e) => setCText(e.target.value)} />
          <Button type="submit" size="sm" variant="hero">Post comment</Button>
        </form>
        <ul className="mt-4 max-w-2xl space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="rounded-lg bg-card p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">{c.name}</span>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">{fmtDate(c.createdAt)}
                  {isAdmin && (
                    <button aria-label="Delete comment" onClick={() => update((d) => ({ ...d, comments: d.comments.filter((x) => x.id !== c.id) }))}><Trash2 className="h-4 w-4 text-destructive" /></button>
                  )}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <MovieRow title="Related Movies" movies={related} />
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </SiteLayout>
  );
}
