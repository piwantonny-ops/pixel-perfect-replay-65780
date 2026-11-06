import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { MovieCard } from "@/components/site/MovieCard";
import { AuthDialog } from "@/components/site/AuthDialog";
import { Button } from "@/components/ui/button";
import { useDB, useSession, isActive, fmtDate, ugx } from "@/lib/store";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "My Account — VJEMMA MOVIES" },
      { name: "description", content: "Your VJEMMA MOVIES subscription, payments and watchlist." },
      { property: "og:title", content: "My Account — VJEMMA MOVIES" },
      { property: "og:description", content: "Your subscription, payments and watchlist." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const db = useDB();
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  if (!user) {
    return (
      <SiteLayout>
        <div className="px-4 py-20 text-center">
          <h1 className="font-display text-4xl">Sign in to see your account</h1>
          <Button variant="hero" className="mt-4" onClick={() => setOpen(true)}>Sign in / Create account</Button>
          <AuthDialog open={open} onOpenChange={setOpen} />
        </div>
      </SiteLayout>
    );
  }
  const pays = db.payments.filter((p) => p.userId === user.id);
  const list = db.movies.filter((m) => user.watchlist.includes(m.id));
  return (
    <SiteLayout>
      <div className="space-y-6 px-4 py-8">
        <div className="rounded-2xl bg-card p-5">
          <h1 className="font-display text-4xl tracking-wide">{user.name}</h1>
          <p className="text-muted-foreground">{user.phone}</p>
          {isActive(user) ? (
            <p className="mt-2 text-success">{user.planName} plan active — expires {fmtDate(user.expiresAt!)}</p>
          ) : (
            <p className="mt-2 text-muted-foreground">No active plan. <Link to="/plans" className="text-accent underline">Choose a plan</Link></p>
          )}
        </div>
        <div>
          <h2 className="font-display text-2xl tracking-wide">My Watchlist</h2>
          {list.length ? <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">{list.map((m) => <MovieCard key={m.id} m={m} wide />)}</div> : <p className="text-sm text-muted-foreground">Nothing saved yet.</p>}
        </div>
        <div>
          <h2 className="font-display text-2xl tracking-wide">My Payments</h2>
          {pays.length ? (
            <ul className="mt-2 space-y-2 text-sm">
              {pays.map((p) => (
                <li key={p.id} className="flex justify-between rounded-lg bg-card p-3">
                  <span>{p.planName} · {ugx(p.amount)} · {fmtDate(p.createdAt)}</span>
                  <span className={p.status === "Paid" ? "text-success" : "text-accent"}>{p.status}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted-foreground">No payments yet.</p>}
        </div>
      </div>
    </SiteLayout>
  );
}
