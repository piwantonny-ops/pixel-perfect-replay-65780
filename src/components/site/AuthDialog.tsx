import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInUser } from "@/lib/store";
import { userSignup, userLogin } from "@/lib/vj.functions";

export function AuthDialog({ open, onOpenChange, onDone }: { open: boolean; onOpenChange: (o: boolean) => void; onDone?: () => void }) {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pw, setPw] = useState("");

  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.replace(/\D/g, "").length < 9) { toast.error("Enter a valid phone number"); return; }
    if (pw.length < 4) { toast.error("Password must be at least 4 characters"); return; }
    if (mode === "up" && !name.trim()) { toast.error("Enter your name"); return; }
    setBusy(true);
    try {
      const res = mode === "up" ? await userSignup({ data: { name, phone, password: pw } }) : await userLogin({ data: { phone, password: pw } });
      if ("error" in res && res.error) { toast.error(res.error); return; }
      if ("user" in res && res.user) {
        signInUser(res.user, res.token);
        toast.success(mode === "up" ? `Welcome, ${res.user.name}!` : `Welcome back, ${res.user.name}!`);
        onOpenChange(false);
        onDone?.();
      }
    } catch { toast.error("Connection problem. Please try again."); }
    finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle className="font-display text-3xl tracking-wide">{mode === "in" ? "Sign in" : "Create account"}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          {mode === "up" && <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />}
          <Input placeholder="Phone number e.g. 0772 123456" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input type="password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} />
          <Button type="submit" variant="hero" className="w-full" disabled={busy}>{mode === "in" ? "Sign in" : "Create account"}</Button>
          <button type="button" className="w-full text-center text-sm text-muted-foreground" onClick={() => setMode(mode === "in" ? "up" : "in")}>
            {mode === "in" ? "No account? Create one" : "Have an account? Sign in"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
