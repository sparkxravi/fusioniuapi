import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { requestSignupOtp, verifyOtpAndCreateAccount } from "@/lib/auth.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, KeyRound, Lock, Loader2, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create your fusioniuApi account" }] }),
  component: Register,
});

type Step = "email" | "otp" | "password";

function Register() {
  const router = useRouter();
  const sendOtp = useServerFn(requestSignupOtp);
  const verifyOtp = useServerFn(verifyOtpAndCreateAccount);

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await sendOtp({ data: { email: email.trim().toLowerCase() } });
      if (!res.ok) { toast.error(res.error); return; }
      toast.success("OTP sent to your email");
      setStep("otp");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to send OTP");
    } finally { setLoading(false); }
  }

  function handleOtpNext(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) { toast.error("Enter a 6-digit code"); return; }
    setStep("password");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (password !== confirm) { toast.error("Passwords do not match"); return; }
    setLoading(true);
    try {
      const res = await verifyOtp({ data: { email: email.trim().toLowerCase(), code: otp, password } });
      if (!res.ok) { toast.error(res.error); return; }
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (error) { toast.error(error.message); return; }
      toast.success("Welcome to fusioniuApi!");
      router.navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err?.message ?? "Account creation failed");
    } finally { setLoading(false); }
  }

  return (
    <SiteLayout>
      <section className="px-5 py-16 min-h-[80vh] flex items-center">
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold">Create your <span className="text-primary glow-text">account</span></h1>
            <p className="mt-2 text-muted-foreground text-sm">Start verifying payments in minutes.</p>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {(["email", "otp", "password"] as Step[]).map((s, i) => {
              const order = ["email", "otp", "password"] as Step[];
              const active = order.indexOf(step) >= i;
              return (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition ${active ? "btn-3d" : "bg-muted text-muted-foreground"}`}>
                    {order.indexOf(step) > i ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  {i < 2 && <div className={`w-12 h-0.5 ${active ? "bg-primary" : "bg-border"}`} />}
                </div>
              );
            })}
          </div>

          <div className="card-3d rounded-2xl p-7">
            {step === "email" && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="text-sm font-medium flex items-center gap-2 mb-2"><Mail className="w-4 h-4 text-primary" /> Email address</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-input border border-border focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition" />
                  <p className="mt-2 text-xs text-muted-foreground">We'll send a 6-digit verification code.</p>
                </div>
                <button type="submit" disabled={loading} className="w-full btn-3d py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send OTP"}
                </button>
              </form>
            )}

            {step === "otp" && (
              <form onSubmit={handleOtpNext} className="space-y-4">
                <div>
                  <label className="text-sm font-medium flex items-center gap-2 mb-2"><KeyRound className="w-4 h-4 text-primary" /> Verification code</label>
                  <input inputMode="numeric" pattern="\d{6}" required maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full px-4 py-3 rounded-xl bg-input border border-border focus:border-primary outline-none text-center text-2xl tracking-[0.6em] font-mono" />
                  <p className="mt-2 text-xs text-muted-foreground">Code sent to <span className="text-primary">{email}</span> · expires in 10 min</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setStep("email")} className="flex-1 py-3 rounded-xl border border-border hover:bg-primary/10 text-sm">Back</button>
                  <button type="submit" className="flex-1 btn-3d py-3 rounded-xl font-semibold">Continue</button>
                </div>
                <button type="button" onClick={handleSendOtp as any} disabled={loading} className="w-full text-xs text-muted-foreground hover:text-primary">Resend code</button>
              </form>
            )}

            {step === "password" && (
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-sm font-medium flex items-center gap-2 mb-2"><Lock className="w-4 h-4 text-primary" /> Password</label>
                  <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full px-4 py-3 rounded-xl bg-input border border-border focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium flex items-center gap-2 mb-2"><Lock className="w-4 h-4 text-primary" /> Confirm password</label>
                  <input type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-4 py-3 rounded-xl bg-input border border-border focus:border-primary outline-none" />
                </div>
                <button type="submit" disabled={loading} className="w-full btn-3d py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create account"}
                </button>
              </form>
            )}
          </div>

          <p className="text-center mt-6 text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Login</Link>
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
