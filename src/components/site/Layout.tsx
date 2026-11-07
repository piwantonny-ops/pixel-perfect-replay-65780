import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { Bell, Facebook, Menu, MessageCircle, Music2, Search, Shield, User, Youtube } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useDB, useSession, signOutUser, isActive, fmtDate, normalizePhone } from "@/lib/store";
import { AuthDialog } from "./AuthDialog";
import { toast } from "sonner";

export function waLink(num: string, text?: string) {
  return `https://wa.me/${normalizePhone(num)}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function CategoryBar() {
  const db = useDB();
  return (
    <nav className="no-scrollbar flex gap-2 overflow-x-auto border-b border-border px-4 py-2">
      <Link to="/" className="shrink-0 rounded-full px-3 py-1 text-sm text-muted-foreground" activeOptions={{ exact: true }} activeProps={{ className: "bg-gradient-brand !text-primary-foreground" }}>Home</Link>
      {db.categories.map((c) => (
        <Link key={c.id} to="/category/$slug" params={{ slug: c.slug }} className="shrink-0 rounded-full px-3 py-1 text-sm text-muted-foreground hover:text-foreground" activeProps={{ className: "bg-gradient-brand !text-primary-foreground" }}>{c.name}</Link>
      ))}
      <Link to="/about" className="shrink-0 rounded-full px-3 py-1 text-sm text-muted-foreground hover:text-foreground">Learn More</Link>
    </nav>
  );
}

function Header() {
  const db = useDB();
  const { user } = useSession();
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = useNavigate();
  const close = () => setMenuOpen(false);
  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4">
        <Link to="/" className="mr-auto font-display text-3xl tracking-wider">
          <span className="bg-gradient-brand bg-clip-text text-transparent">{db.settings.logoText}</span>
        </Link>
        <Link to="/search" search={{ q: "" }} aria-label="Search" className="rounded-full p-2 hover:bg-muted"><Search className="h-5 w-5" /></Link>
        <Link to="/admin" className="flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-semibold hover:bg-muted"><Shield className="h-3.5 w-3.5" />Admin</Link>
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger aria-label="Menu" className="rounded-full p-2 hover:bg-muted"><Menu className="h-5 w-5" /></SheetTrigger>
          <SheetContent className="w-72 overflow-y-auto">
            <SheetHeader><SheetTitle className="font-display text-2xl tracking-wide">{db.settings.siteName}</SheetTitle></SheetHeader>
            <div className="mt-2 rounded-lg bg-muted p-3 text-sm">
              {user ? (
                <>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-muted-foreground">{user.phone}</p>
                  <p className="mt-1">{isActive(user) ? <span className="text-success">Active until {fmtDate(user.expiresAt!)}</span> : <span className="text-muted-foreground">No active plan</span>}</p>
                </>
              ) : (
                <button className="flex items-center gap-2 font-semibold" onClick={() => { close(); setAuthOpen(true); }}><User className="h-4 w-4" />Sign in / Create account</button>
              )}
            </div>
            <div className="mt-4 flex flex-col gap-1 text-sm">
              {([["/", "Home"], ["/vip", "VIP — Pay with MTN MoMo"], ["/shop", "Shop"], ["/account", "My Account & Watchlist"], ["/about", "About Us"], ["/contact", "Contact"], ["/terms", "Terms"], ["/privacy", "Privacy"]] as const).map(([to, l]) => (
                <Link key={to} to={to} onClick={close} className="rounded px-2 py-2 hover:bg-muted">{l}</Link>
              ))}
              <Link to="/search" search={{ q: "" }} onClick={close} className="rounded px-2 py-2 hover:bg-muted">Search</Link>
              {user && <button className="rounded px-2 py-2 text-left text-destructive hover:bg-muted" onClick={() => { signOutUser(); close(); toast.success("Signed out"); nav({ to: "/" }); }}>Sign out</button>}
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <CategoryBar />
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </header>
  );
}

function FloatingBar() {
  const { settings } = useDB();
  const items = [
    { href: waLink(settings.whatsapp), icon: MessageCircle, label: "WhatsApp" },
    { href: settings.tiktok, icon: Music2, label: "TikTok" },
    { href: settings.youtube, icon: Youtube, label: "YouTube" },
  ];
  return (
    <div className="fixed right-2 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-2 rounded-full bg-card/80 p-1.5 shadow-glow backdrop-blur">
      {items.filter((item) => item.href).map(({ href, icon: I, label }) => (
        <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="rounded-full p-2 hover:bg-primary"><I className="h-4 w-4" /></a>
      ))}
      <button aria-label="Notifications" onClick={() => toast("New VJ Emma translations drop every week — stay tuned!")} className="rounded-full p-2 hover:bg-primary"><Bell className="h-4 w-4" /></button>
    </div>
  );
}

function Footer() {
  const { settings } = useDB();
  const socials = [
    { href: waLink(settings.whatsapp), icon: MessageCircle, label: "WhatsApp 1" },
    { href: settings.whatsapp2 ? waLink(settings.whatsapp2) : "", icon: MessageCircle, label: "WhatsApp 2" },
    { href: settings.tiktok, icon: Music2, label: "TikTok" },
    { href: settings.youtube, icon: Youtube, label: "YouTube" },
    { href: settings.facebook, icon: Facebook, label: "Facebook" },
  ];
  return (
    <footer className="mt-10 border-t border-border bg-card px-4 py-8 pb-24 text-sm">
      <div className="mx-auto max-w-7xl">
        <p className="font-display text-3xl tracking-wider"><span className="bg-gradient-brand bg-clip-text text-transparent">{settings.siteName}</span></p>
        <p className="text-muted-foreground">{settings.tagline}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {socials.filter((item) => item.href).map(({ href, icon: I, label }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 font-medium hover:bg-primary"><I className="h-4 w-4" />{label}</a>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-4 text-muted-foreground">
          <Link to="/about">About Us</Link><Link to="/contact">Contact</Link><Link to="/terms">Terms</Link><Link to="/privacy">Privacy</Link><Link to="/plans">Plans</Link>
          {settings.appLink && <a href={settings.appLink}>Download App v{settings.appVersion}</a>}
        </div>
        <p className="mt-6 text-xs text-muted-foreground">© {new Date().getFullYear()} {settings.siteName}. All rights reserved.</p>
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl">{children}</main>
      <Footer />
      {location.pathname === "/" && <FloatingBar />}
    </div>
  );
}

export function TextPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <SiteLayout>
      <div className="max-w-3xl space-y-4 px-4 py-8 leading-relaxed text-muted-foreground">
        <h1 className="font-display text-5xl tracking-wide text-foreground">{title}</h1>
        {children}
      </div>
    </SiteLayout>
  );
}
