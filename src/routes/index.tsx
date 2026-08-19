import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { HeroGlobe } from "@/components/HeroGlobe";
import { ArrowRight, Shield, Zap, QrCode, Mail, Lock, Activity, Code2, CheckCircle2 } from "lucide-react";
import logo from "@/assets/fusion-logo.jpeg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "fusioniuApi — Next-Gen FamPay Payment Infrastructure" },
      { name: "description", content: "Integrate FamPay automatic payment verification with lightning-fast APIs. Generate UPI QR codes and verify transactions in real time." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative pt-20 pb-32 px-5 overflow-hidden">
        <HeroGlobe />
        <div className="max-w-6xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            API v2.0 is live
          </div>

          {/* 3D floating logo */}
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 blur-3xl bg-primary/40 rounded-full" />
            <div className="relative w-28 h-28 md:w-36 md:h-36 mx-auto rounded-3xl overflow-hidden ring-2 ring-primary/50 shadow-[var(--shadow-glow-lg)] float">
              <img src={logo} alt="fusioniuApi" className="w-full h-full object-cover" />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
            Next-Generation
            <br />
            <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent glow-text">
              Payment Infrastructure
            </span>
          </h1>
          <p className="mt-7 max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
            Integrate <span className="text-foreground font-medium">FamPay automatic payment verification</span> into your apps with blazing-fast APIs and military-grade security.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link to="/register" className="btn-3d px-7 py-3.5 rounded-xl font-semibold flex items-center gap-2">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/docs" className="px-7 py-3.5 rounded-xl font-semibold border border-primary/40 hover:bg-primary/10 transition flex items-center gap-2">
              <Code2 className="w-4 h-4" /> View Documentation
            </Link>
          </div>

          <div className="mt-14 flex flex-wrap justify-center gap-3">
            {[
              { label: "Uptime", value: "99.9%", icon: CheckCircle2 },
              { label: "Response", value: "<200ms", icon: Activity },
              { label: "Encrypted", value: "SSL/TLS", icon: Lock },
            ].map((s) => (
              <div key={s.label} className="card-3d rounded-xl px-5 py-3 flex items-center gap-3">
                <s.icon className="w-4 h-4 text-primary" />
                <div className="text-sm">
                  <span className="font-bold text-primary">{s.value}</span>
                  <span className="text-muted-foreground ml-2">{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-5 pb-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold">How It Works</h2>
            <p className="mt-3 text-muted-foreground">Simple 3-step integration for automatic payment verification</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: "01", title: "Create Account", desc: "Register with email OTP, set your password, and login to your developer dashboard.", icon: Mail },
              { n: "02", title: "Generate QR Code", desc: "Call the genqr API with your UPI ID, amount, and name to instantly create UPI QR codes.", icon: QrCode },
              { n: "03", title: "Verify Payment", desc: "Use UTR or FamPay Txn ID — our system scans your Gmail inbox to confirm transactions automatically.", icon: CheckCircle2 },
            ].map((s) => (
              <div key={s.n} className="card-3d rounded-2xl p-7 relative">
                <div className="text-6xl font-bold text-primary/15 absolute top-4 right-5">{s.n}</div>
                <s.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-5 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold">Why Choose fusioniuApi</h2>
            <p className="mt-3 text-muted-foreground">Enterprise-grade features built for developers</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { t: "Military-Grade Security", d: "SSL-encrypted APIs and zero data retention beyond verification.", i: Shield },
              { t: "Real-Time Verification", d: "Instant payment confirmation via Gmail IMAP scanning. No manual checks required.", i: Zap },
              { t: "Fraud Prevention", d: "Duplicate UTR detection and amount validation prevent double-spending and replay attacks.", i: Lock },
              { t: "Dynamic UPI QR", d: "Generate dynamic UPI QR codes instantly with merchant name, amount and UPI ID baked in.", i: QrCode },
              { t: "Detailed Analytics", d: "Track all your API calls and statuses from the developer dashboard.", i: Activity },
              { t: "24/7 Developer Support", d: "Direct access via Telegram @btwspark. Report issues, request features anytime.", i: Mail },
            ].map((f) => (
              <div key={f.t} className="card-3d rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center mb-4">
                  <f.i className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-1.5">{f.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SIGNUP vs NO-SIGNUP */}
      <section className="px-5 pb-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold">Without vs With Signup</h2>
            <p className="mt-3 text-muted-foreground">You can try the API instantly — sign up to unlock the full experience.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card-3d rounded-2xl p-7">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Without Signup</div>
              <h3 className="text-2xl font-bold mb-4">Try it free</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" /> Public API access (check & QR generator)</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" /> Use your own Gmail + App Password</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" /> Read the full documentation</li>
                <li className="flex gap-2 text-muted-foreground"><span className="w-4 h-4 mt-0.5 shrink-0 text-center">·</span> No personal dashboard</li>
                <li className="flex gap-2 text-muted-foreground"><span className="w-4 h-4 mt-0.5 shrink-0 text-center">·</span> No request history / logs</li>
                <li className="flex gap-2 text-muted-foreground"><span className="w-4 h-4 mt-0.5 shrink-0 text-center">·</span> No saved settings</li>
              </ul>
            </div>
            <div className="card-3d rounded-2xl p-7 ring-2 ring-primary/40 relative">
              <span className="absolute -top-3 right-5 px-3 py-1 rounded-full text-xs font-semibold btn-3d">Recommended</span>
              <div className="text-xs uppercase tracking-wider text-primary mb-2">With Signup (Free)</div>
              <h3 className="text-2xl font-bold mb-4">Full experience</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Everything in Without Signup</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Personal dashboard</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Full request history & logs</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Saved Gmail / App Password</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Interactive API playground</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Priority support from @btwspark</li>
              </ul>
              <Link to="/register" className="mt-6 inline-flex btn-3d px-5 py-2.5 rounded-xl font-semibold">Create free account</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-20">
        <div className="max-w-4xl mx-auto card-3d rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
          <div className="orb spin-slow" style={{ width: 300, height: 300, top: -100, left: -100, background: "oklch(0.65 0.24 255 / 0.5)" }} />
          <h2 className="text-3xl md:text-4xl font-bold relative">Ready to integrate?</h2>
          <p className="mt-3 text-muted-foreground relative">Create your free account and start verifying payments in minutes.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3 relative">
            <Link to="/register" className="btn-3d px-7 py-3.5 rounded-xl font-semibold">Create Account</Link>
            <Link to="/docs" className="px-7 py-3.5 rounded-xl font-semibold border border-primary/40 hover:bg-primary/10">Read Docs</Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
