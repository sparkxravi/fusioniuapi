import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Lock, Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login · fusioniuApi" }] }),
  component: Login,
});

function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(), password,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Welcome back!");
    router.navigate({ to: "/dashboard" });
  }

  return (
    <SiteLayout>
      <section className="px-5 py-16 min-h-[80vh] flex items-center">
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold">Welcome <span className="text-primary glow-text">back</span></h1>
            <p className="mt-2 text-muted-foreground text-sm">Login to access your developer dashboard.</p>
          </div>

          <div className="card-3d rounded-2xl p-7">
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2"><Mail className="w-4 h-4 text-primary" /> Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-input border border-border focus:border-primary outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2"><Lock className="w-4 h-4 text-primary" /> Password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-input border border-border focus:border-primary outline-none" />
              </div>
              <button type="submit" disabled={loading} className="w-full btn-3d py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Login"}
              </button>
            </form>
          </div>

          <p className="text-center mt-6 text-sm text-muted-foreground">
            New to fusioniuApi? <Link to="/register" className="text-primary font-medium hover:underline">Create an account</Link>
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
