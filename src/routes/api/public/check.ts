import { createFileRoute } from "@tanstack/react-router";
import { validateApiKey, admin } from "@/lib/api-auth.server";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
      "cache-control": "no-store",
    },
  });
}

function istFormat(d: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata", day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  }).formatToParts(d);
  const m: Record<string, string> = {};
  for (const p of parts) m[p.type] = p.value;
  return `${m.day}-${m.month}-${m.year} ${m.hour}:${m.minute}:${m.second}`;
}

export const Route = createFileRoute("/api/public/check")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const key = url.searchParams.get("key")?.trim();
        const auth = await validateApiKey(key, request);
        if (!auth.ok) {
          return json({ status: "error", message: auth.message, details: auth.details, dev: "@btwspark" }, auth.status);
        }

        const mail = url.searchParams.get("mail")?.trim();
        const apppass = url.searchParams.get("apppass")?.trim();
        const utr = url.searchParams.get("utr")?.trim();
        const txnid = url.searchParams.get("txnid")?.trim();
        const amountStr = url.searchParams.get("amount")?.trim();

        if (!mail || !apppass || !amountStr || (!utr && !txnid)) {
          return json({ status: "error", message: "Missing parameters", details: "Required: key, mail, apppass, amount, and one of utr or txnid", dev: "@btwspark" }, 400);
        }
        const expectedAmount = Number(amountStr);
        if (!Number.isFinite(expectedAmount)) {
          return json({ status: "error", message: "Invalid amount", dev: "@btwspark" }, 400);
        }

        // ---------- DEDUP CHECK (before doing IMAP work) ----------
        const sb = admin();
        const ident = (utr || txnid)!.toLowerCase();
        const { data: existing } = await sb
          .from("verified_transactions")
          .select("identifier,verified_at,verified_by_email")
          .eq("identifier", ident)
          .maybeSingle();
        if (existing) {
          return json({
            status: "error",
            message: "Transaction already verified",
            details: "This UTR / Txn ID has already been used. Each transaction can only be verified once.",
            previously_verified_at: existing.verified_at,
            dev: "@btwspark",
          }, 409);
        }

        const fullEmail = mail.includes("@") ? mail : `${mail}@gmail.com`;
        const cleanPass = apppass.replace(/\s+/g, "");

        const { ImapFlow } = await import("imapflow");
        const client = new ImapFlow({
          host: "imap.gmail.com", port: 993, secure: true,
          auth: { user: fullEmail, pass: cleanPass }, logger: false,
        });

        try { await client.connect(); }
        catch (e: any) {
          return json({ status: "error", message: "Invalid Gmail app password or authentication failed", details: String(e?.message ?? e), dev: "@btwspark" }, 401);
        }

        try {
          const lock = await client.getMailboxLock("INBOX");
          try {
            const sinceDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const uids = await client.search({ since: sinceDate, subject: "You received" }, { uid: true });
            if (!uids || uids.length === 0) {
              return json({ status: "error", message: "Transaction not found", details: "No matching payment found in email inbox", dev: "@btwspark" }, 404);
            }
            const sorted = [...uids].sort((a, b) => b - a);

            for (const uid of sorted) {
              const msg: any = await client.fetchOne(String(uid), { source: true, envelope: true }, { uid: true });
              if (!msg || !msg.source) continue;
              const body = msg.source.toString("utf8");

              const matchesId = utr
                ? new RegExp(`\\b${utr}\\b`).test(body)
                : txnid ? new RegExp(`\\b${txnid}\\b`, "i").test(body) : false;
              if (!matchesId) continue;

              const amtMatch = body.match(/(?:₹|Rs\.?|INR)\s*([0-9]+(?:\.[0-9]{1,2})?)/i);
              const foundAmount = amtMatch ? Number(amtMatch[1]) : NaN;

              const utrMatch = utr ? utr : (body.match(/\b(\d{12})\b/)?.[1] ?? null);
              const txnMatch = txnid ? txnid : (body.match(/\b(FMPIB[A-Z0-9]+)\b/i)?.[1] ?? null);

              const fromMatch = body.match(/from\s+([A-Z][A-Za-z .'-]{2,40})/);
              const sender = fromMatch ? fromMatch[1].trim() : null;
              const date = msg.envelope?.date ? new Date(msg.envelope.date) : new Date();

              if (Number.isFinite(foundAmount) && foundAmount !== expectedAmount) {
                return json({
                  status: "error", message: "Amount mismatch",
                  details: "Expected amount does not match the transaction amount",
                  expected: expectedAmount, found: foundAmount, dev: "@btwspark",
                }, 409);
              }

              // ---------- Record dedup row atomically; if race -> already verified ----------
              const finalAmount = Number.isFinite(foundAmount) ? foundAmount : expectedAmount;
              const { error: insErr } = await sb.from("verified_transactions").insert({
                identifier: ident,
                kind: utr ? "utr" : "txnid",
                amount: finalAmount,
                verified_by_key: auth.row.id,
                verified_by_email: auth.row.email,
              });
              if (insErr) {
                // 23505 = unique_violation
                if ((insErr as any).code === "23505") {
                  return json({
                    status: "error",
                    message: "Transaction already verified",
                    details: "This UTR / Txn ID has already been used.",
                    dev: "@btwspark",
                  }, 409);
                }
                return json({ status: "error", message: "Failed to record verification", details: insErr.message, dev: "@btwspark" }, 500);
              }

              return json({
                status: "success",
                data: {
                  transaction_id: txnMatch,
                  amount: finalAmount,
                  utr: utrMatch,
                  sender_name: sender,
                  payment_time_ist: istFormat(date),
                  verified: true,
                },
                dev: "@btwspark",
              });
            }

            return json({ status: "error", message: "Transaction not found", details: "No matching payment found in email inbox", dev: "@btwspark" }, 404);
          } finally {
            lock.release();
          }
        } catch (e: any) {
          return json({ status: "error", message: "Mailbox scan failed", details: String(e?.message ?? e), dev: "@btwspark" }, 500);
        } finally {
          try { await client.logout(); } catch {}
        }
      },
    },
  },
});
