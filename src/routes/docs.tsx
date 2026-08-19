import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { CodeBlock } from "@/components/CodeBlock";
import { useState } from "react";
import { QrCode, ShieldCheck, Terminal, Globe2, Braces } from "lucide-react";
import { ApiPlayground } from "@/components/ApiPlayground";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "fusioniuApi · API Documentation" },
      { name: "description", content: "Complete fusioniuApi documentation — endpoints, parameters, and integration examples in Python, JavaScript and HTML." },
    ],
  }),
  component: Docs,
});

const BASE = "https://fusioniuapi.vercel.app";

function Docs() {
  const [lang, setLang] = useState<"curl" | "python" | "js" | "html">("curl");

  const genqrUrl = `${BASE}/api/public/genqr?key=YOUR_API_KEY&upi=YOURUPI@fam&amount=AMOUNT&name=MERCHANTNAME`;
  const checkUrlUtr = `${BASE}/api/public/check?key=YOUR_API_KEY&mail=YOUREMAIL@gmail.com&apppass=APPPASSWORD&utr=UTRNUMBER&amount=AMOUNT`;
  const checkUrlTxn = `${BASE}/api/public/check?key=YOUR_API_KEY&mail=YOUREMAIL@gmail.com&apppass=APPPASSWORD&txnid=FMPIBXXXXXXX&amount=AMOUNT`;

  const samples: Record<string, { genqr: string; check: string }> = {
    curl: {
      genqr: `curl "${BASE}/api/public/genqr?upi=yourname@fam&amount=10&name=My%20Store"`,
      check: `curl "${BASE}/api/public/check?mail=you@gmail.com&apppass=abcdefghijklmnop&utr=301268197755&amount=10"`,
    },
    python: {
      genqr: `import requests

resp = requests.get("${BASE}/api/public/genqr", params={
    "upi": "yourname@fam",
    "amount": 10,
    "name": "My Store",
})
data = resp.json()
print(data["data"]["qr_image"])  # base64 PNG data URL`,
      check: `import requests

resp = requests.get("${BASE}/api/public/check", params={
    "mail":    "you@gmail.com",
    "apppass": "abcdefghijklmnop",   # 16-char Gmail App Password
    "utr":     "301268197755",        # OR use "txnid": "FMPIB..."
    "amount":  10,
})
result = resp.json()
if result.get("status") == "success":
    print("Paid by", result["data"]["sender_name"])
else:
    print("Not verified:", result.get("message"))`,
    },
    js: {
      genqr: `// Node.js or browser fetch
const params = new URLSearchParams({
  upi: "yourname@fam",
  amount: "10",
  name: "My Store",
});
const res = await fetch(\`${BASE}/api/public/genqr?\${params}\`);
const data = await res.json();
console.log(data.data.qr_image); // base64 PNG`,
      check: `const params = new URLSearchParams({
  mail:    "you@gmail.com",
  apppass: "abcdefghijklmnop",
  utr:     "301268197755",   // or txnid: "FMPIB..."
  amount:  "10",
});
const res = await fetch(\`${BASE}/api/public/check?\${params}\`);
const result = await res.json();
if (result.status === "success") {
  console.log("Verified:", result.data);
} else {
  console.warn("Failed:", result.message);
}`,
    },
    html: {
      genqr: `<!-- Embed UPI QR directly in your HTML page -->
<img id="qr" alt="UPI QR" />
<script>
  fetch("${BASE}/api/public/genqr?upi=yourname@fam&amount=10&name=My%20Store")
    .then(r => r.json())
    .then(d => { document.getElementById("qr").src = d.data.qr_image; });
</script>`,
      check: `<button id="verify">Verify Payment</button>
<pre id="out"></pre>
<script>
  document.getElementById("verify").onclick = async () => {
    const r = await fetch("${BASE}/api/public/check?mail=you@gmail.com&apppass=abcdefghijklmnop&utr=301268197755&amount=10");
    document.getElementById("out").textContent = JSON.stringify(await r.json(), null, 2);
  };
</script>`,
    },
  };

  const tabs = [
    { id: "curl", label: "cURL", icon: Terminal },
    { id: "python", label: "Python", icon: Braces },
    { id: "js", label: "JavaScript", icon: Braces },
    { id: "html", label: "HTML / Web", icon: Globe2 },
  ] as const;

  return (
    <SiteLayout>
      <section className="px-5 pt-16 pb-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-6 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" /> REST API · JSON responses
          </div>
          <h1 className="text-5xl md:text-6xl font-bold">
            API <span className="text-primary glow-text">Documentation</span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Integrate FamPay payment verification into your application in minutes with our simple REST API.
          </p>
        </div>
      </section>

      <section className="px-5 pb-20">
        <div className="max-w-5xl mx-auto space-y-10">
          {/* API KEY CTA */}
          <div className="card-3d rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-primary/30">
            <div>
              <h3 className="font-semibold text-lg">🔑 You need an API key</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Every request to <code className="text-primary">/genqr</code> and <code className="text-primary">/check</code> requires <code className="text-primary">?key=YOUR_API_KEY</code>.
                Sign up, then generate a key from your dashboard.
              </p>
            </div>
            <Link to="/keys" className="btn-3d px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap">Generate API key →</Link>
          </div>

          {/* App Password CTA */}
          <div className="card-3d rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-semibold">Need a Gmail App Password?</h3>
              <p className="text-sm text-muted-foreground">The /check endpoint requires a 16-char Gmail App Password (not your normal password).</p>
            </div>
            <Link to="/app-password" className="btn-3d px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap">Get the guide →</Link>
          </div>

          {/* LIVE PLAYGROUND */}
          <ApiPlayground />

          {/* ENDPOINT 1 */}
          <div className="card-3d rounded-2xl p-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                <QrCode className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">1. Generate UPI QR</h2>
                <p className="text-xs text-muted-foreground">Create a dynamic UPI QR code. Requires an API key.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-background/60 border border-border font-mono text-xs overflow-x-auto">
              <span className="px-2 py-0.5 rounded bg-success/20 text-success font-semibold">GET</span>
              <span className="text-muted-foreground">{genqrUrl}</span>
            </div>

            <h4 className="font-semibold mt-6 mb-2 text-sm">Request Parameters</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground border-b border-border">
                  <tr><th className="py-2 pr-4">Parameter</th><th className="py-2 pr-4">Type</th><th className="py-2">Description</th></tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr><td className="py-2 pr-4 font-mono text-primary">key</td><td className="py-2 pr-4 text-xs">Required</td><td className="py-2 text-muted-foreground">Your API key from <Link to="/keys" className="text-primary underline">/keys</Link></td></tr>
                  <tr><td className="py-2 pr-4 font-mono text-primary">upi</td><td className="py-2 pr-4 text-xs">Required</td><td className="py-2 text-muted-foreground">Your UPI ID (e.g. <code className="text-foreground">yourname@fam</code>)</td></tr>
                  <tr><td className="py-2 pr-4 font-mono text-primary">amount</td><td className="py-2 pr-4 text-xs">Required</td><td className="py-2 text-muted-foreground">Fixed amount in INR (user can't edit it)</td></tr>
                  <tr><td className="py-2 pr-4 font-mono text-primary">name</td><td className="py-2 pr-4 text-xs">Required</td><td className="py-2 text-muted-foreground">Merchant / payee name shown on the QR</td></tr>
                </tbody>
              </table>
            </div>

            <h4 className="font-semibold mt-6 mb-2 text-sm">Response</h4>
            <CodeBlock lang="json" code={`{
  "status": "success",
  "data": {
    "qr_image": "data:image/png;base64,iVBOR...",
    "upi_uri": "upi://pay?pa=yourname@fam&pn=My%20Store&am=10&cu=INR",
    "upi_id": "yourname@fam",
    "amount": "10",
    "name": "My Store",
    "created_at_ist": "16-05-2026 23:47:00"
  },
  "dev": "@btwspark"
}`} />
          </div>

          {/* ENDPOINT 2 */}
          <div className="card-3d rounded-2xl p-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">2. Verify Payment</h2>
                <p className="text-xs text-muted-foreground">Scan your Gmail for FamPay "You received" emails and confirm payment.</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-2 mt-4">For payments from other apps (Paytm / GPay / PhonePe → FamPay) use <code className="text-primary">utr</code>:</p>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-background/60 border border-border font-mono text-xs overflow-x-auto">
              <span className="px-2 py-0.5 rounded bg-success/20 text-success font-semibold">GET</span>
              <span className="text-muted-foreground">{checkUrlUtr}</span>
            </div>

            <p className="text-sm text-muted-foreground mb-2 mt-5">For FamPay → FamPay transfers use <code className="text-primary">txnid</code>:</p>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-background/60 border border-border font-mono text-xs overflow-x-auto">
              <span className="px-2 py-0.5 rounded bg-success/20 text-success font-semibold">GET</span>
              <span className="text-muted-foreground">{checkUrlTxn}</span>
            </div>

            <h4 className="font-semibold mt-6 mb-2 text-sm">Request Parameters</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground border-b border-border">
                  <tr><th className="py-2 pr-4">Parameter</th><th className="py-2 pr-4">Type</th><th className="py-2">Description</th></tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr><td className="py-2 pr-4 font-mono text-primary">key</td><td className="py-2 pr-4 text-xs">Required</td><td className="py-2 text-muted-foreground">Your API key from <Link to="/keys" className="text-primary underline">/keys</Link></td></tr>
                  <tr><td className="py-2 pr-4 font-mono text-primary">mail</td><td className="py-2 pr-4 text-xs">Required</td><td className="py-2 text-muted-foreground">Your Gmail address (with or without @gmail.com)</td></tr>
                  <tr><td className="py-2 pr-4 font-mono text-primary">apppass</td><td className="py-2 pr-4 text-xs">Required</td><td className="py-2 text-muted-foreground">Gmail App Password (16 chars, not your normal password)</td></tr>
                  <tr><td className="py-2 pr-4 font-mono text-primary">amount</td><td className="py-2 pr-4 text-xs">Required</td><td className="py-2 text-muted-foreground">Expected amount in INR for validation</td></tr>
                  <tr><td className="py-2 pr-4 font-mono text-primary">utr</td><td className="py-2 pr-4 text-xs">Conditional</td><td className="py-2 text-muted-foreground">12-digit UTR (for non-FamPay payments)</td></tr>
                  <tr><td className="py-2 pr-4 font-mono text-primary">txnid</td><td className="py-2 pr-4 text-xs">Conditional</td><td className="py-2 text-muted-foreground">FamPay Txn ID like <code>FMPIB...</code> (FamPay → FamPay only)</td></tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/30 text-sm">
              <strong className="text-primary">Important:</strong> Use either <code>utr</code> OR <code>txnid</code> — not both. We only scan emails starting with <code>"You received"</code> to ensure valid payment confirmations.
            </div>

            <h4 className="font-semibold mt-6 mb-2 text-sm">Success Response</h4>
            <CodeBlock lang="json" code={`{
  "status": "success",
  "data": {
    "transaction_id": "FMPIB5255631361",
    "amount": 10,
    "utr": "301268197755",
    "sender_name": "Anuj Patel",
    "payment_time_ist": "16-05-2026 23:50:12",
    "verified": true
  },
  "dev": "@btwspark"
}`} />

            <h4 className="font-semibold mt-6 mb-2 text-sm">Error Responses</h4>
            <CodeBlock lang="json" code={`// 401 Missing or invalid key
{ "status": "error", "message": "API key required", "dev": "@btwspark" }

// 403 Blocked / disabled
{ "status": "error", "message": "Account blocked", "dev": "@btwspark" }

// 409 Already verified (each UTR / Txn ID can only be used ONCE)
{ "status": "error", "message": "Transaction already verified",
  "details": "This UTR / Txn ID has already been used.", "dev": "@btwspark" }

// 404 Not Found
{ "status": "error", "message": "Transaction not found",
  "details": "No matching payment found in email inbox", "dev": "@btwspark" }

// 409 Amount Mismatch
{ "status": "error", "message": "Amount mismatch", "expected": 10, "found": 5, "dev": "@btwspark" }

// 401 Gmail Auth failure
{ "status": "error", "message": "Invalid Gmail app password or authentication failed", "dev": "@btwspark" }`} />
          </div>

          {/* EXAMPLES */}
          <div className="card-3d rounded-2xl p-7">
            <h2 className="text-2xl font-bold mb-1">Integration Examples</h2>
            <p className="text-sm text-muted-foreground mb-5">Copy-paste ready snippets in your favorite language.</p>

            <div className="flex flex-wrap gap-2 mb-5">
              {tabs.map((t) => (
                <button key={t.id} onClick={() => setLang(t.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition border ${
                    lang === t.id
                      ? "btn-3d border-transparent"
                      : "border-border text-muted-foreground hover:text-foreground hover:bg-primary/10"
                  }`}>
                  <t.icon className="w-4 h-4" /> {t.label}
                </button>
              ))}
            </div>

            <h4 className="font-semibold mb-2 text-sm text-primary">→ Generate QR</h4>
            <CodeBlock lang={lang} code={samples[lang].genqr} />

            <h4 className="font-semibold mt-6 mb-2 text-sm text-primary">→ Verify Payment</h4>
            <CodeBlock lang={lang} code={samples[lang].check} />
          </div>

          {/* ERROR CODES */}
          <div className="card-3d rounded-2xl p-7">
            <h2 className="text-2xl font-bold mb-4">Error Codes</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground border-b border-border">
                  <tr><th className="py-2 pr-4">Code</th><th className="py-2 pr-4">Status</th><th className="py-2">Description</th></tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {[
                    ["400", "Bad Request", "Missing or invalid parameters"],
                    ["401", "Unauthorized", "Invalid Gmail app password or authentication failed"],
                    ["403", "Forbidden", "IMAP access disabled or account restricted"],
                    ["404", "Not Found", "Payment not found in email inbox"],
                    ["409", "Conflict", "Amount mismatch or duplicate transaction"],
                    ["500", "Server Error", "Mailbox scan failed; try again"],
                  ].map((r) => (
                    <tr key={r[0]}>
                      <td className="py-2 pr-4 font-mono text-destructive">{r[0]}</td>
                      <td className="py-2 pr-4">{r[1]}</td>
                      <td className="py-2 text-muted-foreground">{r[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
