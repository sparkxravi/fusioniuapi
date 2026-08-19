<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:6366f1,100:8b5cf6&height=200&section=header&text=fusioniuApi&fontSize=60&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Next-Gen%20FamPay%20Payment%20Infrastructure&descAlignY=58&descSize=18" width="100%"/>

<a href="https://fusioniuapi.vercel.app">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&duration=3000&pause=1000&color=8B5CF6&center=true&vCenter=true&width=600&lines=Generate+UPI+QR+Codes+Instantly;Verify+Payments+in+Real-Time;Built+with+TanStack+Start+%2B+Supabase" alt="Typing SVG" />
</a>

<br/>

[![Live](https://img.shields.io/badge/Live-fusioniuapi.vercel.app-6366f1?style=for-the-badge&logo=vercel&logoColor=white)](https://fusioniuapi.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-8b5cf6?style=for-the-badge)](#-license)
[![API Version](https://img.shields.io/badge/API-v2.0-22c55e?style=for-the-badge)](#-api-reference)

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)

</div>

---

## 🌐 Overview

**fusioniuApi** lets you accept UPI payments and verify them automatically — no manual reconciliation, no gateway dashboards, no polling. Generate a QR code, someone pays via FamPay, and fusioniuApi confirms it in real time by reading the payment confirmation straight from your Gmail inbox.

Two endpoints. Plain `GET` requests. JSON responses. That's it.

<div align="center">
<img src="https://skillicons.dev/icons?i=ts,react,tailwind,supabase,vercel,nodejs&theme=dark" />
</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Security Notes](#-security-notes)
- [License](#-license)

---

## ✨ Features

| | |
|---|---|
| ⚡ **Instant QR Generation** | Turn any UPI ID into a scannable payment QR code in milliseconds |
| ✅ **Real-Time Verification** | Confirms payments via Gmail IMAP, matched by UTR or transaction ID |
| 🔑 **API Key Auth** | Per-user keys with usage tracking, activation toggle, and admin override |
| 🧩 **Simple REST Interface** | Works from cURL, Python, JavaScript, or a plain browser tab |
| 📊 **Dashboard & Admin Panel** | Manage keys, monitor activity, and control access from the UI |
| 🔒 **Row-Level Security** | Every table protected by Supabase RLS — no unauthorized reads or writes |

---

## 🏗️ Tech Stack

- **[TanStack Start](https://tanstack.com/start)** — React framework with file-based routing & SSR
- **[Supabase](https://supabase.com)** — Postgres, Auth, and Row-Level Security
- **Tailwind CSS + shadcn/ui** — styling and components
- **Vercel** — hosting & serverless functions

---

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
# fill in your Supabase project URL, anon key, and service role key

# 4. Run the dev server
bun run dev
```

App runs at `http://localhost:3000` 🎉

---

## 🔐 Environment Variables

See [`.env.example`](./.env.example) for the full list.

| Variable | Description |
|---|---|
| `SUPABASE_URL` / `VITE_SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` / `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key — **server-side only** |

> ⚠️ **Never commit `.env`.** Keep secrets in your hosting provider's environment settings (Vercel → Project Settings → Environment Variables).

---

## 📡 API Reference

Full interactive docs live at [`/docs`](https://fusioniuapi.vercel.app/docs) once the app is running.

### Generate a QR code

```
GET /api/public/genqr?key=YOUR_API_KEY&upi=yourname@fam&amount=10&name=My%20Store
```

<details>
<summary>Example response</summary>

```json
{
  "status": "success",
  "data": {
    "qr_image": "data:image/png;base64,..."
  }
}
```
</details>

### Verify a payment

```
GET /api/public/check?key=YOUR_API_KEY&mail=you@gmail.com&apppass=APP_PASSWORD&utr=UTR_NUMBER&amount=10
```

<details>
<summary>Example response</summary>

```json
{
  "status": "success",
  "data": {
    "sender_name": "John Doe",
    "amount": 10,
    "verified_at": "19-08-2026 14:32:10"
  }
}
```
</details>

Both endpoints require an API key, generated from your dashboard after signing up.

---

## 🔒 Security Notes

- API keys and secrets are never stored in the repo — they live in environment variables and Supabase's `api_keys` table, protected by Row-Level Security.
- Gmail credentials (App Passwords) are used only for a single IMAP request per verification call and are never persisted.

---

## 📄 License

This project is provided as-is under the MIT License.

<div align="center">
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:8b5cf6,100:6366f1&height=100&section=footer" width="100%"/>
</div>
