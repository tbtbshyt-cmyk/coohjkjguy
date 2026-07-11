# 🎛 Admin Dashboard Backend — أبو بشار

NestJS 10 backend for أبو بشار, exposing 68+ REST API endpoints under `/api/v1/abecp/...`.

## Stack
- **NestJS 10** (TypeScript)
- **Prisma 5** ORM
- **PostgreSQL** (Supabase compatible)
- **JWT** auth + refresh tokens (argon2)
- **Redis** cache (Upstash compatible)
- **PDFKit** + **QRCode** for invoices
- **Sharp** for image processing
- **class-validator** DTOs
- **pino** structured logging
- **Swagger** auto-docs at `/docs`

## Develop
```bash
npm install
cp .env.example .env       # Set DATABASE_URL
npx prisma migrate dev
npx prisma db seed
npm run start:dev          # http://localhost:3000
# Swagger UI: http://localhost:3000/docs
```

## API Endpoints
See `../shared-core/api-contracts/API.md` for full contract.

## Quick Examples
```bash
# Admin login
curl -X POST http://localhost:3000/api/v1/abecp/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tbashyalo566@gmail.com","password":"bshy 776430"}'

# List products
curl http://localhost:3000/api/v1/abecp/products?limit=10

# Customer checkout
curl -X POST http://localhost:3000/api/v1/abecp/orders/checkout \
  -H "Content-Type: application/json" \
  -d '{"customer":{"name":"أحمد","phone":"777111222","city":"عتق","address":"شارع الزهراء"},"paymentMethod":"COD"}'
```

## Deploy
- **Render.com:** auto-import using `render.yaml`
- **Fly.io:** `flyctl deploy`
- **Docker:** `docker build -t abu-bishar-api .`
- **Railway:** `railway up`
