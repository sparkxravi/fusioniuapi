import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHash } from "node:crypto";

const EmailSchema = z.object({ email: z.string().trim().toLowerCase().email().max(255) });
const VerifySchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  code: z.string().regex(/^\d{6}$/),
  password: z.string().min(8).max(128),
});

function hashCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

export const requestSignupOtp = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => EmailSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendOtpEmail } = await import("@/lib/email.server");

    // Check if user already exists
    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const exists = list?.users?.some((u: any) => u.email?.toLowerCase() === data.email);
    if (exists) {
      return { ok: false as const, error: "An account with this email already exists. Please login." };
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const code_hash = hashCode(code);
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Replace any previous codes for this email
    await supabaseAdmin.from("otp_codes").delete().eq("email", data.email).eq("purpose", "signup");
    const { error } = await supabaseAdmin.from("otp_codes").insert({
      email: data.email, code_hash, purpose: "signup", expires_at,
    });
    if (error) {
      console.error("OTP insert failed", error);
      return { ok: false as const, error: `DB error: ${error.message}` };
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return { ok: false as const, error: "Email service not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD on Vercel." };
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { ok: false as const, error: "SUPABASE_SERVICE_ROLE_KEY missing on Vercel." };
    }

    try {
      await sendOtpEmail(data.email, code);
    } catch (e: any) {
      console.error("OTP send failed", e);
      return { ok: false as const, error: `Email send failed: ${e?.message ?? String(e)}` };
    }
    return { ok: true as const };
  });

export const verifyOtpAndCreateAccount = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => VerifySchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("otp_codes").select("*")
      .eq("email", data.email).eq("purpose", "signup")
      .order("created_at", { ascending: false }).limit(1);
    if (error || !rows || rows.length === 0) {
      return { ok: false as const, error: "No OTP requested. Please request a new code." };
    }
    const row = rows[0];
    if (new Date(row.expires_at).getTime() < Date.now()) {
      return { ok: false as const, error: "OTP expired. Please request a new one." };
    }
    if (row.attempts >= 5) {
      return { ok: false as const, error: "Too many attempts. Request a new code." };
    }
    if (row.code_hash !== hashCode(data.code)) {
      await supabaseAdmin.from("otp_codes").update({ attempts: row.attempts + 1 }).eq("id", row.id);
      return { ok: false as const, error: "Incorrect OTP." };
    }

    // Create the user (auto-confirmed)
    const { error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (createErr) {
      return { ok: false as const, error: createErr.message };
    }
    await supabaseAdmin.from("otp_codes").delete().eq("email", data.email).eq("purpose", "signup");
    return { ok: true as const };
  });
