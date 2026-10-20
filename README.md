# Smart Cart Companion

An AI grocery planner that builds a weekly Walmart basket around your budget, checks it against your KOHO balance and YNAB budget before you buy, and shows where your grocery money went afterwards.

Built as a product prototype during an AI Product Management course.

## 1. Product vision

Help every household plan groceries that fit their budget **before** they shop, not after.

More in [`about-the-product/product-vision.md`](about-the-product/product-vision.md).

## 2. The problem

- Shoppers set a grocery budget, but find out they've overspent only at checkout or when the bank statement arrives.
- Budgeting apps such as YNAB track spending **after** it happens. Store apps help you find deals but don't know your budget.
- Planning a week of healthy meals around a fixed budget, a household size and dietary needs is slow, manual work.

> TODO: add evidence, e.g. food-inflation data or findings from user conversations.

## 3. Who it's for

**Users:** budget-conscious households who shop at Walmart and want to stay on budget without giving up healthy food. They especially include people who already budget with YNAB or bank with KOHO.

**Customers (who would pay or partner):**
- **Walmart:** loyal weekly shoppers and baskets built from its own deals.
- **YNAB and KOHO:** their tools become part of the everyday shopping moment, not just the review afterwards.

## 4. The solution

Plan → Basket → Check → Buy → Review:

1. **Plan:** the AI Grocery Planner asks for the planning period, budget, household size, dietary preferences, what's already in the kitchen, and final preferences.
2. **Basket:** AI builds a basket from this week's deals. With no OpenAI key, a built-in engine offers 5 strategies: lowest cost, healthiest, bulk saver, family, brand.
3. **Check:** checkout shows your KOHO balance and the impact on your YNAB grocery budget *before* you place the order.
4. **Buy:** place the order; it syncs back to YNAB as a transaction.
5. **Review:** the Savings & Wellness dashboard shows spending from your purchase history.

## 5. Success metrics

| Type | Metric |
|---|---|
| North Star | % of baskets checked out at or under budget |
| Supporting | Basket acceptance rate (AI basket checked out with few edits) |
| Supporting | Weekly repeat planners |
| Supporting | YNAB / KOHO connection rate |
| Guardrail | Checkout completion rate, so staying on budget doesn't make shoppers abandon carts |

> TODO: set targets once there is real usage data.

## 6. MVP scope

**In:** AI Grocery Planner, basket results with strategy filters, cart, checkout with KOHO and YNAB checks, Savings & Wellness dashboard, saved items, search. Every integration has a demo mode, so the app works without API keys.

**Not yet:** a real Walmart catalog (about 60 mock products for now), real payments, and a server-side proxy for the OpenAI key.

## 7. What's next

> TODO: confirm priorities.

- Connect a real product and deals catalog in place of the mock data.
- Move AI calls to a server so the API key isn't in the browser.
- Test with real shoppers and measure the metrics above.

## 8. Where it stands

A working prototype with demo data. YNAB, KOHO (via Plaid) and OpenAI connect when keys are added, and fall back to demo mode otherwise.

## Repo map

| Folder | What's inside |
|---|---|
| [`about-the-product/`](about-the-product/) | Why this product exists: vision, the early MVP plan |
| [`frontend/`](frontend/) | An older copy of the app made with the Emergent builder. Kept until its unique features are reviewed |
| [`setup-guide/`](setup-guide/) | How to run the app and connect OpenAI, Supabase, YNAB and Plaid |
| [`the-app/`](the-app/) | The app itself: all code and its settings |

## Built with

React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router · OpenAI (GPT-4o-mini) · Supabase · YNAB API · Plaid · Vercel

## Run it locally

```bash
cd the-app
npm install
npm run dev
```

Then open http://localhost:8080. To turn on real integrations, see [`setup-guide/setup-and-integrations.md`](setup-guide/setup-and-integrations.md).

## Author

Varun Sagar K
