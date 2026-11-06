import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { MovieCard } from "@/components/site/MovieCard";
import { useDB, categoryName } from "@/lib/store";

const ROW_ALIASES: Record<string, string> = { recommended: "recommended", "top-50": "top50", "for-the-week": "week", "upcoming-selections": "upcoming" };

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => {
    const name = params.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return {
      meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
        { title: `${name} — VJEMMA MOVIES` },
        { name: "description", content: `Watch ${name} translated by VJ Emma.` },
        { property: "og:title", content: `${name} — VJEMMA MOVIES` },
        { property: "og:description", content: `Watch ${name} translated by VJ Emma.` },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const db = useDB();
  const row = ROW_ALIASES[slug];
  const list = db.movies.filter((m) => m.category === slug || (row && m.rows.includes(row)) || (slug === "movies" && m.category === "movies"));
  return (
    <SiteLayout>
      <div className="px-4 py-6">
        <h1 className="font-display text-5xl tracking-wide">{categoryName(db, slug)}</h1>
        {slug === "live-tv" && list.length === 0 && <p className="mt-2 text-muted-foreground">Live TV channels will appear here when the admin adds them.</p>}
        {list.length === 0 && slug !== "live-tv" && <p className="mt-2 text-muted-foreground">No titles in this category yet.</p>}
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7">
          {list.map((m) => <MovieCard key={m.id} m={m} wide />)}
        </div>
      </div>
    </SiteLayout>
  );
}
