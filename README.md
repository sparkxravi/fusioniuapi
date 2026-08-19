# fusioniuApi

**Next-gen FamPay payment infrastructure** — generate UPI QR codes and verify transactions in real time, with a clean REST API.

fusioniuApi lets you accept UPI payments and automatically confirm them by checking your Gmail inbox for FamPay payment notifications — no manual reconciliation, no polling a payment gateway dashboard. Point your app at two endpoints and you're done.

---

## ✨ Features

- **Instant QR generation** — turn any UPI ID into a scannable payment QR code
- **Real-time transaction verification** — confirms payments via Gmail IMAP, matching by UTR or transaction ID
- **API key authentication** — per-user keys with usage tracking and admin controls
- **Simple REST interface** — plain `GET` requests, JSON responses, works from cURL, Python, JavaScript, or a browser
- **Dashboard & admin panel** — manage keys, monitor activity, and control access from the UI

## 🏗️ Tech Stack

- [TanStack Start](https://tanstack.com/start) (React, file-based routing, SSR)
- [Supabase](https://supabase.com) (Postgres, Auth, Row-Level Security)
- Tailwind CSS + shadcn/ui
- Deployed on Vercel

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) (or Node.js)
- A [Supabase](https://supabase.com) project

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/sparkxravi/fusioniuapi.git
cd fusioniuapi

# 2. Install dependencies
bun install

# 3. Configure environment variables
cp .env.example .env
# then fill in your Supabase project URL, anon key, and service role key

# 4. Run the dev server
bun run dev
```

The app will be available at `http://localhost:3000`.

### Environment Variables

See [`.env.example`](./.env.example) for the full list. You'll need:

| Variable | Description |
| --- | --- |
| `SUPABASE_URL` / `VITE_SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` / `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key — **server-side only, never expose this to the client** |

> ⚠️ Never commit your `.env` file. Keep secrets in your hosting provider's environment variable settings (e.g. Vercel Project Settings → Environment Variables).

## 📡 API Reference

Full interactive docs are available at `/docs` once the app is running. Quick overview:

### Generate a QR code

```
GET /api/public/genqr?key=YOUR_API_KEY&upi=yourname@fam&amount=10&name=My%20Store
```

### Verify a payment

```
GET /api/public/check?key=YOUR_API_KEY&mail=you@gmail.com&apppass=APP_PASSWORD&utr=UTR_NUMBER&amount=10
```

Both endpoints require an API key, generated from your dashboard after signing up.

## 🔒 Security Notes

- API keys and secrets are never stored in the repo — they live in environment variables and Supabase's `api_keys` table, protected by Row-Level Security.
- Gmail credentials (App Passwords) are used only for a single IMAP request per verification call and are never persisted.

## 📄 License

This project is provided as-is. Add a license of your choice (MIT recommended for open-source projects) if you plan to accept contributions.
