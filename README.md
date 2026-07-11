# 🏪 أبو بشار — Multi-Platform Monorepo

> E-Commerce متكامل لـ **أبو بشار** (شبوة/عتق، اليمن) — Backend + Web + Mobile
> مع 35 ميزة متقدمة موزّعة على 4 منصات منفصلة لكن متّصلة عبر API موحد.

## 📁 Repository Structure

```
/web-frontend         ← Next.js 14 storefront (RTL, TypeScript, Tailwind)
/mobile-app           ← Flutter 3 (Dart, Riverpod, Hive offline cache)
/admin-dashboard      ← NestJS 10 admin API server (Prisma + PostgreSQL)
   └─ /api            (NestJS backend)
/shared-core          ← Reusable schemas + API contracts + types
   ├─ /schema         (Prisma schema + seed)
   ├─ /api-contracts  (REST contract docs)
   └─ /types          (shared TypeScript/Dart types)
```

## 🚀 Quick Start

```bash
# 1) Install all
./install.sh

# 2) Local dev (DB + API + Web)
docker compose up

# 3) Or run individually:
cd admin-dashboard/api && npm run start:dev    # http://localhost:3000
cd web-frontend && npm run dev                  # http://localhost:3001
cd mobile-app && flutter run
```

## 🔐 Default Admin Credentials

| Field | Value |
|-------|-------|
| Email | `tbashyalo566@gmail.com` |
| Password | `bshy 776430` |
| Role | `SUPER_ADMIN` |

## 🌐 Deployment

- **Web (Next.js):** Vercel / Netlify
- **Backend (NestJS):** Render / Fly.io / Railway
- **Database:** Supabase (free tier)
- **Storage:** Supabase Storage / Cloudflare R2
- **CI/CD:** GitHub Actions (`.github/workflows/`)

See `docs/DEPLOYMENT.md` for full guides.

## 📦 All 35 Features

| # | Feature | Backend | Web | Mobile |
|---|---------|---------|-----|--------|
| 1 | AI Sales Assistant | ✅ | ✅ | ✅ |
| 2 | AI Size Calculator | ✅ | ✅ | ✅ |
| 3 | Dynamic Pricing | ✅ | ✅ | ✅ |
| 4 | PDF Invoice + QR | ✅ | ✅ | ✅ |
| 5 | AI Recommendations | ✅ | ✅ | ✅ |
| 6 | Visual Search (pHash) | ✅ | ⏳ | ⏳ |
| 7 | Predictive Inventory | ✅ | ✅ | ✅ |
| 8 | Search Log Summarizer | ✅ | ✅ | ✅ |
| 9 | Ad Copy Generator | ✅ | ✅ | ✅ |
| 10 | WebP Compression | ✅ | ✅ | ✅ |
| 11 | CDN Integration | ✅ | ✅ | ✅ |
| 12 | Infinite Scroll | — | ✅ | ✅ |
| 13 | Quick-Add Modal | ✅ | ✅ | ✅ |
| 14 | PWA Install Prompt | — | ✅ | ⏳ |
| 15 | Order Archive | ✅ | ✅ | ✅ |
| 16 | Guest Checkout | ✅ | ✅ | ✅ |
| 17 | Wishlist + Price-Drop | ✅ | ✅ | ✅ |
| 18 | Gift Cards | ✅ | ✅ | ✅ |
| 19 | Post-Purchase Upsell | ✅ | ✅ | ✅ |
| 20 | Abandoned Cart Voucher | ✅ | ✅ | ✅ |
| 21 | Social Proof Popups | ✅ | ✅ | ⏳ |
| 22 | Affiliate Tracker | ✅ | ✅ | ✅ |
| 23 | Group Buying | ✅ | ✅ | ✅ |
| 24 | Loyalty Points | ✅ | ✅ | ✅ |
| 25 | Product Bundles | ✅ | ✅ | ✅ |
| 26 | Countdown Timers | ✅ | ✅ | ✅ |
| 27 | Conditional Vouchers | ✅ | ✅ | ✅ |
| 28 | Freebie Checkout | ✅ | ✅ | ✅ |
| 29 | Exit-Intent Popup | ✅ | ✅ | ⏳ |
| 30 | Master Admin (5-tap) | — | ✅ | ✅ |
| 31 | Currency Pegging | ✅ | ✅ | ✅ |
| 32 | CSV Bulk Import | ✅ | ✅ | ✅ |
| 33 | Dark/Light Theme | — | ✅ | ✅ |
| 34 | Banner Customizer | ✅ | ✅ | ✅ |
| 35 | Employee Audit Log | ✅ | ✅ | ✅ |

## 📜 License

UNLICENSED — proprietary to أبو بشار
