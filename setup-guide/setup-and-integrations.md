# MVP Setup Guide

## Quick start (no API keys needed)

The app works fully without any keys — YNAB, KOHO, and AI all have "demo" fallback modes.

```bash
cd the-app
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:8080 → tap **AI Planner** → build a basket → checkout.

---

## Enabling real integrations

### 1. Supabase (auth + cloud persistence)

1. Create a project at https://supabase.com
2. Copy **Project URL** and **anon public** key → paste into `.env`
3. Run the SQL schema below in **Supabase SQL Editor**:

```sql
-- Preferences
create table preferences (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade unique,
  data jsonb not null,
  updated_at timestamptz default now()
);
alter table preferences enable row level security;
create policy "Own prefs" on preferences for all using (auth.uid() = user_id);

-- Baskets
create table baskets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade unique,
  lines jsonb not null,
  subtotal numeric not null,
  savings numeric not null,
  budget numeric not null,
  strategy text not null,
  updated_at timestamptz default now()
);
alter table baskets enable row level security;
create policy "Own basket" on baskets for all using (auth.uid() = user_id);

-- Orders
create table orders (
  id uuid primary key,
  user_id uuid references auth.users(id) on delete cascade,
  basket_snapshot jsonb not null,
  total numeric not null,
  savings numeric not null,
  budget numeric not null,
  item_count int not null,
  junk_count int not null,
  healthy_swaps int not null,
  strategy text not null,
  ynab_transaction_id text,
  created_at timestamptz default now()
);
alter table orders enable row level security;
create policy "Own orders" on orders for all using (auth.uid() = user_id);
```

### 2. OpenAI

1. Get a key at https://platform.openai.com/api-keys
2. Add `VITE_OPENAI_API_KEY=sk-...` to `.env`
3. The AI Planner badge will show **AI** and use GPT-4o-mini for basket generation

### 3. YNAB

1. Register an OAuth app at https://app.ynab.com/settings/developer
2. Set redirect URI to `http://localhost:8080/account` (dev)
3. Add `VITE_YNAB_CLIENT_ID=...` to `.env`
4. The token exchange (`/api/ynab/exchange`) needs a Supabase Edge Function that holds your `YNAB_CLIENT_SECRET` server-side

**Edge function stub** (`supabase/functions/ynab-exchange/index.ts`):
```ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
serve(async (req) => {
  const { code } = await req.json();
  const res = await fetch("https://app.ynab.com/oauth/token", {
    method: "POST",
    body: new URLSearchParams({
      client_id: Deno.env.get("YNAB_CLIENT_ID")!,
      client_secret: Deno.env.get("YNAB_CLIENT_SECRET")!,
      redirect_uri: Deno.env.get("YNAB_REDIRECT_URI")!,
      grant_type: "authorization_code",
      code,
    }),
  });
  return new Response(await res.text(), { headers: { "content-type": "application/json" } });
});
```

### 4. Plaid (KOHO balance)

1. Create a Plaid app at https://dashboard.plaid.com (start in Sandbox)
2. Add `VITE_PLAID_CLIENT_ID` and `VITE_PLAID_ENV=sandbox` to `.env`
3. The link token creation and access token exchange need Supabase Edge Functions (to keep `PLAID_SECRET` server-side)
4. In Sandbox, use credentials: `user_good` / `pass_good` to simulate KOHO

**Edge function stubs** (`supabase/functions/plaid-*/index.ts`) follow the same pattern — call Plaid API with secret from `Deno.env`, return result.

---

## Deployment checklist

- [ ] Add all env vars to your hosting provider (Vercel/Netlify)
- [ ] Update YNAB redirect URI to production URL
- [ ] Switch `VITE_PLAID_ENV` to `production`
- [ ] Deploy Supabase edge functions
- [ ] Run `npm run build` and verify no TypeScript errors
