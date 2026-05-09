/**
 * YNAB API integration.
 *
 * OAuth flow:
 *  1. Redirect user to ynabAuthUrl()
 *  2. YNAB redirects back to /account?code=<code>
 *  3. Call exchangeCode(code) → stores access token in Supabase profile
 *  4. Subsequent calls use the stored token via getClient()
 *
 * Scopes needed: read-only is enough for pulling budget; write needed for
 * syncing transactions back.
 *
 * All amounts in YNAB are in milliunits (1000 = $1.00).
 */

const YNAB_BASE = "https://api.ynab.com/v1";
const YNAB_OAUTH_BASE = "https://app.ynab.com/oauth";

// ── OAuth helpers ─────────────────────────────────────────────────────────────

export function ynabAuthUrl(): string {
  const clientId = import.meta.env.VITE_YNAB_CLIENT_ID as string;
  const redirect = encodeURIComponent(window.location.origin + "/account");
  // Use token (implicit) flow — returns access_token in URL hash, no backend needed
  return `${YNAB_OAUTH_BASE}/authorize?client_id=${clientId}&redirect_uri=${redirect}&response_type=token`;
}

/**
 * Exchange auth code for access token.
 * In production this exchange MUST happen server-side (Supabase Edge Function)
 * to keep the client_secret out of the browser.
 * Here we call our edge function proxy.
 */
export async function exchangeYnabCode(code: string): Promise<{ access_token: string } | null> {
  try {
    const res = await fetch("/api/ynab/exchange", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ── YNAB API calls ────────────────────────────────────────────────────────────

async function ynabGet<T>(path: string, token: string): Promise<T | null> {
  try {
    const res = await fetch(`${YNAB_BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as T;
  } catch {
    return null;
  }
}

export interface YnabBudgetSummary {
  id: string;
  name: string;
  last_modified_on: string;
}

export async function fetchYnabBudgets(token: string): Promise<YnabBudgetSummary[]> {
  const data = await ynabGet<{ budgets: YnabBudgetSummary[] }>("/budgets", token);
  return data?.budgets ?? [];
}

export interface YnabCategoryGroup {
  id: string;
  name: string;
  categories: YnabCategory[];
}

export interface YnabCategory {
  id: string;
  name: string;
  budgeted: number;       // milliunits
  activity: number;       // milliunits (negative = spent)
  balance: number;        // milliunits
  goal_type: string | null;
}

export async function fetchYnabCategories(
  token: string,
  budgetId: string,
): Promise<YnabCategoryGroup[]> {
  const data = await ynabGet<{ category_groups: YnabCategoryGroup[] }>(
    `/budgets/${budgetId}/categories`,
    token,
  );
  return data?.category_groups ?? [];
}

/** Find the most likely "Groceries" category and return balance in $. */
export function findGroceryBalance(groups: YnabCategoryGroup[]): {
  categoryId: string;
  name: string;
  budgeted: number;
  spent: number;
  remaining: number;
} | null {
  // Log all categories so we can see exactly what's in the user's YNAB
  console.log("[YNAB] All categories:", groups.flatMap(g =>
    g.categories.map(c => `${g.name} → ${c.name} | budgeted: ${c.budgeted / 1000} | balance: ${c.balance / 1000}`)
  ));

  const GROCERY_KEYWORDS = [
    "groceries", "grocery", "grocer", "food", "supermarket", "market",
    "walmart", "costco", "loblaws", "sobeys", "metro", "produce", "eat", "meal", "dining",
  ];

  for (const group of groups) {
    for (const cat of group.categories) {
      const lower = cat.name.toLowerCase();
      if (GROCERY_KEYWORDS.some(k => lower.includes(k))) {
        const budgeted = cat.budgeted / 1000;
        const spent = Math.abs(cat.activity) / 1000;
        const remaining = cat.balance / 1000;
        console.log(`[YNAB] Matched grocery category: "${cat.name}" | budgeted: $${budgeted} | spent: $${spent} | remaining: $${remaining}`);
        return {
          categoryId: cat.id,
          name: cat.name,
          budgeted,
          spent,
          // If remaining is 0 but budgeted is set, use budgeted (new month / reset)
          remaining: remaining > 0 ? remaining : budgeted,
        };
      }
    }
  }

  console.warn("[YNAB] No grocery category found. Check browser console for full category list.");
  return null;
}

// ── Create transaction (sync spend back) ──────────────────────────────────────

export interface YnabTransactionPayload {
  account_id: string;
  date: string;           // YYYY-MM-DD
  amount: number;         // milliunits, negative for outflow
  payee_name: string;
  category_id?: string;
  memo?: string;
  cleared: "cleared" | "uncleared" | "reconciled";
}

export async function createYnabTransaction(
  token: string,
  budgetId: string,
  tx: YnabTransactionPayload,
): Promise<{ transactionId: string } | null> {
  try {
    const res = await fetch(`${YNAB_BASE}/budgets/${budgetId}/transactions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transaction: tx }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return { transactionId: json.data?.transaction?.id ?? "" };
  } catch {
    return null;
  }
}

/** High-level: sync a completed order back to YNAB. Returns transaction id or null. */
export async function syncOrderToYnab(
  token: string,
  budgetId: string,
  categoryId: string,
  accountId: string,
  total: number,         // dollars
  memo?: string,
): Promise<string | null> {
  const result = await createYnabTransaction(token, budgetId, {
    account_id: accountId,
    date: new Date().toISOString().slice(0, 10),
    amount: -Math.round(total * 1000),   // negative = outflow
    payee_name: "Walmart",
    category_id: categoryId,
    memo: memo ?? "Smart Cart Companion purchase",
    cleared: "cleared",
  });
  return result?.transactionId ?? null;
}
