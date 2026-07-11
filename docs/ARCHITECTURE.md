# Architecture & Design Decisions — أبو بشار

## 🎯 Goals

1. **One backend, two clients** — Flutter (mobile) + Next.js (web) talk to the same NestJS API.
2. **Yemen-grade performance** — fast on 3G/4G, low data usage, instant image loads.
3. **RTL + Arabic by default** — including numbers, dates, plural rules.
4. **Auditable** — every privileged action is recorded with before/after.
5. **Deployable for ~$0** on Supabase + Render free tiers.

---

## 🏛 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENTS                                    │
│                                                                      │
│   ┌─────────────────────────┐         ┌──────────────────────────┐   │
│   │   Next.js 14 Web        │         │   Flutter Mobile          │  │
│   │   (App Router, RTL)     │         │   (Riverpod, Hive)        │  │
│   │                         │         │                            │  │
│   │  • TanStack Query       │         │  • Dio HTTP client         │  │
│   │  • Zustand state        │         │  • Riverpod state          │  │
│   │  • Tailwind + framer    │         │  • Hive local DB           │  │
│   │  • SSR + ISR + SSG      │         │  • cached_network_image    │  │
│   └──────────┬──────────────┘         └──────────┬─────────────────┘  │
│              │ HTTPS                               │ HTTPS           │
│              │ /api/v1/abecp/...                  │ /api/v1/abecp/...│
└──────────────┼─────────────────────────────────────┼─────────────────┘
               │                                     │
               ▼                                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     EDGE / CDN LAYER                                │
│   Cloudflare  ←  static assets, images (R2/Supabase Storage)        │
│   Rate limiting, WAF, Brotli, HTTP/3                               │
└─────────────────────────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    NESTJS BACKEND  (1× Render Web Service)          │
│                                                                      │
│   ┌────────────┐  ┌────────────┐  ┌─────────────┐  ┌──────────────┐ │
│   │ AuthModule │  │ProductsMod │  │ OrdersModule│  │   AiModule   │ │
│   └────────────┘  └────────────┘  └─────────────┘  └──────────────┘ │
│   ┌────────────┐  ┌────────────┐  ┌─────────────┐  ┌──────────────┐ │
│   │ LoyaltyMod │  │VouchersMod │  │ GiftCardsMod│  │ AffiliatesMod│ │
│   └────────────┘  └────────────┘  └─────────────┘  └──────────────┘ │
│                                                                      │
│   Guards (JWT/Roles)  •  Filters (GlobalException)                  │
│   Interceptors (Response)  •  Pipes (Validation/Zod)                │
│   Schedule (Cron)  •  EventEmitter (decoupled notifications)         │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ Prisma 5
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│              PostgreSQL  (Supabase — free 500MB tier)               │
│                                                                      │
│   35+ tables • Row Level Security enabled  •  pg_trgm search        │
│   Triggers: stock decrement, loyalty earn, order-number generator    │
└─────────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  Redis / Upstash  (free 10k req/day)                │
│   Cache hot products, sessions, rate-limit counters                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Data Flow Examples

### A. Customer browses products (Flutter)
```
Flutter (ProductListScreen)
  └─> Riverpod provider calls ProductsAPI.list(page=1, category=men)
       └─> Dio sends GET /api/v1/abecp/products?category=men&page=1
            └─> NestJS ProductsController.list
                 └─> ProductsService.list (Prisma query, includes images)
                      └─> PostgreSQL returns 20 rows + meta
            └─> ResponseInterceptor wraps as { data, meta }
       └─> Dio deserializes → Flutter caches to Hive box "products_cache"
  └─> UI renders ProductCard with shimmer placeholder + WebP image
       └─> Image streamed from CDN (Cloudflare cache)
```

### B. Customer checks out
```
Flutter (CheckoutScreen)
  └─> OrdersAPI.checkout({ customer, items, payment, voucherCode })
       └─> NestJS OrdersController.checkout
            └─> OrdersService.checkout (transactional)
                 ├─> Re-validate prices (server source of truth)
                 ├─> Apply voucher
                 ├─> Apply gift card (decrement balance)
                 ├─> Redeem loyalty points
                 ├─> Calculate affiliate commission
                 ├─> Generate order number (AB-2026-00042)
                 ├─> Decrement product stock
                 ├─> Earn loyalty points (10 points per 100 YER)
                 ├─> Write AuditLog
                 └─> Clear cart
            └─> Return { order, loyaltyEarned, invoiceUrl }
       └─> Flutter updates Hive cart, shows success modal
            └─> User taps "Download Invoice" → InvoiceDownloader
                 └─> GET /api/v1/abecp/admin/orders/:id/invoice.pdf
                      └─> Backend streams PDF (PDFKit + QRCode)
```

### C. Admin updates a product
```
Next.js (AdminDashboard → ProductForm)
  └─> AdminAPI.updateProduct(id, dto) with Bearer JWT
       └─> JwtAuthGuard verifies token
       └─> RolesGuard checks SUPER_ADMIN | MANAGER
       └─> ProductsService.adminUpdate
            ├─> Fetch "before" state
            ├─> Apply Prisma update
            ├─> AuditService.log({
            │     userId, action: 'UPDATE',
            │     resource: 'product', resourceId,
            │     beforeData, afterData,
            │     ipAddress, userAgent
            │   })
            └─> Return updated product
       └─> TanStack Query invalidates ['products'] cache
```

