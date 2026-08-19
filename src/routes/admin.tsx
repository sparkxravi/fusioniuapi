import { createFileRoute, useRouter } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Trash2, Ban, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · fusioniuApi" }] }),
  component: AdminPage,
});

const ADMIN_EMAIL = "sparkox19711@gmail.com";

type KeyRow = {
  id: string; user_id: string; email: string; name: string; key: string;
  ip: string | null; user_agent: string | null; is_active: boolean;
  request_count: number; last_used_at: string | null; created_at: string;
};
type BlockRow = { id: string; user_id: string; email: string; reason: string | null; created_at: string };

function AdminPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [denied, setDenied] = useState(false);
  const [keys, setKeys] = useState<KeyRow[]>([]);
  const [blocks, setBlocks] = useState<BlockRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [me, setMe] = useState<{ id: string; email: string } | null>(null);

  async function reload() {
    const { data: k } = await supabase.from("api_keys").select("*").order("created_at", { ascending: false });
    const { data: b } = await supabase.from("blocked_users").select("*").order("created_at", { ascending: false });
    setKeys((k as KeyRow[] | null) ?? []);
    setBlocks((b as BlockRow[] | null) ?? []);
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }: any) => {
      if (!data.session) { router.navigate({ to: "/login" }); return; }
      const email = (data.session.user.email ?? "").toLowerCase();
      if (email !== ADMIN_EMAIL) { setDenied(true); setReady(true); return; }
      setMe({ id: data.session.user.id, email });
      await reload();
      setReady(true);
    });
  }, [router]);

  async function deleteKey(id: string) {
    if (!confirm("Delete this key?")) return;
    setBusy(true);
    const { error } = await supabase.from("api_keys").delete().eq("id", id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Key removed"); reload();
  }

  async function blockUser(user_id: string, email: string) {
    const reason = prompt(`Block ${email}? Reason (optional):`) ?? "";
    if (reason === null) return;
    setBusy(true);
    const { error } = await supabase.from("blocked_users").insert({
      user_id, email, reason: reason || null, blocked_by: me?.id ?? null,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    // also disable all their keys
    await supabase.from("api_keys").update({ is_active: false }).eq("user_id", user_id);
    toast.success("User blocked"); reload();
  }

  async function unblock(id: string, user_id: string) {
    setBusy(true);
    const { error } = await supabase.from("blocked_users").delete().eq("id", id);
    setBusy(false);
    if (error) return toast.error(error.message);
    await supabase.from("api_keys").update({ is_active: true }).eq("user_id", user_id);
    toast.success("Unblocked"); reload();
  }

  if (!ready) return <SiteLayout><div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">Loading...</div></SiteLayout>;

  if (denied) {
    return (
      <SiteLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center px-5">
          <Shield className="w-12 h-12 text-destructive" />
          <h1 className="text-2xl font-bold">Access denied</h1>
          <p className="text-muted-foreground text-sm">This panel is restricted to the admin account.</p>
        </div>
      </SiteLayout>
    );
  }

  const blockedSet = new Set(blocks.map((b) => b.user_id));

  return (
    <SiteLayout>
      <section className="px-5 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs mb-3">
              <Shield className="w-3.5 h-3.5 text-primary" /> Admin
            </div>
            <h1 className="text-4xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground text-sm mt-1">Signed in as <span className="text-primary">{me?.email}</span></p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Stat label="Total Keys" value={keys.length} />
            <Stat label="Active Keys" value={keys.filter(k => k.is_active).length} />
            <Stat label="Blocked Users" value={blocks.length} />
          </div>

          {/* Blocked users */}
          <div className="card-3d rounded-2xl p-6 mb-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Ban className="w-4 h-4 text-destructive" /> Blocked Users</h3>
            {blocks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users blocked.</p>
            ) : (
              <div className="space-y-2">
                {blocks.map((b) => (
                  <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-border bg-background/40">
                    <div>
                      <div className="font-medium text-sm">{b.email}</div>
                      <div className="text-[11px] text-muted-foreground">{b.reason || "no reason"} · {new Date(b.created_at).toLocaleString()}</div>
                    </div>
                    <button onClick={() => unblock(b.id, b.user_id)} disabled={busy} className="px-3 py-1.5 rounded-lg border border-border hover:bg-primary/10 text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Unblock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* All keys */}
          <div className="card-3d rounded-2xl p-6">
            <h3 className="font-semibold mb-4">All API Keys ({keys.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-left text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-2 pr-3">User</th>
                    <th className="py-2 pr-3">Key name</th>
                    <th className="py-2 pr-3">Key</th>
                    <th className="py-2 pr-3">IP</th>
                    <th className="py-2 pr-3">Created</th>
                    <th className="py-2 pr-3">Used</th>
                    <th className="py-2 pr-3">Calls</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((k) => {
                    const blocked = blockedSet.has(k.user_id);
                    return (
                      <tr key={k.id} className="border-b border-border/40">
                        <td className="py-2 pr-3 font-mono">{k.email}</td>
                        <td className="py-2 pr-3">{k.name}</td>
                        <td className="py-2 pr-3"><code className="text-[10px] text-primary break-all">{k.key}</code></td>
                        <td className="py-2 pr-3 font-mono">{k.ip ?? "—"}</td>
                        <td className="py-2 pr-3">{new Date(k.created_at).toLocaleString()}</td>
                        <td className="py-2 pr-3">{k.last_used_at ? new Date(k.last_used_at).toLocaleString() : "—"}</td>
                        <td className="py-2 pr-3">{k.request_count}</td>
                        <td className="py-2 pr-3">
                          {blocked ? <span className="text-destructive">BLOCKED</span>
                            : k.is_active ? <span className="text-success">active</span>
                            : <span className="text-muted-foreground">disabled</span>}
                        </td>
                        <td className="py-2 pr-3">
                          <div className="flex gap-1 justify-end">
                            {!blocked && (
                              <button title="Block user" onClick={() => blockUser(k.user_id, k.email)} disabled={busy} className="p-1.5 rounded hover:bg-destructive/10">
                                <Ban className="w-3.5 h-3.5 text-destructive" />
                              </button>
                            )}
                            <button title="Delete key" onClick={() => deleteKey(k.id)} disabled={busy} className="p-1.5 rounded hover:bg-destructive/10">
                              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 text-destructive" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card-3d rounded-xl p-5">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-2xl font-bold text-primary">{value}</div>
    </div>
  );
}
