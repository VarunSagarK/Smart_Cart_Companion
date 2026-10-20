# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (Vite)
npm run build        # Production build
npm run build:dev    # Development build
npm run lint         # ESLint
npm run preview      # Preview production build locally
npm run test         # Run tests once (Vitest)
npm run test:watch   # Run tests in watch mode
```

To run a single test file:
```bash
npx vitest run src/path/to/file.test.ts
```

## Architecture

React 18 + TypeScript SPA — an AI-powered grocery shopping assistant prototyping a Walmart integration. Built with Vite, Tailwind CSS, shadcn/ui, and React Router v6.

### State Management

All app state lives in `src/hooks/useDemoStore.ts`. localStorage is the primary persistence layer (instant, offline-capable). When a Supabase session exists, changes are also synced asynchronously to the DB — fire-and-forget, so the UI never stalls on network. The hook exposes `cartCount` and `cartTotal` which drive all dynamic badges.

### Core Domain Logic

- **`src/lib/types.ts`** — All shared TypeScript types: `Preferences`, `Basket`, `CatalogItem`, `BasketStrategy`, `DietId`, `FoodTypeId`, etc. Start here to understand the domain model.
- **`src/lib/budgetEngine.ts`** — The main basket algorithm. `buildAllStrategies()` ranks the mock catalog against user preferences using 5 strategies: `lowest-cost`, `healthiest`, `bulk-saver`, `family`, `brand`.
- **`src/lib/aiPlanner.ts`** — OpenAI integration. `generateAIBasket()` calls GPT-4o-mini with the catalog + preferences and returns selected item IDs + a strategy + explanation. Gracefully falls back to local `budgetEngine` if `VITE_OPENAI_API_KEY` is not set.
- **`src/lib/ynab.ts`** — YNAB API: OAuth URL builder, token exchange (proxied through backend), budget/category fetching, transaction creation. `syncOrderToYnab()` posts a completed order back as a transaction.
- **`src/lib/plaid.ts`** — Plaid API: link token creation, public token exchange, account balance fetching. `findKohoAccount()` identifies the KOHO Visa from a list of Plaid accounts. All `access_token` operations go through backend proxies — never exposed to the browser.
- **`src/lib/supabase.ts`** — Supabase client + DB row types (`DbProfile`, `DbBasket`, `DbOrder`, `DbPreferences`).
- **`src/lib/dashboardEngine.ts`** — `buildDashboard()` computes spend analytics from purchase history.
- **`src/lib/mockCatalog.ts`** — ~60 mock Walmart products. The data layer until a real API is connected.

### Integrations

- **YNAB**: `src/hooks/useYnab.ts` manages connection state, handles the OAuth `?code=` callback on `/account`, loads grocery category balance, and exposes `syncSpend()` for post-checkout sync. Token exchange must go through a Supabase Edge Function (see `../setup-guide/setup-and-integrations.md`).
- **KOHO/Plaid**: `src/hooks/usePlaid.ts` manages Plaid Link flow and surfaces a `KohoBalance` object. Real Plaid calls go through backend proxies; `mockConnect()` provides a demo mode.
- **OpenAI**: Called directly from the browser via `dangerouslyAllowBrowser: true` for MVP simplicity. Move to a server-side proxy before production to protect the API key.
- **Supabase Auth**: `src/contexts/AuthContext.tsx` wraps the app with a session context. `useAuth()` hook provides `signIn`, `signUp`, `signOut`.

All integrations degrade gracefully — the app is fully functional in demo mode without any API keys.

### Routing

Defined in `src/App.tsx` with React Router v6. Pages in `src/pages/`:
- `/` — Home dashboard
- `/ai` — AI Grocery Planner (main MVP feature)
- `/results` — AI basket results with strategy/filter chips
- `/basket` — Shopping cart
- `/checkout` — Full checkout: order review → KOHO balance check → YNAB budget impact → place order → confirmation + YNAB sync
- `/wellness` — Spending analytics dashboard
- `/my-items` — Saved/wishlisted items
- `/search` — Product search
- `/account` — User account + YNAB OAuth callback handler

### UI Components

shadcn/ui (Radix UI + Tailwind) — component source in `src/components/ui/`. `PhoneFrame` wraps pages in a mobile mockup for demo. `BottomTabs` shows a live cart badge (item count + spend total). `WalmartHeader` also shows cart count + spend.

### Path Alias

`@/` maps to `src/` (configured in `vite.config.ts` and `tsconfig.app.json`).

### Environment Variables

See `.env.example` for all keys. See `../setup-guide/setup-and-integrations.md` for step-by-step setup including Supabase SQL schema and edge function stubs for YNAB + Plaid token exchange.
