# NextGen Computer World

Production catalogue and owner CMS for products, stock, images and customer enquiries.

## Commands

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run build
```

## Required environment variables

Copy `.env.example` to `.env.local` and provide the Supabase project values.

`SUPABASE_SECRET_KEY` is server-only. Never expose it in browser code or commit it to Git.

## Deployment checks

- Production dependency audit
- TypeScript
- ESLint
- Next.js production build
- Supabase migration
- Owner authentication
- Production smoke tests