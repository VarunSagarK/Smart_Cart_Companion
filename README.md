# Smart Cart Companion

An AI grocery planner that builds a weekly Walmart basket around your budget, checks it against your KOHO balance and YNAB budget before you buy, and shows where your grocery money went afterwards.

Built as a product prototype during an AI Product Management course.

## Repo map

| Folder | What's inside |
|---|---|
| [`about-the-product/`](about-the-product/) | Why this product exists: vision, the early MVP plan |
| [`frontend/`](frontend/) | An older copy of the app made with the Emergent builder. Kept until its unique features are reviewed |
| [`setup-guide/`](setup-guide/) | How to run the app and connect OpenAI, Supabase, YNAB and Plaid |
| [`the-app/`](the-app/) | The app itself: all code and its settings |

## What it does

- **AI Grocery Planner:** turns your budget, household and diet into a basket. Uses OpenAI when a key is set, otherwise a built-in budget engine with 5 strategies (lowest cost, healthiest, bulk saver, family, brand).
- **Checkout with money checks:** shows your KOHO balance and the impact on your YNAB grocery budget before you place the order, then syncs the order back to YNAB.
- **Wellness dashboard:** spending analytics from your purchase history.
- **Demo mode:** every integration has a fallback, so the app works with no API keys.

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
