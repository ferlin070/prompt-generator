# Prompt Generator (PromptBiz Pro)

Aplikasi web penjana prompt AI untuk perniagaan Malaysia. Menjana, menyimpan dan mengurus prompt perniagaan, dengan pengesahan pengguna, pengurusan langganan dan ciri affiliate.

## Overview

- **Frontend:** HTML, CSS, Vanilla JS (tiada framework)
- **Backend:** Node.js API (`api/` + `lib/`) — Postgres (`pg`) + JWT (`jsonwebtoken`) + `bcryptjs`
- **Database:** PostgreSQL
- **Deployment:** Vercel (serverless) atau **server Express lokal** (`server.js`)
- **Payment:** Bayarcash (sandbox by default)

> Nota: Aplikasi ini asalnya guna Supabase, kemudian ditukar ke Vercel Postgres + JWT. Kini menyokong kedua-dua deploy Vercel (serverless) dan deploy lokal (Express + mana-mana Postgres).

---

## Project Structure

```
root/
│
├── admin.html              # Admin dashboard (HTML)
├── affiliate.html          # Affiliate dashboard (HTML)
├── dashboard.html          # Main user dashboard (HTML)
├── generator.html          # Prompt generator UI (HTML)
├── image-generator.html    # Image generator UI (HTML)
├── index.html              # Landing page (HTML)
├── login.html              # Login & registration (HTML)
├── pricing.html            # Pricing & plans (HTML)
├── register.html           # Registration (HTML)
├── saved-prompts.html      # Saved prompts UI (HTML)
│
├── api/                    # Backend endpoints (Web Fetch API — Vercel serverless)
│   ├── auth.js             # Register/login/profile (JWT + bcrypt)
│   ├── prompts.js          # CRUD prompt tersimpan
│   ├── admin.js            # Admin (stats, users, subs, promos, withdrawals)
│   ├── affiliate.js        # Affiliate (stats, click, code, withdrawal)
│   ├── payment.js          # Bayarcash payment
│   └── util.js             # validate-promo, setup-db, subscription
│
├── lib/
│   ├── db.js               # Pool pg (SSL optional via POSTGRES_SSL)
│   ├── auth.js             # JWT sign/verify + json helper
│   └── schema.sql          # Skema DB (profiles, prompts, subscriptions, dll.)
│
├── js/                     # Logik frontend (auth, generator, storage, subscription, affiliate, dll.)
├── css/ & styles/          # Stylesheet
├── server.js               # Server Express untuk deploy lokal (serve static + mount /api/*)
├── package.json            # Dependencies (pg, jsonwebtoken, bcryptjs, dotenv, express)
├── vercel.json             # Vercel deployment config
└── .gitignore              # Git ignore rules
```

---

## Key Technologies

| Lapisan | Teknologi |
|---------|-----------|
| Frontend | HTML, CSS, Vanilla JS |
| Backend | Node.js (`pg`, `jsonwebtoken`, `bcryptjs`) |
| Auth | JWT (sendiri) + bcrypt password hash |
| Database | PostgreSQL |
| Payment | Bayarcash (sandbox/default) |
| Deploy | Vercel (serverless) **atau** Express lokal (`server.js`) |

---

## Environment Variables

Salin `.env.example` ke `.env` dan isi nilai sebenar.

| Var | Fungsi |
|-----|--------|
| `POSTGRES_URL` | Connection string Postgres (cth. `postgres://user:pass@host:5432/db`) |
| `POSTGRES_SSL` | `true` untuk sambungan SSL (rejectUnauthorized=false); kosong untuk local |
| `JWT_SECRET` | Secret JWT (min 32 aksara, jana rawak) |
| `BAYARCASH_API_TOKEN` | Token API Bayarcash |
| `BAYARCASH_API_SECRET_KEY` | Secret key webhook Bayarcash |
| `BAYARCASH_PORTAL_KEY` | Portal key Bayarcash |
| `BAYARCASH_SANDBOX` | `true` untuk sandbox |
| `PORT` | Port server lokal (default 3000) |

---

## Deploy ke Vercel

1. Fork & clone repo.
2. Provision Vercel Postgres dan tetapkan `POSTGRES_URL`.
3. Tetapkan `JWT_SECRET` dan env Bayarcash di dashboard Vercel.
4. Jalankan skema DB (sekali): `POST /api/util` dengan body `{ "type": "setup-db" }`.
5. Deploy — `api/` berfungsi sebagai serverless functions.

## Deploy Lokal (Express)

```bash
npm install
cp .env.example .env   # isi POSTGRES_URL, JWT_SECRET, dll.
node server.js          # serve static HTML + API pada :3000
```

`server.js` menukar handler `api/*` (Web Fetch API) kepada Express dan menyajikan fail HTML statik. Sesuai untuk mana-mana Postgres (termasuk self-hosted Supabase).

Contoh dengan pm2:

```bash
npm install -g pm2
pm2 start server.js --name prompt-generator
pm2 save && pm2 startup systemd
```

---

## Skema Database

`lib/schema.sql` mengandungi 7 jadual:

`profiles` · `prompts` · `subscriptions` · `promo_codes` · `affiliate_earnings` · `affiliate_clicks` · `withdrawals`

Untuk set-up manual, jalankan:

```bash
psql "$POSTGRES_URL" -f lib/schema.sql
```

---

## API Endpoints

| Endpoint | Fungsi |
|----------|--------|
| `POST /api/auth` | Register & login |
| `GET/PUT /api/auth` | Profil semasa (Bearer JWT) |
| `GET/POST/PUT/DELETE /api/prompts` | CRUD prompt |
| `GET/POST/PUT /api/admin` | Admin panel |
| `GET/POST /api/affiliate` | Affiliate |
| `POST /api/payment` | Bayarcash payment |
| `GET/POST /api/util` | validate-promo, setup-db, subscription |

---

## How to Contribute

1. Fork & clone repo.
2. `npm install`.
3. Konfigurasi `.env` (rujuk bahagian Environment Variables).
4. Edit HTML/JS/API seperlunya.
5. PR: ikut style `js/utils.js`, commit message jelas, huraikan perubahan.

## Best Practices

- **Modular JS:** setiap feature dalam fail sendiri bawah `js/`.
- **Auth:** JWT bearer token di `localStorage` (key `pgp_token`).
- **UI:** logik UI dikongsi dalam `js/utils.js`.
- **Docs:** kemaskini README + komen kod.

## License

MIT
