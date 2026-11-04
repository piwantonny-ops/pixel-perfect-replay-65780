import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { MovieCard } from "@/components/site/MovieCard";
import { Input } from "@/components/ui/input";
import { useDB, categoryName } from "@/lib/store";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s.q === "string" ? s.q : "" }),
  head: () => ({
    meta: [
      { title: "Search Movies — VJEMMA MOVIES" },
      { name: "description", content: "Search VJ Emma movies by title, VJ name or genre." },
      { property: "og:title", content: "Search Movies — VJEMMA MOVIES" },
      { property: "og:description", content: "Search VJ Emma movies by title, VJ name or genre." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const nav = useNavigate({ from: "/search" });
  const db = useDB();
  const t = q.trim().toLowerCase();
  const res = t
    ? db.movies.filter((m) => [m.title, m.vj, ...m.genres, categoryName(db, m.category)].some((x) => x.toLowerCase().includes(t)))
    : db.movies;
  return (
    <SiteLayout>
      <div className="px-4 py-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input autoFocus value={q} onChange={(e) => nav({ search: { q: e.target.value }, replace: true })} placeholder="Search title, VJ name, genre…" className="h-12 pl-10" />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{res.length} result{res.length === 1 ? "" : "s"}</p>
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7">
          {res.map((m) => <MovieCard key={m.id} m={m} wide />)}
        </div>
      </div>
    </SiteLayout>
  );
}
