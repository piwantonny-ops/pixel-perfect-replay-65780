import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { MovieRow } from "@/components/site/MovieCard";
import { Button } from "@/components/ui/button";
import { useDB, ROWS } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VJEMMA MOVIES — VJ Emma Translated Movies" },
      { name: "description", content: "Stream the latest VJ Emma translated movies, series, drama and Nigerian films. Daily, weekly and monthly plans." },
      { property: "og:title", content: "VJEMMA MOVIES — VJ Emma Translated Movies" },
      { property: "og:description", content: "Stream the latest VJ Emma translated movies and series." },
    ],
  }),
  component: Index,
});

function Hero() {
  const db = useDB();
  const slides = db.movies.filter((m) => m.featured);
  const [i, setI] = useState(0);
  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);
  if (!slides.length) return null;
  const m = slides[i % slides.length];
  const go = (d: number) => setI((x) => (x + d + slides.length) % slides.length);
  return (
    <section className="relative h-[62vh] min-h-[380px] w-full overflow-hidden sm:h-[70vh]">
      {slides.map((s, idx) => (
        <img key={s.id} src={s.banner || s.poster} alt={s.title} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${idx === i % slides.length ? "opacity-100" : "opacity-0"}`} />
      ))}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-x-0 bottom-10 px-5 sm:px-10">
        <h1 className="max-w-3xl font-display text-5xl uppercase leading-none tracking-wide sm:text-7xl">
          {m.title} {m.completed && !/completed/i.test(m.title) && <span className="text-accent">Completed</span>}
        </h1>
        <p className="mt-2 line-clamp-2 max-w-xl text-sm text-muted-foreground sm:text-base">{m.description}</p>
        <Button asChild variant="hero" size="lg" className="mt-4 rounded-full">
          <Link to="/movie/$id" params={{ id: m.id }}><Play className="fill-current" /> Play</Link>
        </Button>
      </div>
      <button aria-label="Previous" onClick={() => go(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/50 p-2"><ChevronLeft /></button>
      <button aria-label="Next" onClick={() => go(1)} className="absolute right-14 top-1/2 -translate-y-1/2 rounded-full bg-background/50 p-2"><ChevronRight /></button>
      <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
        {slides.map((s, idx) => (
          <button key={s.id} aria-label={`Slide ${idx + 1}`} onClick={() => setI(idx)} className={`h-1.5 rounded-full transition-all ${idx === i % slides.length ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground"}`} />
        ))}
      </div>
    </section>
  );
}

function Index() {
  const db = useDB();
  const sorted = [...db.movies].sort((a, b) => b.createdAt - a.createdAt);
  return (
    <SiteLayout>
      <Hero />
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
        {db.genres.map((g) => (
          <Link key={g.id} to="/search" search={{ q: g.name }} className="shrink-0 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium hover:bg-primary">{g.name}</Link>
        ))}
      </div>
      {ROWS.map((r) => (
        <MovieRow key={r.key} title={r.label} seeAll={r.key} movies={(r.key === "latest" ? sorted : db.movies).filter((m) => m.rows.includes(r.key))} />
      ))}
    </SiteLayout>
  );
}
