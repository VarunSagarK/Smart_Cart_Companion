# Walmart AI Grocery Budget Assistant — MVP Plan

A mobile-first, Walmart-inspired demo app that takes a grocery budget, builds an AI-optimized basket from mocked deals, hands off to a (simulated) checkout, and shows a simple post-purchase wellness dashboard. Single demo user, fully mocked data, modular code so real integrations can be swapped in later.

## What we're building (core flow)

```text
Home  →  Set Budget  →  AI Optimized Basket  →  Checkout Handoff  →  Dashboard
```

Five screens, one demo user, persistent state via localStorage so the dashboard reflects the user's last shop.

## Screens

1. **Home / AI tab** — Walmart-style header (blue bar, spark-yellow accent), greeting, "Plan this week's groceries" CTA, quick stats from last shop.
2. **Set Budget** — Weekly budget input, household size, dietary preferences (chips: vegetarian, low-sugar, gluten-free, none), "Avoid junk food" toggle.
3. **AI Optimized Basket** — Generated list of items grouped by category, each row shows item, price, deal badge, and a "swap" action. Footer shows total vs. budget with a progress bar. "Proceed to Walmart Checkout" button.
4. **Checkout Handoff** — Confirmation screen simulating handoff to Walmart cart ("Opening Walmart…"), records the purchase to local history, routes to dashboard.
5. **Dashboard** — Simple stacked cards only (no charts):
   - Budget Used / Remaining
   - Monthly Savings
   - Smart Tip of the Month
   - Projected Next Month Savings
   *(Junk reduction & healthier swaps cards are stubbed as "coming soon" — out of scope for this pass.)*

## Mocked data & "engines"

All in `src/lib/`, pure TypeScript modules so they can later be swapped for API calls:

- `mockCatalog.ts` — ~40 grocery items across categories (produce, dairy, pantry, snacks, beverages) with price, unit, on-sale flag, healthScore.
- `mockDeals.ts` — Flipp-style deals referencing catalog items.
- `budgetEngine.ts` — Given budget + preferences, selects items to fill a balanced basket under budget, prioritizing on-sale and higher healthScore.
- `savingsEngine.ts` — Computes savings vs. non-sale prices.
- `dashboardEngine.ts` — Aggregates purchase history into the dashboard cards.

These have clean function signatures (e.g. `optimizeBasket(budget, prefs, catalog, deals): Basket`) so a real Flipp/Walmart catalog can drop in later.

## Persistence

Lovable Cloud is overkill for demo mode. We'll use `localStorage` via a small `useDemoStore` hook for: budget, preferences, current basket, purchase history. If you later want real accounts, we swap this hook for Supabase queries without touching screens.

## Design

- Walmart-inspired: primary `#0071dc` (blue), accent `#ffc220` (spark yellow), white surfaces, dark text.
- Mobile-first phone-frame layout centered on desktop so it looks like a real app preview.
- Tailwind + shadcn components (Card, Button, Input, Badge, Progress, Tabs).
- Bottom tab bar: Home · AI (active) · Cart · Account.

## Out of scope (intentionally deferred)

- Real Flipp / YNAB / Mint / Walmart APIs
- User auth & multi-user accounts
- Junk-food detection engine + healthier-swap engine
- Real backend / database / edge functions
- Charts of any kind

These are wired as clear extension points in code (commented stubs + typed interfaces) so a follow-up build can plug them in.

## File structure

```text
src/
  pages/
    Index.tsx              # Home
    Budget.tsx
    Basket.tsx
    Checkout.tsx
    Dashboard.tsx
  components/
    PhoneFrame.tsx
    WalmartHeader.tsx
    BottomTabs.tsx
    BasketItemRow.tsx
    StatCard.tsx
  lib/
    mockCatalog.ts
    mockDeals.ts
    budgetEngine.ts
    savingsEngine.ts
    dashboardEngine.ts
    types.ts
  hooks/
    useDemoStore.ts
  index.css                # Walmart color tokens added to design system
```

After approval I'll build all of the above in one pass.

