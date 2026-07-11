# 🌐 Web Frontend — أبو بشار Storefront

Next.js 14 storefront for أبو بشار.

## Stack
- **Next.js 14** (App Router)
- **TypeScript** strict
- **Tailwind CSS 3** with custom gold/ink theme
- **TanStack Query** for data fetching
- **Zustand** for client state
- **Axios** with auto-refresh JWT
- **PWA** with service worker
- **Arabic RTL** as default locale

## Develop
```bash
npm install
cp .env.example .env.local
npm run dev          # http://localhost:3001
```

## Build
```bash
npm run build        # outputs to ./out (static export)
```

## Deploy
- **Vercel:** just import the repo → auto-detects Next.js
- **Netlify:** auto-detects `netlify.toml`
- **Custom:** any static host serves `out/`

Config files:
- `vercel.json` — Vercel settings
- `netlify.toml` — Netlify settings
- `next.config.js` — Image domains + API proxy
