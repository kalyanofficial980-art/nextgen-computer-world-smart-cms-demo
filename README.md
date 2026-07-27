# NextGen Computer World — Smart Catalogue CMS Demo

An advanced Kalyan Web Studio portfolio demo for the ₹15,000 Founder Launch Offer, with a regular KWS price of ₹25,000.

## Current Status
Phase 1 public website: complete.

Phase 2 Supabase CMS: planned and structurally prepared, but not connected yet.

## Technology
- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Node.js runtime through Next.js
- Vercel-ready
- Supabase-ready repository architecture

A separate Express server is intentionally not added. Next.js already provides server rendering, Route Handlers and server-side execution on Node.js. Adding Express only for marketing would increase complexity without helping this project.

## Local Setup

```powershell
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Quality Checks

```powershell
npm run typecheck
npm run lint
npm run build
```

## Deployment

Run:

```powershell
Set-ExecutionPolicy -Scope Process Bypass -Force
.\DEPLOY-GITHUB-VERCEL.ps1
```

## Contact Configuration
Edit:

```text
lib/site.ts
```

Current demo details:
- Phone and WhatsApp: +91 83285 71256
- Email: kalayanofficial980@gmail.com
- Location: Nellore City, Andhra Pradesh

## Product Data
Edit:

```text
lib/products.ts
```

In Phase 2, the product repository will move to Supabase.