---

## 🔒 Security Model

| Layer | Mechanism |
|-------|-----------|
| Transport | TLS 1.3 via Cloudflare |
| Rate limit | `@nestjs/throttler` — 100/min public, 600/min admin |
| AuthN | JWT (15 min) + Refresh tokens (30 d), argon2 password hash |
| AuthZ | Role-based: SUPER_ADMIN > MANAGER > STAFF > VIEWER |
| Input | `class-validator` + `ValidationPipe(whitelist=true)` |
| Output | `helmet` headers (CSP, HSTS, X-Frame-Options) |
| Audit | Every privileged mutation logged with diff |
| DB | Row Level Security (future), no raw SQL |
| Secrets | `.env` (dev) → Render/Supabase env vars (prod) |

---

## 💾 Caching Strategy

### Backend
| What | Where | TTL |
|------|-------|-----|
| Featured products | Redis | 5 min |
| Currency rates | Redis | 1 hour |
| Public settings | Redis | 10 min |
| Per-user cart | DB (source of truth) + Redis snapshot | session |

### Flutter (Hive boxes)
| Box | Purpose |
|-----|---------|
| `catalog` | Last successful product list response |
| `product_detail_<id>` | Product detail pages |
| `banners` | Active banners |
| `cart_local` | Optimistic cart before server confirms |
| `wishlist` | Local mirror of remote wishlist |
| `user_session` | Auth tokens, theme, currency |

> All Hive data is encrypted with `HiveX` (AES-256) using a device-bound key.

### Next.js (TanStack Query)
| Key | staleTime | gcTime |
|-----|-----------|--------|
| `['products', filters]` | 60 s | 5 min |
| `['product', slug]` | 5 min | 30 min |
| `['cart']` | 0 (always fresh) | 1 min |
| `['settings', 'public']` | 10 min | 1 hour |
| `['banners']` | 5 min | 30 min |

---

## 🌍 RTL Strategy

- HTML: `<html lang="ar" dir="rtl">` (Next.js layout + Flutter `MaterialApp(locale: ar)`)
- Tailwind: use logical properties (`ms-4`, `me-4`, `start`, `end`)
- CSS Grid/Flex: default behavior respects `dir`
- Icons that imply direction (arrows): use `start` / `end` logic, never `left` / `right`
- Numbers: `Intl.NumberFormat('ar-EG')`
- Dates: `Intl.DateTimeFormat('ar-EG', { calendar: 'islamic-umalqura' })` available
- Flutter: `MaterialApp(locale: Locale('ar'))` + `Directionality(textDirection: TextDirection.rtl)` + `flutter_localizations`

---

## 📱 Flutter Performance Tricks for Yemen

| Trick | Why |
|-------|-----|
| `cached_network_image` | Re-uses downloaded images in disk cache |
| `flutter_image_compress` | Re-compresses images to < 100 KB before upload |
| `dio_cache_interceptor` | Auto-caches GET responses to disk |
| `Hive` instead of `sqflite` | 10× faster reads, pure Dart |
| `freezed` for models | Reduces model size 40% with codegen |
| `auto_route` code-gen | Faster routing than `go_router` reflection |
| `flutter_secure_storage` | Stores JWT in Android Keystore / iOS Keychain |
| AOT compile (`flutter build apk --release --split-per-abi`) | Smaller APKs (8 MB vs 25 MB) |
| `webp` images from server | 30% smaller than JPEG |
| Lazy-load `cached_network_image` with `placeholderBuilder` | Smooth scroll on weak networks |

---

## 🔄 Migrations

```bash
# Generate migration after schema change
cd backend
npx prisma migrate dev --name add_voucher_trigger

# Apply to production (Render / Supabase)
npx prisma migrate deploy
```

Migrations are committed to `backend/prisma/migrations/` and applied automatically on Render deploy via the build script:

```json
"build": "prisma generate && prisma migrate deploy && nest build"
```

---

## 🧪 Testing Strategy

| Layer | Tool | Coverage Target |
|-------|------|-----------------|
| Backend services | Jest + `@nestjs/testing` | > 80% |
| Backend e2e | Supertest | Critical paths |
| Flutter unit | `flutter_test` + Mockito | > 70% |
| Flutter widget | `flutter_test` | Key screens |
| Flutter integration | `integration_test` | Auth → Browse → Checkout |

---

## 📊 Observability

- **Logs**: `pino` → stdout → Render captures → can ship to Logtail/Datadog
- **Errors**: `Sentry` SDK on backend + Flutter (`sentry_flutter`)
- **Metrics**: `/health/ready` endpoint + Prometheus exporter (`@willsoto/nestjs-prometheus`)
- **Audit**: `AuditLog` table is queryable from admin dashboard

---

## 🛣 Roadmap

| Quarter | Milestone |
|---------|-----------|
| Q1 | Public site + admin dashboard |
| Q2 | Flutter MVP (customer app) |
| Q3 | Push notifications, WhatsApp order updates |
| Q4 | Multi-store (multi-tenant) + Flutter POS |
| Q5 | AI visual search v2 (CLIP embeddings) |
| Q6 | Mobile payment gateways (eFloos, Jaib) |