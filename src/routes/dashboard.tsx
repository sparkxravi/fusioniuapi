import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QrCode, ShieldCheck, BookOpen, MessageCircle, Mail, Sparkles, Activity, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, Legend } from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · fusioniuApi" }] }),
  component: Dashboard,
});

type LogRow = { endpoint: string; status: string; created_at: string };

function Dashboard() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [logs, setLogs] = useState<LogRow[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }: any) => {
      if (!data.session) {
        router.navigate({ to: "/login" });
        return;
      }
      setEmail(data.session.user.email ?? null);
      const { data: rows } = await supabase
        .from("api_logs")
        .select("endpoint,status,created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      setLogs((rows as LogRow[] | null) ?? []);
      setReady(true);
    });
  }, [router]);

  const stats = useMemo(() => {
    const total = logs.length;
    const success = logs.filter((l) => l.status === "success").length;
    const failed = total - success;
    const rate = total ? Math.round((success / total) * 100) : 0;
    return { total, success, failed, rate };
  }, [logs]);

  const timeline = useMemo(() => {
    // last 7 days
    const days: { day: string; success: number; failed: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("en", { weekday: "short" });
      const day = { day: label, key, success: 0, failed: 0 } as any;
      days.push(day);
    }
    logs.forEach((l) => {
      const key = l.created_at.slice(0, 10);
      const slot: any = days.find((d: any) => d.key === key);
      if (!slot) return;
      if (l.status === "success") slot.success++;
      else slot.failed++;
    });
    return days;
  }, [logs]);

  const pieData = useMemo(() => {
    const map = new Map<string, number>();
    logs.forEach((l) => map.set(l.endpoint, (map.get(l.endpoint) ?? 0) + 1));
    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [logs]);

  if (!ready) {
    return (
      <SiteLayout>
        <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">Loading...</div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="px-5 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs mb-3">
                <Sparkles className="w-3.5 h-3.5 text-primary" /> Account active
              </div>
              <h1 className="text-4xl font-bold">Welcome, <span className="text-primary glow-text">{email?.split("@")[0]}</span></h1>
              <p className="text-muted-foreground mt-1 text-sm">{email}</p>
            </div>
            <Link to="/docs" className="btn-3d px-5 py-2.5 rounded-lg text-sm font-semibold inline-flex items-center gap-2 self-start">
              <BookOpen className="w-4 h-4" /> Open Docs
            </Link>
          </div>

          {/* STAT TILES */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatTile icon={Activity} label="Total Calls" value={stats.total} accent="text-primary" />
            <StatTile icon={CheckCircle2} label="Successful" value={stats.success} accent="text-success" />
            <StatTile icon={XCircle} label="Failed" value={stats.failed} accent="text-destructive" />
            <StatTile icon={TrendingUp} label="Success Rate" value={`${stats.rate}%`} accent="text-primary" />
          </div>

          {/* CHARTS */}
          <div className="grid lg:grid-cols-3 gap-5 mb-6">
            <div className="lg:col-span-2 card-3d rounded-2xl p-6">
              <h3 className="font-semibold mb-1">API Activity — Last 7 Days</h3>
              <p className="text-xs text-muted-foreground mb-4">Successful vs failed requests</p>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={timeline} margin={{ left: -20, right: 10, top: 10 }}>
                  <defs>
                    <linearGradient id="gSuccess" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4a9eff" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#4a9eff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gFail" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="day" stroke="#7e8aae" fontSize={11} />
                  <YAxis stroke="#7e8aae" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "#0b1226", border: "1px solid #2952ff55", borderRadius: 12, fontSize: 12 }} />
                  <Area type="monotone" dataKey="success" stroke="#4a9eff" strokeWidth={2} fill="url(#gSuccess)" />
                  <Area type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} fill="url(#gFail)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="card-3d rounded-2xl p-6">
              <h3 className="font-semibold mb-1">Endpoint Usage</h3>
              <p className="text-xs text-muted-foreground mb-4">Distribution by endpoint</p>
              {pieData.length === 0 ? (
                <div className="h-[260px] flex items-center justify-center text-xs text-muted-foreground">No data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={4}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={["#4a9eff", "#9b6bff", "#22d3a8", "#f59e0b"][i % 4]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#0b1226", border: "1px solid #2952ff55", borderRadius: 12, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* ENDPOINTS */}
          <div className="grid md:grid-cols-2 gap-5">
            <div className="card-3d rounded-2xl p-6">
              <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center mb-4">
                <QrCode className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Generate UPI QR</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">Create dynamic UPI QR codes instantly with your UPI ID, amount and merchant name. No API key required.</p>
              <pre className="mt-4 p-3 rounded-lg bg-background/60 border border-border text-[11px] font-mono overflow-x-auto"><code>GET /api/public/genqr?upi=YOURUPI&amp;amount=10&amp;name=Store</code></pre>
            </div>

            <div className="card-3d rounded-2xl p-6">
              <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Verify Payment</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">Scan your Gmail inbox for FamPay confirmation. Requires a Gmail App Password.</p>
              <pre className="mt-4 p-3 rounded-lg bg-background/60 border border-border text-[11px] font-mono overflow-x-auto"><code>GET /api/public/check?mail=...&amp;apppass=...&amp;utr=...&amp;amount=...</code></pre>
              <Link to="/app-password" className="mt-3 inline-block text-xs text-primary hover:underline">How to get an App Password →</Link>
            </div>
          </div>

          <div className="mt-8 card-3d rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Need help?</h3>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <a href="https://t.me/btwspark" target="_blank" rel="noopener" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/10 transition">
                <MessageCircle className="w-4 h-4 text-primary" />
                <span>Telegram: <strong>@btwspark</strong></span>
              </a>
              <a href="mailto:fusioniu2026@gmail.com" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/10 transition">
                <Mail className="w-4 h-4 text-primary" />
                <span>fusioniu2026@gmail.com</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function StatTile({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string | number; accent: string }) {
  return (
    <div className="card-3d rounded-xl p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className={`w-4 h-4 ${accent}`} />
      </div>
      <div className={`text-2xl font-bold ${accent}`}>{value}</div>
    </div>
  );
}
