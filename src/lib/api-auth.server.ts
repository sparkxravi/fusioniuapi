// Shared server-only helpers for the public API.
import { createClient } from "@supabase/supabase-js";

export function admin() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !key) throw new Error("Supabase service env not configured");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function getClientIp(request: Request): string {
  const xf = request.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function validateApiKey(
  key: string | null | undefined,
  request: Request,
): Promise<
  | { ok: true; row: { id: string; user_id: string; email: string; is_active: boolean; request_count: number } }
  | { ok: false; status: number; message: string; details?: string }
> {
  if (!key) {
    return {
      ok: false, status: 401,
      message: "API key required",
      details: "Pass ?key=YOUR_KEY in the URL. Generate one from your dashboard at /keys",
    };
  }
  const sb = admin();
  const { data: row, error } = await sb
    .from("api_keys")
    .select("id,user_id,email,is_active,request_count")
    .eq("key", key)
    .maybeSingle();

  if (error) return { ok: false, status: 500, message: "Key lookup failed", details: error.message };
  if (!row) return { ok: false, status: 401, message: "Invalid API key" };
  if (!row.is_active) return { ok: false, status: 403, message: "API key is disabled" };

  // Block check
  const { data: blk } = await sb
    .from("blocked_users")
    .select("id,reason")
    .eq("user_id", row.user_id)
    .maybeSingle();
  if (blk) {
    return {
      ok: false, status: 403,
      message: "Account blocked",
      details: blk.reason ?? "Contact admin @btwspark",
    };
  }

  // Track usage (best-effort, ignore errors)
  const ip = getClientIp(request);
  await sb.from("api_keys").update({
    ip,
    last_used_at: new Date().toISOString(),
    request_count: (row.request_count ?? 0) + 1,
  }).eq("id", row.id);

  return { ok: true, row };
}
