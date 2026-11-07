import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle, Smartphone } from "lucide-react";
import { useDB, useSession, updateLocal, getUserToken, ugx, type Plan } from "@/lib/store";
import { userRequestPayment } from "@/lib/vj.functions";
import { waLink } from "./Layout";

export function PayDialog({ plan, onOpenChange }: { plan: Plan | null; onOpenChange: (o: boolean) => void }) {
  const { settings } = useDB();
  const { user } = useSession();
  const [sent, setSent] = useState(false);
  const pesapalReady = !!(settings.pesapalReady || (settings.pesapalKey && settings.pesapalSecret));
  const momo = settings.momoNumber || settings.whatsapp;
  if (!plan || !user) return null;

  const createPending = (method: "pesapal" | "manual") => {
    userRequestPayment({ data: { token: getUserToken(), planId: plan.id, method } })
      .then((p) => updateLocal((d) => ({ ...d, payments: [p, ...d.payments] })))
      .catch(() => toast.error("Could not save your payment request. Please sign in again."));
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
            <p>Send <b>{ugx(plan.price)}</b> by MTN MoMo to <b>{momo}</b>, then your plan activates as soon as the admin confirms. Check “My Account” for your expiry date.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-muted p-3 text-sm">
              <p className="font-semibold">MTN MoMo: send {ugx(plan.price)} to <span className="text-primary">{momo}</span></p>
              <p className="text-muted-foreground">Dial *165# → Send Money. Then tap WhatsApp below so VJ Emma can activate your VIP.</p>
            </div>
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
