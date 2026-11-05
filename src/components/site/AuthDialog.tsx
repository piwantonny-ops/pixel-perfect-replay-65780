import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDB, update, setSessionUser, normalizePhone, newId } from "@/lib/store";

export function AuthDialog({ open, onOpenChange, onDone }: { open: boolean; onOpenChange: (o: boolean) => void; onDone?: () => void }) {
  const db = useDB();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pw, setPw] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = normalizePhone(phone);
    if (p.length < 10) { toast.error("Enter a valid phone number"); return; }
    if (pw.length < 4) { toast.error("Password must be at least 4 characters"); return; }
    const existing = db.users.find((u) => u.phone === p);
    if (mode === "up") {
      if (!name.trim()) { toast.error("Enter your name"); return; }
      if (existing) { toast.error("This phone number already has an account. Sign in instead."); return; }
      const id = newId();
      update((d) => ({ ...d, users: [...d.users, { id, name: name.trim(), phone: p, password: pw, blocked: false, watchlist: [], createdAt: Date.now() }] }));
      setSessionUser(id);
      toast.success(`Welcome, ${name.trim()}!`);
    } else {
      if (!existing || existing.password !== pw) { toast.error("Wrong phone number or password"); return; }
      if (existing.blocked) { toast.error("This account is blocked. Contact us on WhatsApp."); return; }
      setSessionUser(existing.id);
      toast.success(`Welcome back, ${existing.name}!`);
    }
    onOpenChange(false);
    onDone?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle className="font-display text-3xl tracking-wide">{mode === "in" ? "Sign in" : "Create account"}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          {mode === "up" && <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />}
          <Input placeholder="Phone number e.g. 0772 123456" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input type="password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} />
          <Button type="submit" variant="hero" className="w-full">{mode === "in" ? "Sign in" : "Create account"}</Button>
          <button type="button" className="w-full text-center text-sm text-muted-foreground" onClick={() => setMode(mode === "in" ? "up" : "in")}>
            {mode === "in" ? "No account? Create one" : "Have an account? Sign in"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
