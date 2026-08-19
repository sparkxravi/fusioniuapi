import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Key, Plus, Copy, Check, Trash2, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/keys")({
  head: () => ({ meta: [{ title: "API Keys · fusioniuApi" }] }),
  component: KeysPage,
});

type Row = {
  id: string; name: string; key: string; email: string;
  is_active: boolean; request_count: number;
  last_used_at: string | null; ip: string | null; created_at: string;
};

function rndKey() {
  const a = new Uint8Array(24);
  crypto.getRandomValues(a);
  const hex = Array.from(a).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `fk_live_${hex}`;
}

function KeysPage() {
  const router = useRouter();
  const [me, setMe] = useState<{ id: string; email: string } | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function reload(uid: string) {
    const { data } = await supabase
      .from("api_keys")
      .select("id,name,key,email,is_active,request_count,last_used_at,ip,created_at")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    setRows((data as Row[] | null) ?? []);
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }: any) => {
      if (!data.session) { router.navigate({ to: "/login" }); return; }
      const u = { id: data.session.user.id, email: data.session.user.email as string };
      setMe(u);
      await reload(u.id);
      setReady(true);
    });
  }, [router]);

  async function createKey() {
    if (!me) return;
    if (!name.trim()) { toast.error("Give your key a name"); return; }
    setBusy(true);
    try {
      const ip = await fetch("https://api.ipify.org?format=json").then(r => r.json()).then(d => d.ip).catch(() => null);
      const { error } = await supabase.from("api_keys").insert({
        user_id: me.id, email: me.email, name: name.trim(),
        key: rndKey(), ip, user_agent: navigator.userAgent.slice(0, 200),
      });
      if (error) { toast.error(error.message); return; }
      setName(""); toast.success("Key created");
      await reload(me.id);
    } finally { setBusy(false); }
  }

  async function remove(id: string) {
    if (!confirm("Delete this API key? Existing apps using it will stop working.")) return;
    const { error } = await supabase.from("api_keys").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    if (me) reload(me.id);
  }

  async function toggleActive(r: Row) {
    const { error } = await supabase.from("api_keys").update({ is_active: !r.is_active }).eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    if (me) reload(me.id);
  }

  function copy(k: string) {
    navigator.clipboard.writeText(k);
    setCopied(k); toast.success("Key copied");
    setTimeout(() => setCopied(null), 1500);
  }

  if (!ready) {
    return <SiteLayout><div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">Loading...</div></SiteLayout>;
  }

  return (
    <SiteLayout>
      <section className="px-5 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs mb-3">
              <Key className="w-3.5 h-3.5 text-primary" /> API Access
            </div>
            <h1 className="text-4xl font-bold">Your API Keys</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Generate a key and pass it as <code className="text-primary">?key=YOUR_KEY</code> in every API request.
              Keys are tied to your account ({me?.email}).
            </p>
          </div>

          {/* Create */}
          <div className="card-3d rounded-2xl p-6 mb-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /> Generate new key</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Key name (e.g. My Bot, Production, Testing)"
                className="flex-1 px-4 py-2.5 rounded-lg bg-input border border-border focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none text-sm"
              />
              <button onClick={createKey} disabled={busy} className="btn-3d px-5 py-2.5 rounded-lg text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-60">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Generate
              </button>
            </div>
          </div>

          {/* List */}
          <div className="card-3d rounded-2xl p-6">
            <h3 className="font-semibold mb-4">Active keys ({rows.length})</h3>
            {rows.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                <ShieldAlert className="w-8 h-8 mx-auto mb-3 opacity-50" />
                No keys yet. Generate your first key above.
              </div>
            ) : (
              <div className="space-y-3">
                {rows.map((r) => (
                  <div key={r.id} className="p-4 rounded-xl border border-border bg-background/40">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          {r.name}
                          {!r.is_active && <span className="text-[10px] px-2 py-0.5 rounded bg-destructive/20 text-destructive">DISABLED</span>}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          Created {new Date(r.created_at).toLocaleString()} · {r.request_count} requests
                          {r.last_used_at && <> · Last used {new Date(r.last_used_at).toLocaleString()}</>}
                          {r.ip && <> · IP {r.ip}</>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => toggleActive(r)} className="px-3 py-1.5 rounded-lg border border-border hover:bg-primary/10 text-xs">
                          {r.is_active ? "Disable" : "Enable"}
                        </button>
                        <button onClick={() => remove(r.id)} className="p-1.5 rounded-lg border border-border hover:bg-destructive/10 hover:border-destructive/40">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 p-2.5 rounded-lg bg-background/70 border border-border">
                      <code className="text-[11px] font-mono break-all flex-1 text-primary">{r.key}</code>
                      <button onClick={() => copy(r.key)} className="p-1.5 rounded hover:bg-primary/10">
                        {copied === r.key ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 text-sm text-muted-foreground">
            Need help? See the <Link to="/docs" className="text-primary hover:underline">API docs</Link> for example requests.
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
