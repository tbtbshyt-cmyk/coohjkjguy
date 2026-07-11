# 🔗 Shared Core

Resources used by all three clients (web, mobile, admin).

## Contents
- `schema/prisma-schema.prisma` — Database schema (35 tables)
- `schema/seed.ts` — Initial data seeding
- `api-contracts/API.md` — REST API contract (68 endpoints)
- `types/` — Shared TypeScript + Dart types

## Why centralize
- Single source of truth for data model
- Backend / mobile / web always agree on field names
- Easy to regenerate models for Dart (`freezed`) and TS

## For the Mobile team
After updating the Prisma schema:
```bash
# Back-end team runs:
cd admin-dashboard/api
npx prisma migrate dev --name describe_change

# Mobile team regenerates Dart models:
cd mobile-app
dart run build_runner build --delete-conflicting-outputs
```

## For the Web team
```bash
# Generate TypeScript types from schema
cd web-frontend
# (optional) bunx prisma generate
```
