import { Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/fusion-logo.jpeg";
import { Menu, X } from "lucide-react";

export function SiteLayout({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: any) => setEmail(data.session?.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e: any, s: any) => setEmail(s?.user?.email ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    router.navigate({ to: "/" });
  }

  const isAdmin = email?.toLowerCase() === "sparkox19711@gmail.com";
  const nav = [
    { to: "/", label: "Home" },
    { to: "/docs", label: "API Docs" },
    { to: "/keys", label: "API Keys" },
    { to: "/app-password", label: "App Password" },
    { to: "/about", label: "About Dev" },
    ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
  ] as const;

  return (
    <div className="min-h-screen relative">
      {/* ambient orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="orb float" style={{ width: 420, height: 420, top: -120, left: -80, background: "oklch(0.55 0.28 270 / 0.45)" }} />
        <div className="orb float" style={{ width: 380, height: 380, top: 240, right: -100, background: "oklch(0.65 0.24 255 / 0.4)", animationDelay: "2s" }} />
        <div className="grid-bg absolute inset-0" />
      </div>

      <header className="sticky top-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-1 ring-primary/40 pulse-glow">
              <img src={logo} alt="fusioniuApi" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              fusioniu<span className="text-primary glow-text">Api</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-primary/10 transition" activeProps={{ className: "px-4 py-2 rounded-lg text-sm text-primary bg-primary/10" }}>
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {email ? (
              <>
                <Link to="/dashboard" className="px-4 py-2 text-sm rounded-lg text-foreground hover:bg-primary/10">Dashboard</Link>
                <button onClick={logout} className="px-4 py-2 text-sm rounded-lg text-muted-foreground hover:text-foreground">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm rounded-lg text-foreground hover:bg-primary/10">Login</Link>
                <Link to="/register" className="px-4 py-2 text-sm rounded-lg btn-3d font-medium">Get Started</Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <div className="md:hidden border-t border-border px-5 py-4 flex flex-col gap-2 bg-card/80 backdrop-blur">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg hover:bg-primary/10">{n.label}</Link>
            ))}
            {email ? (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg hover:bg-primary/10">Dashboard</Link>
                <button onClick={logout} className="text-left px-3 py-2 rounded-lg hover:bg-primary/10">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg hover:bg-primary/10">Login</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg btn-3d text-center">Get Started</Link>
              </>
            )}
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="mt-24 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-5 py-10 grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src={logo} alt="" className="w-8 h-8 rounded-lg" />
              <span className="font-bold">fusioniuApi</span>
            </div>
            <p className="text-sm text-muted-foreground">Next-generation FamPay payment verification infrastructure. Lightning-fast and secure.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/docs" className="hover:text-primary">API Documentation</Link></li>
              <li><Link to="/app-password" className="hover:text-primary">How to get App Password</Link></li>
              <li><Link to="/register" className="hover:text-primary">Create account</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Developer</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Spark · <a href="https://t.me/btwspark" target="_blank" className="text-primary hover:underline">@btwspark</a></li>
              <li><a href="mailto:fusioniu2026@gmail.com" className="hover:text-primary">fusioniu2026@gmail.com</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/50 py-5 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} fusioniuApi · Built by Spark
        </div>
      </footer>
    </div>
  );
}
