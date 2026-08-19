import { createFileRoute } from "@tanstack/react-router";
import QRCode from "qrcode";
import { validateApiKey } from "@/lib/api-auth.server";

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

export const Route = createFileRoute("/api/public/genqr")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const key = url.searchParams.get("key")?.trim();
        const auth = await validateApiKey(key, request);
        if (!auth.ok) return json({ status: "error", message: auth.message, details: auth.details, dev: "@btwspark" }, auth.status);

        const upi = url.searchParams.get("upi")?.trim();
        const amount = url.searchParams.get("amount")?.trim();
        const name = url.searchParams.get("name")?.trim();

        if (!upi || !amount || !name) {
          return json({ status: "error", message: "Missing parameters", details: "upi, amount and name are required", dev: "@btwspark" }, 400);
        }
        if (!/^[\w.\-]+@[\w.\-]+$/.test(upi)) {
          return json({ status: "error", message: "Invalid UPI ID", dev: "@btwspark" }, 400);
        }
        const amt = Number(amount);
        if (!Number.isFinite(amt) || amt <= 0) {
          return json({ status: "error", message: "Invalid amount", dev: "@btwspark" }, 400);
        }

        const upiUri = `upi://pay?pa=${encodeURIComponent(upi)}&pn=${encodeURIComponent(name)}&am=${amt}&cu=INR`;
        const dataUrl = await QRCode.toDataURL(upiUri, {
          errorCorrectionLevel: "M", margin: 2, width: 480,
          color: { dark: "#0a1024", light: "#ffffff" },
        });

        const now = new Date();
        const istParts = new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Kolkata", day: "2-digit", month: "2-digit", year: "numeric",
          hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
        }).formatToParts(now);
        const map: Record<string, string> = {};
        for (const p of istParts) map[p.type] = p.value;
        const ist = `${map.day}-${map.month}-${map.year} ${map.hour}:${map.minute}:${map.second}`;

        return json({
          status: "success",
          data: { qr_image: dataUrl, upi_uri: upiUri, upi_id: upi, amount: String(amt), name, created_at_ist: ist },
          dev: "@btwspark",
        });
      },
    },
  },
});
