import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { MovieCard } from "@/components/site/MovieCard";
import { useDB, ROWS } from "@/lib/store";

export const Route = createFileRoute("/browse/$row")({
  head: ({ params }) => {
    const label = ROWS.find((r) => r.key === params.row)?.label ?? "Movies";
    return {
      meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
        { title: `${label} — VJEMMA MOVIES` },
        { name: "description", content: `${label} VJ Emma translated movies.` },
        { property: "og:title", content: `${label} — VJEMMA MOVIES` },
        { property: "og:description", content: `${label} VJ Emma translated movies.` },
      ],
    };
  },
  component: BrowsePage,
});

function BrowsePage() {
  const { row } = Route.useParams();
  const db = useDB();
  const label = ROWS.find((r) => r.key === row)?.label ?? "Movies";
  const list = db.movies.filter((m) => m.rows.includes(row)).sort((a, b) => b.createdAt - a.createdAt);
  return (
    <SiteLayout>
      <div className="px-4 py-6">
        <h1 className="font-display text-5xl tracking-wide">{label}</h1>
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7">
          {list.map((m) => <MovieCard key={m.id} m={m} wide />)}
        </div>
      </div>
    </SiteLayout>
  );
}
