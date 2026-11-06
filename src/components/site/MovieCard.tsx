import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { seriesSummary, type Movie } from "@/lib/store";

export function MovieBadges({ m }: { m: Movie }) {
  return (
    <div className="absolute left-1.5 top-1.5 flex flex-wrap gap-1">
      {m.badge !== "None" && (
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${m.badge === "VIP" ? "bg-accent text-accent-foreground" : m.badge === "TOP" ? "bg-destructive text-destructive-foreground" : "bg-gradient-brand text-primary-foreground"}`}>
          {m.badge}
        </span>
      )}
      {m.isFree && <span className="rounded bg-success px-1.5 py-0.5 text-[10px] font-bold text-success-foreground">FREE</span>}
    </div>
  );
}

export function MovieCard({ m, wide }: { m: Movie; wide?: boolean }) {
  return (
    <Link to="/movie/$id" params={{ id: m.id }} className={`group block shrink-0 ${wide ? "w-full" : "w-32 sm:w-40"}`}>
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted">
        <img src={m.poster} alt={m.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <MovieBadges m={m} />
        {!m.completed && <span className="absolute bottom-1.5 right-1.5 rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-semibold">ONGOING</span>}
      </div>
      <p className="mt-1.5 line-clamp-2 text-xs font-medium sm:text-sm">{m.title}</p>
      {m.type === "series" && <span className="mt-1 block rounded bg-secondary px-1.5 py-1 text-[10px] leading-relaxed text-secondary-foreground">{seriesSummary(m)}</span>}
    </Link>
  );
}

export function MovieRow({ title, movies, seeAll }: { title: string; movies: Movie[]; seeAll?: string }) {
  if (!movies.length) return null;
  return (
    <section className="py-3">
      <div className="mb-2 flex items-center justify-between px-4">
        <h2 className="font-display text-2xl tracking-wide">{title}</h2>
        {seeAll && (
          <Link to="/browse/$row" params={{ row: seeAll }} className="flex items-center text-sm text-primary-glow">See all <ChevronRight className="h-4 w-4" /></Link>
        )}
      </div>
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1">
        {movies.map((m) => <MovieCard key={m.id} m={m} />)}
      </div>
    </section>
  );
}
