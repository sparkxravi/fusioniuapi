import nodemailer from "nodemailer";

function makeTransport() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) throw new Error("Gmail credentials not configured");
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });
}

export async function sendOtpEmail(to: string, code: string) {
  const transport = makeTransport();
  const html = `
  <div style="font-family:Inter,Arial,sans-serif;background:#0b0f1f;padding:40px;color:#e6ecff">
    <div style="max-width:520px;margin:0 auto;background:linear-gradient(145deg,#141a33,#0d1226);border:1px solid #2952ff44;border-radius:18px;padding:36px;box-shadow:0 20px 60px #0008">
      <div style="text-align:center;margin-bottom:24px">
        <h1 style="margin:0;font-size:28px;color:#5b8bff;letter-spacing:1px">fusioniuApi</h1>
        <p style="margin:6px 0 0;color:#8aa0d6;font-size:13px">Next-generation payment infrastructure</p>
      </div>
      <h2 style="font-size:18px;margin:0 0 12px">Your verification code</h2>
      <p style="color:#a8b6dc;font-size:14px;line-height:1.6">Use the code below to verify your email and finish creating your fusioniuApi account. It expires in 10 minutes.</p>
      <div style="margin:28px 0;padding:24px;background:#0a1024;border:1px solid #2952ff66;border-radius:14px;text-align:center">
        <div style="font-family:'JetBrains Mono',monospace;font-size:38px;letter-spacing:14px;color:#7ea8ff;font-weight:700">${code}</div>
      </div>
      <p style="color:#6e7fa8;font-size:12px;margin:0">If you didn't request this, ignore this email. Never share this code with anyone.</p>
      <hr style="border:none;border-top:1px solid #1f2747;margin:28px 0"/>
      <p style="color:#54608a;font-size:11px;text-align:center;margin:0">fusioniuApi · Developer: Spark (@btwspark)</p>
    </div>
  </div>`;
  await transport.sendMail({
    from: `"fusioniuApi" <${process.env.GMAIL_USER}>`,
    to,
    subject: `Your fusioniuApi verification code: ${code}`,
    html,
    text: `Your fusioniuApi verification code is ${code}. It expires in 10 minutes.`,
  });
}
