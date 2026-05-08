/**
 * usePlaid — manages Plaid Link connection for KOHO balance display.
 *
 * Real flow: createPlaidLinkToken() → open Plaid Link → exchangePlaidToken() → fetchPlaidAccounts()
 * Demo flow: mockConnect() sets a fake balance for UI demonstration.
 *
 * access_token is NEVER stored in the browser. It lives in Supabase (server-side).
 * The frontend only talks to /api/plaid/* proxy endpoints.
 */

import { useCallback, useEffect, useState } from "react";
import {
  createPlaidLinkToken,
  exchangePlaidToken,
  fetchPlaidAccounts,
  findKohoAccount,
  formatBalance,
  type PlaidAccount,
} from "@/lib/plaid";

const LS_KEY = "plaid_connected";

export interface KohoBalance {
  accountName: string;
  mask: string | null;
  available: string;
  current: string;
  currency: string;
  availableRaw: number;
}

function loadConnected(): boolean {
  return localStorage.getItem(LS_KEY) === "true";
}

export function usePlaid() {
  const [connected, setConnected] = useState(loadConnected);
  const [loading, setLoading] = useState(false);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [kohoBalance, setKohoBalance] = useState<KohoBalance | null>(null);

  // If previously connected, re-fetch balance
  useEffect(() => {
    if (!connected) return;
    (async () => {
      const accounts = await fetchPlaidAccounts();
      if (accounts.length) {
        const acc = findKohoAccount(accounts);
        if (acc) setKohoBalance(toKohoBalance(acc));
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initLink = useCallback(async () => {
    setLoading(true);
    const token = await createPlaidLinkToken();
    setLinkToken(token);
    setLoading(false);
    return token;
  }, []);

  const handlePlaidSuccess = useCallback(async (publicToken: string, accountId?: string) => {
    setLoading(true);
    const ok = await exchangePlaidToken(publicToken);
    if (ok) {
      const accounts = await fetchPlaidAccounts();
      const acc = accountId
        ? accounts.find(a => a.account_id === accountId) ?? findKohoAccount(accounts)
        : findKohoAccount(accounts);

      if (acc) {
        setKohoBalance(toKohoBalance(acc));
        setConnected(true);
        localStorage.setItem(LS_KEY, "true");
      }
    }
    setLoading(false);
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem(LS_KEY);
    setConnected(false);
    setKohoBalance(null);
    setLinkToken(null);
  }, []);

  /** Demo mock — sets a fake KOHO balance without real Plaid */
  const mockConnect = useCallback((availableBalance = 347.50) => {
    const mock: KohoBalance = {
      accountName: "KOHO Prepaid Visa",
      mask: "4242",
      available: `$${availableBalance.toFixed(2)}`,
      current: `$${availableBalance.toFixed(2)}`,
      currency: "CAD",
      availableRaw: availableBalance,
    };
    setKohoBalance(mock);
    setConnected(true);
    localStorage.setItem(LS_KEY, "true");
  }, []);

  return {
    connected,
    loading,
    linkToken,
    kohoBalance,
    initLink,
    handlePlaidSuccess,
    disconnect,
    mockConnect,
  };
}

function toKohoBalance(acc: PlaidAccount): KohoBalance {
  const fmt = formatBalance(acc);
  return {
    accountName: acc.official_name ?? acc.name,
    mask: acc.mask,
    available: fmt.available,
    current: fmt.current,
    currency: fmt.currency,
    availableRaw: acc.balances.available ?? acc.balances.current ?? 0,
  };
}
