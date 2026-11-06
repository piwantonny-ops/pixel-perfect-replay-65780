import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { AuthDialog } from "@/components/site/AuthDialog";
import { PayDialog } from "@/components/site/PayDialog";
import { Button } from "@/components/ui/button";
import { useDB, useSession, isActive, ugx, fmtDate, type Plan } from "@/lib/store";

export const Route = createFileRoute("/plans")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Subscription Plans — VJEMMA MOVIES" },
      { name: "description", content: "Watch all VIP VJ Emma movies from UGX 2,000 a day. Pay with MTN MoMo or Airtel Money." },
      { property: "og:title", content: "Subscription Plans — VJEMMA MOVIES" },
      { property: "og:description", content: "Watch all VIP VJ Emma movies from UGX 2,000 a day." },
    ],
  }),
  component: PlansPage,
});

function PlansPage() {
  const db = useDB();
  const { user } = useSession();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [pending, setPending] = useState<Plan | null>(null);
  const choose = (p: Plan) => (user ? setPlan(p) : setPending(p));
  return (
    <SiteLayout>
      <div className="px-4 py-8">
        <h1 className="font-display text-5xl tracking-wide">Choose your plan</h1>
        <p className="text-muted-foreground">Unlock every VIP movie. Pay with MTN MoMo or Airtel Money.</p>
        {isActive(user) && <p className="mt-3 rounded-lg bg-success/15 p-3 text-sm text-success">Your {user!.planName} plan is active until {fmtDate(user!.expiresAt!)}. Buying again adds more days.</p>}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...db.plans].sort((a, b) => a.days - b.days).map((p, i, arr) => (
            <div key={p.id} className={`rounded-2xl border p-5 ${i === arr.length - 1 ? "border-primary bg-card shadow-glow" : "border-border bg-card"}`}>
              <p className="font-display text-3xl tracking-wide">{p.name}</p>
              <p className="mt-1 text-3xl font-bold">{ugx(p.price)}</p>
              <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
                <li className="flex gap-2"><Check className="h-4 w-4 text-success" />All VIP movies for {p.days} day{p.days > 1 ? "s" : ""}</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-success" />Watch & download</li>
              </ul>
              <Button variant="hero" className="mt-5 w-full" onClick={() => choose(p)}>Get {p.name}</Button>
            </div>
          ))}
        </div>
      </div>
      <AuthDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)} onDone={() => { setPlan(pending); setPending(null); }} />
      <PayDialog plan={plan} onOpenChange={(o) => !o && setPlan(null)} />
    </SiteLayout>
  );
}
