/**
 * Plaid integration for KOHO balance display.
 *
 * KOHO issues Visa prepaid cards which are readable via Plaid's banking APIs.
 *
 * Flow:
 *  1. Call createLinkToken() → get a link_token from your backend proxy
 *  2. Open Plaid Link with that token (react-plaid-link)
 *  3. On success, exchange public_token for access_token via your backend
 *  4. Store access_token in Supabase profile
 *  5. Call fetchAccounts() to get balances
 *
 * IMPORTANT: access_token must NEVER be exposed to the browser.
 * All Plaid API calls that use access_token go through Supabase Edge Functions.
 * The frontend only calls /api/plaid/* proxy endpoints.
 */

export interface PlaidAccount {
  account_id: string;
  name: string;
  official_name: string | null;
  type: string;
  subtype: string | null;
  balances: {
    available: number | null;
    current: number | null;
    limit: number | null;
    iso_currency_code: string | null;
  };
  mask: string | null;
}

/** Request a link token from the backend proxy. */
export async function createPlaidLinkToken(): Promise<string | null> {
  try {
    const res = await fetch("/api/plaid/link-token", { method: "POST" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.link_token ?? null;
  } catch {
    return null;
  }
}

/** Exchange a Plaid public_token for a persistent access_token (via backend). */
export async function exchangePlaidToken(publicToken: string): Promise<boolean> {
  try {
    const res = await fetch("/api/plaid/exchange", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ public_token: publicToken }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Fetch accounts using the stored access_token (via backend proxy). */
export async function fetchPlaidAccounts(): Promise<PlaidAccount[]> {
  try {
    const res = await fetch("/api/plaid/accounts");
    if (!res.ok) return [];
    const json = await res.json();
    return json.accounts ?? [];
  } catch {
    return [];
  }
}

/** Find the most likely KOHO account from a list of Plaid accounts. */
export function findKohoAccount(accounts: PlaidAccount[]): PlaidAccount | null {
  const KOHO_KEYWORDS = ["koho", "prepaid", "visa prepaid"];
  // First pass: explicit KOHO match
  for (const acc of accounts) {
    const name = (acc.official_name ?? acc.name).toLowerCase();
    if (KOHO_KEYWORDS.some(k => name.includes(k))) return acc;
  }
  // Second pass: any prepaid/debit with a balance
  for (const acc of accounts) {
    if (acc.subtype === "prepaid" || acc.subtype === "checking") {
      if ((acc.balances.available ?? 0) > 0) return acc;
    }
  }
  return accounts[0] ?? null;
}

/** Format a Plaid balance for display. */
export function formatBalance(account: PlaidAccount): {
  available: string;
  current: string;
  currency: string;
} {
  const fmt = (v: number | null) =>
    v != null ? `$${v.toFixed(2)}` : "—";
  return {
    available: fmt(account.balances.available),
    current: fmt(account.balances.current),
    currency: account.balances.iso_currency_code ?? "CAD",
  };
}
