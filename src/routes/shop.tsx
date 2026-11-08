import { createFileRoute } from "@tanstack/react-router";
import { ShoppingBag, MessageCircle } from "lucide-react";
import { SiteLayout, waLink } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { useDB, ugx } from "@/lib/store";

export const Route = createFileRoute("/shop")({
  head: () => ({ meta: [
    { title: "Shop — VJEMMA MOVIES" },
    { name: "description", content: "Shop VJ Emma products from Obangaber Cinema Club." },
    { property: "og:title", content: "Shop — VJEMMA MOVIES" },
    { property: "og:description", content: "VJ Emma’s Obangaber Cinema Club shop." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Shop,
});
function Shop() {
  const db = useDB();
  return <SiteLayout><section className="px-4 py-8">
    <p className="text-sm text-primary">OBANGABER CINEMA CLUB</p>
    <h1 className="font-display text-5xl">VJ EMMA SHOP</h1>
    {db.products.length ? <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {db.products.map((p) => <article key={p.id} className="overflow-hidden rounded-lg border border-border bg-card">
        {p.image ? <img src={p.image} alt={p.name} className="aspect-square w-full object-cover" /> : <div className="flex aspect-square items-center justify-center bg-muted"><ShoppingBag className="h-12 w-12 text-muted-foreground" /></div>}
        <div className="space-y-3 p-4"><h2 className="font-display text-3xl">{p.name}</h2><p className="text-sm text-muted-foreground">{p.description}</p><p className="text-xl font-semibold">{ugx(p.price)}</p>
          <Button asChild variant="success" className="w-full"><a href={waLink(db.settings.whatsapp, `Hello VJ Emma, I’d like to order ${p.name} (${ugx(p.price)}).`)} target="_blank" rel="noopener noreferrer"><MessageCircle />Order via WhatsApp</a></Button>
        </div>
      </article>)}
    </div> : <div className="py-16 text-center"><ShoppingBag className="mx-auto mb-4 h-10 w-10 text-primary" /><h2 className="font-display text-3xl">New products coming soon</h2></div>}
  </section></SiteLayout>;
}