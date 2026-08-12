# HRMS Employee Self-Service Portal

Multi-tenant HRMS MVP built with Next.js 15, Supabase (Auth + Postgres + Storage), and Prisma.

## Features (MVP)

- Company self-serve enrollment (`/enroll`)
- Shareable join links (`/join/[token]`) — copy from **Team** settings
- Supabase Auth login + forgot password
- Tenant-scoped Profile, Leave (apply + approve/reject), Documents (file uploads)
- Role management for Admin/HR

## Setup

1. Copy [`.env.example`](.env.example) to `.env.local` and fill values from your Supabase project.
2. Ensure Auth Email provider is enabled (confirm email can be off for local MVP).
3. Set Auth Site URL to `http://localhost:3000` and add redirect `http://localhost:3000/**`.
4. Create a private Storage bucket named `documents`.
5. Install and migrate:

```bash
npm install
npx prisma migrate deploy
npm run dev
```

6. Open http://localhost:3000 — enroll a company, then use **Team** to copy the join link.

## Env vars

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret server key (never expose to browser) |
| `DATABASE_URL` | Pooled Postgres URI |
| `DIRECT_URL` | Direct Postgres URI (migrations) |
| `NEXT_PUBLIC_APP_URL` | App origin for join links (`http://localhost:3000`) |

## Deploy (Vercel)

1. Import the GitHub repo in Vercel.
2. Add the same env vars (set `NEXT_PUBLIC_APP_URL` to your Vercel URL).
3. Update Supabase Auth Site URL + redirect URLs to the production domain.
4. Deploy and run the isolation test: two companies, join links, leave, documents.

## Notes

Other modules (payroll, exit, learning, appraisal, newsletter, help desk) remain demo/local for now.
