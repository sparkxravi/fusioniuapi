import { useState } from "react";
import { Play, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

type Endpoint = "genqr" | "check";

export function ApiPlayground() {
  const [endpoint, setEndpoint] = useState<Endpoint>("genqr");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string>("");
  const [status, setStatus] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // shared
  const [apiKey, setApiKey] = useState("");

  // genqr params
  const [upi, setUpi] = useState("yourname@fam");
  const [amount, setAmount] = useState("10");
  const [name, setName] = useState("My Store");

  // check params
  const [mail, setMail] = useState("");
  const [apppass, setApppass] = useState("");
  const [utr, setUtr] = useState("");
  const [txnid, setTxnid] = useState("");
  const [checkAmount, setCheckAmount] = useState("10");

  const buildUrl = () => {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    if (endpoint === "genqr") {
      const p = new URLSearchParams({ key: apiKey, upi, amount, name });
      return `${base}/api/public/genqr?${p}`;
    }
    const p = new URLSearchParams({ key: apiKey, mail, apppass, amount: checkAmount });
    if (utr) p.set("utr", utr);
    if (txnid) p.set("txnid", txnid);
    return `${base}/api/public/check?${p}`;
  };

  const runRequest = async () => {
    setLoading(true);
    setResponse("");
    setStatus(null);
    try {
      const res = await fetch(buildUrl());
      setStatus(res.status);
      const text = await res.text();
      try {
        setResponse(JSON.stringify(JSON.parse(text), null, 2));
      } catch {
        setResponse(text);
      }
    } catch (e: any) {
      setResponse(`Network error: ${e?.message ?? String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = async () => {
    await navigator.clipboard.writeText(buildUrl());
    setCopied(true);
    toast.success("URL copied");
    setTimeout(() => setCopied(false), 1500);
  };

  const parsedQr = (() => {
    try {
      const o = JSON.parse(response);
      return o?.data?.qr_image as string | undefined;
    } catch {
      return undefined;
    }
  })();

  return (
    <div className="card-3d rounded-2xl p-6 md:p-8">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="text-xl font-bold">Live API Playground</h3>
          <p className="text-xs text-muted-foreground mt-1">Try the API directly from your browser. No signup needed.</p>
        </div>
        <div className="flex bg-input rounded-lg p-1 border border-border">
          {(["genqr", "check"] as Endpoint[]).map((e) => (
            <button
              key={e}
              onClick={() => { setEndpoint(e); setResponse(""); setStatus(null); }}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition ${
                endpoint === e ? "btn-3d" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              /{e}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Inputs */}
        <div className="space-y-3">
          <Field label="API Key" value={apiKey} onChange={setApiKey} placeholder="fk_live_..." type="password" />
          {endpoint === "genqr" ? (
            <>
              <Field label="UPI ID" value={upi} onChange={setUpi} placeholder="yourname@fam" />
              <Field label="Amount (₹)" value={amount} onChange={setAmount} placeholder="10" />
              <Field label="Merchant name" value={name} onChange={setName} placeholder="My Store" />
            </>
          ) : (
            <>
              <Field label="Gmail" value={mail} onChange={setMail} placeholder="you@gmail.com" />
              <Field label="App Password" value={apppass} onChange={setApppass} placeholder="16 char app password" type="password" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="UTR" value={utr} onChange={setUtr} placeholder="301268197755" />
                <Field label="OR Txn ID" value={txnid} onChange={setTxnid} placeholder="FMPIB..." />
              </div>
              <Field label="Amount (₹)" value={checkAmount} onChange={setCheckAmount} placeholder="10" />
            </>
          )}

          <div className="flex gap-2 pt-2">
            <button onClick={runRequest} disabled={loading} className="flex-1 btn-3d py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-60 text-sm">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Send Request
            </button>
            <button onClick={copyUrl} className="px-4 py-2.5 rounded-lg border border-border hover:bg-primary/10 text-sm flex items-center gap-2">
              {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="text-[10px] font-mono text-muted-foreground p-3 rounded-lg bg-background/50 border border-border break-all">
            {buildUrl()}
          </div>
        </div>

        {/* Response */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Response</span>
            {status !== null && (
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                status < 300 ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
              }`}>
                {status}
              </span>
            )}
          </div>
          <pre className="h-64 p-3 rounded-lg bg-background/70 border border-border text-[11px] font-mono overflow-auto whitespace-pre-wrap">
            {response || <span className="text-muted-foreground">Response will appear here…</span>}
          </pre>
          {parsedQr && (
            <div className="flex justify-center p-3 rounded-lg bg-white">
              <img src={parsedQr} alt="QR" className="w-40 h-40" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-lg bg-input border border-border focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none text-sm font-mono"
      />
    </div>
  );
}
