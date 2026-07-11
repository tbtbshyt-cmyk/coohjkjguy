# Deployment Playbook — أبو بشار

> Three services, three deploys, all on free tiers (or ~$7/mo total for production).

---

## 1️⃣ Database — Supabase (Postgres)

### Create project
1. Sign up at https://supabase.com → **New project**
2. Region: pick closest to Yemen → **Singapore** (`ap-southeast-1`)
3. Database password: save securely
4. Wait 2 minutes for provisioning

### Get connection strings
- **Settings → Database → Connection string → URI**
- Copy both `DATABASE_URL` (pooled, for app) and `DIRECT_URL` (direct, for migrations)

```bash
# Add to backend/.env
DATABASE_URL=postgresql://postgres.xxxx:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://postgres.xxxx:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

### Enable extensions
- Settings → Database → Extensions → enable `pgcrypto` + `pg_trgm`

### Storage (for product images)
- **Storage → New bucket** → name: `abubishar-media` → Public
- Set CORS:
  ```json
  [{
    "AllowedOrigins": ["https://abu-bishar.com", "https://www.abu-bishar.com", "*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }]
  ```
- Upload your initial product images to `products/` folder

---

## 2️⃣ Backend — Render

### Push code to GitHub
```bash
cd architecture/backend
git init
git add .
git commit -m "Initial commit"
gh repo create abu-bishar-api --public --source=. --push
```

### Create Web Service on Render
1. https://dashboard.render.com → **New → Web Service**
2. Connect your GitHub repo
3. Settings:
   - **Runtime**: Node
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Plan**: Free (or Starter $7/mo for no cold-start)
   - **Region**: Singapore (ap-southeast-1)

4. **Environment variables** (add all from `.env.example`):
   ```
   NODE_ENV=production
   PORT=3000
   API_PREFIX=/api/v1/abecp
   DATABASE_URL=<from Supabase>
   DIRECT_URL=<from Supabase>
   JWT_SECRET=<openssl rand -hex 32>
   JWT_ACCESS_TTL=900
   JWT_REFRESH_TTL=2592000
   REDIS_URL=<from Upstash>
   CORS_ORIGINS=https://abu-bishar.com,https://www.abu-bishar.com
   STORAGE_BUCKET=abubishar-media
   STORAGE_PUBLIC_URL=https://<project>.supabase.co/storage/v1/object/public/abubishar-media
   ```

5. **Health check**: set to `/api/v1/abecp/health`

6. Click **Create Web Service**. First deploy takes ~5 min.

### Seed the database
Render → Shell tab:
```bash
npm run seed
```

### Custom domain
- Settings → Custom Domains → add `api.abu-bishar.com`
- Add CNAME in your DNS provider pointing to Render

---

## 3️⃣ Web — Vercel (recommended) or Render

### Push code
```bash
cd architecture/web
git init
git add .
git commit -m "Initial commit"
gh repo create abu-bishar-web --public --source=. --push
```

### Deploy to Vercel
1. https://vercel.com → **Add New Project** → Import repo
2. Settings:
   - **Framework**: Next.js (auto-detected)
   - **Build command**: `next build` (default)
   - **Output**: `.next` (default)
3. **Environment variables**:
   ```
   NEXT_PUBLIC_API_URL=https://api.abu-bishar.com
   NEXT_PUBLIC_CDN_URL=https://<project>.supabase.co/storage/v1/object/public/abubishar-media
   NEXT_PUBLIC_SITE_URL=https://abu-bishar.com
   ```
4. **Deploy** (takes ~2 min)

### Custom domain
- Project Settings → Domains → add `abu-bishar.com` + `www.abu-bishar.com`

---

## 4️⃣ Mobile — Flutter

### A. Build Android APK/AAB

#### Setup signing key (one-time)
```bash
cd mobile/android
keytool -genkey -v -keystore abubishar-upload.jks \
  -keyalg RSA -keysize 2048 -validity 10000 -alias abubishar
```

Create `mobile/android/key.properties`:
```
storePassword=<your-store-password>
keyPassword=<your-key-password>
keyAlias=abubishar
storeFile=../abubishar-upload.jks
```

Edit `mobile/android/app/build.gradle` to add signingConfigs.

#### Build release
```bash
cd mobile
flutter build apk --release --split-per-abi
# Outputs: build/app/outputs/flutter-apk/app-armeabi-v7a-release.apk (8 MB)
#          build/app/outputs/flutter-apk/app-arm64-v8a-release.apk (10 MB)

flutter build appbundle --release
# Outputs: build/app/outputs/bundle/release/app-release.aab
```

#### Upload to Google Play
1. https://play.google.com/console → create app
2. **Release → Production → Create release**
3. Upload `app-release.aab`
4. Fill store listing (Arabic + English)
5. Roll out

### B. Build iOS (requires macOS + Apple Developer account)

#### Setup
```bash
cd mobile/ios
pod install
```

Open `Runner.xcworkspace` in Xcode:
- Select **Runner** target → **Signing & Capabilities**
- Choose your Apple Developer team
- Set bundle id: `com.abubishar.app`

#### Build & upload
```bash
cd mobile
flutter build ios --release
# Then in Xcode: Product → Archive → Distribute App → App Store Connect
```

### C. Alternative distribution (no store)
For Yemen where app stores can be unreliable:
```bash
flutter build apk --release
# Host app-arm64-v8a-release.apk on your CDN
# Users install directly with "Install from unknown sources"
```

---

## 5️⃣ Redis (Optional but Recommended)

### Upstash (free 10k req/day)
1. https://upstash.com → New Redis database
2. Region: ap-southeast-1
3. Copy `REDIS_URL` to backend `.env`

---

## 6️⃣ CDN — Cloudflare (Optional, Free)

1. Add `abu-bishar.com` to Cloudflare
2. Update nameservers at your registrar
3. Enable:
   - **Auto Minify**: HTML, CSS, JS
   - **Brotli** compression
   - **HTTP/3**
   - **Browser Cache TTL**: 4 hours for static
   - **Page Rules**: Cache `/api/v1/abecp/settings/*` for 1 hour

---

## 7️⃣ Monitoring (Recommended)

### Sentry (free 5k events/mo)
```bash
# Backend
npm install @sentry/node
# Add to main.ts:
Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1 })

# Flutter
flutter pub add sentry_flutter
```

### Uptime monitoring (free)
- https://uptime.com → add `https://api.abu-bishar.com/api/v1/abecp/health`
- Get alerts on Telegram/email

---

## 8️⃣ CI/CD (GitHub Actions)

### Backend `.github/workflows/deploy.yml`
```yaml
name: Deploy Backend
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx prisma generate
      - run: npm run build
      - uses: render-actions/deploy@v1
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}
```

### Flutter `.github/workflows/build.yml`
```yaml
name: Build Flutter
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
      - run: flutter pub get
      - run: flutter analyze
      - run: flutter test
      - run: flutter build apk --release
      - uses: actions/upload-artifact@v4
        with:
          name: app-release
          path: build/app/outputs/flutter-apk/*.apk
```

---

## 💰 Cost Breakdown (Production)

| Service | Plan | Cost |
|---------|------|------|
| Supabase Postgres | Free | $0 |
| Supabase Storage | Free 1 GB | $0 |
| Render Backend | Free (cold start) or Starter | $0–7 |
| Vercel Web | Hobby (free) | $0 |
| Upstash Redis | Free 10k req/day | $0 |
| Cloudflare CDN | Free | $0 |
| Sentry | Free 5k events/mo | $0 |
| Google Play | $25 one-time | $25 |
| Apple Developer | $99/year | $99/yr |
| **Total** | | **~$25 first year, $7/mo after** |

---

## ✅ Post-Deploy Checklist

- [ ] Visit `https://api.abu-bishar.com/api/v1/abecp/health` → returns `status: ok`
- [ ] Visit `https://abu-bishar.com` → page loads, products visible
- [ ] Login to admin: `https://abu-bishar.com/admin/login`
- [ ] Create a test product → appears on home
- [ ] Test checkout flow end-to-end (use real Yemen phone)
- [ ] Test voucher application
- [ ] Test gift card creation + redemption
- [ ] Verify PDF invoice downloads
- [ ] Verify QR code scans correctly
- [ ] Check Flutter app launches without errors
- [ ] Check Flutter offline mode (turn off wifi → catalog still loads)
- [ ] Verify audit log records admin changes
- [ ] Check `https://abu-bishar.com/manifest.webmanifest` (PWA)
- [ ] Test Arabic RTL on mobile browser

---

## 🆘 Troubleshooting

| Issue | Fix |
|-------|-----|
| "ECONNREFUSED" to DB | Check `DATABASE_URL` + Supabase not paused |
| CORS error on web | Add web origin to `CORS_ORIGINS` env |
| JWT expired | Clear localStorage and log in again |
| Image 404 | Check Supabase Storage bucket is public |
| Flutter can't connect | Update `lib/core/network/api_config.dart` with LAN IP |
| Cold start 30s | Upgrade Render plan or use Railway ($5/mo) |