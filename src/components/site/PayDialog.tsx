import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle, Smartphone } from "lucide-react";
import { useDB, useSession, update, newId, ugx, type Plan } from "@/lib/store";
import { waLink } from "./Layout";

export function PayDialog({ plan, onOpenChange }: { plan: Plan | null; onOpenChange: (o: boolean) => void }) {
  const { settings } = useDB();
  const { user } = useSession();
  const [sent, setSent] = useState(false);
  const pesapalReady = !!(settings.pesapalKey && settings.pesapalSecret);
  if (!plan || !user) return null;

  const createPending = (method: "pesapal" | "manual") => {
    update((d) => ({
      ...d,
      payments: [{ id: newId(), userId: user.id, userName: user.name, phone: user.phone, planId: plan.id, planName: plan.name, amount: plan.price, days: plan.days, method, status: "Pending", createdAt: Date.now() }, ...d.payments],
    }));
  };

  const manual = () => {
    createPending("manual");
    setSent(true);
    window.open(waLink(settings.whatsapp, `Hello VJ Emma, I want the ${plan.name} plan (${ugx(plan.price)}). Name: ${user.name}, Phone: ${user.phone}`), "_blank");
  };

  const pesapal = () => {
    createPending("pesapal");
    toast.info("Pesapal checkout is being connected. Your request is saved — the admin will confirm it.");
    setSent(true);
  };

  return (
    <Dialog open={!!plan} onOpenChange={(o) => { if (!o) setSent(false); onOpenChange(o); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl tracking-wide">{plan.name} — {ugx(plan.price)}</DialogTitle>
          <DialogDescription>Watch all VIP movies for {plan.days} day{plan.days > 1 ? "s" : ""}.</DialogDescription>
        </DialogHeader>
        {sent ? (
          <div className="space-y-2 rounded-lg bg-muted p-4 text-sm">
            <p className="font-semibold text-success">Payment request received!</p>
            <p>Send <b>{ugx(plan.price)}</b> and your plan activates as soon as the admin confirms. Check “My Account” for your expiry date.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <Button variant="hero" className="h-12 w-full" onClick={pesapal} disabled={!pesapalReady}>
              <Smartphone /> Pay with MTN MoMo / Airtel Money via Pesapal
            </Button>
            {!pesapalReady && <p className="text-center text-xs text-muted-foreground">Online payment coming soon. Pay manually below:</p>}
            <Button variant="success" className="h-12 w-full" onClick={manual}>
              <MessageCircle /> Pay via WhatsApp — Send money manually
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
