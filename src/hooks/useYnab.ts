/**
 * useYnab — manages YNAB connection state.
 *
 * On mount, checks for ?code= in the URL (OAuth callback) and exchanges it.
 * Stores the token + budget ID in localStorage (and Supabase if authed).
 *
 * After successful OAuth, redirects to /ai with the pulled grocery budget.
 *
 * In production, the token exchange must go through a backend/edge function.
 */

import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  fetchYnabBudgets,
  fetchYnabCategories,
  findGroceryBalance,
  syncOrderToYnab,
  type YnabCategoryGroup,
} from "@/lib/ynab";

const LS_KEY = "ynab_connection";

interface YnabConnection {
  accessToken: string;
  budgetId: string;
  budgetName: string;
  categoryId: string | null;
  accountId: string | null;
}

function loadConnection(): YnabConnection | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveConnection(conn: YnabConnection) {
  localStorage.setItem(LS_KEY, JSON.stringify(conn));
}

export function useYnab() {
  const [connection, setConnection] = useState<YnabConnection | null>(loadConnection);
  const [loading, setLoading] = useState(false);
  const [groceryBalance, setGroceryBalance] = useState<{
    name: string;
    budgeted: number;
    spent: number;
    remaining: number;
  } | null>(null);
  const [searchParams] = useSearchParams();
  const nav = useNavigate();

  // Handle implicit OAuth callback — token is in URL hash: #access_token=...&...
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const params = new URLSearchParams(hash.replace("#", ""));
    const token = params.get("access_token");
    if (!token) return;

    // Clear hash from URL immediately
    window.history.replaceState(null, "", window.location.pathname);
    setLoading(true);

    (async () => {
      try {
        const budgets = await fetchYnabBudgets(token);
        const budget = budgets[0];
        if (!budget) throw new Error("No budgets found");

        const groups: YnabCategoryGroup[] = await fetchYnabCategories(token, budget.id);
        const grocery = findGroceryBalance(groups);

        const conn: YnabConnection = {
          accessToken: token,
          budgetId: budget.id,
          budgetName: budget.name,
          categoryId: grocery?.categoryId ?? null,
          accountId: null,
        };
        saveConnection(conn);
        setConnection(conn);
        if (grocery) setGroceryBalance(grocery);

        // Redirect to AI Planner with the real YNAB grocery budget pre-filled
        nav("/ai", {
          state: { ynabBudget: grocery?.remaining ?? grocery?.budgeted ?? null },
          replace: true,
        });
      } catch (err) {
        console.error("[YNAB] OAuth failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load grocery balance when connection exists
  useEffect(() => {
    if (!connection) return;
    (async () => {
      const groups = await fetchYnabCategories(connection.accessToken, connection.budgetId);
      const grocery = findGroceryBalance(groups);
      if (grocery) setGroceryBalance(grocery);
    })();
  }, [connection]);

  const disconnect = useCallback(() => {
    localStorage.removeItem(LS_KEY);
    setConnection(null);
    setGroceryBalance(null);
  }, []);

  /** Call this after a successful order to push the spend to YNAB. */
  const syncSpend = useCallback(
    async (totalDollars: number, memo?: string): Promise<boolean> => {
      if (!connection?.accessToken || !connection.budgetId || !connection.categoryId || !connection.accountId) {
        return false;
      }
      const txId = await syncOrderToYnab(
        connection.accessToken,
        connection.budgetId,
        connection.categoryId,
        connection.accountId,
        totalDollars,
        memo,
      );
      return !!txId;
    },
    [connection],
  );

  /** Demo/mock connect — sets up a fake connection without real OAuth */
  const mockConnect = useCallback((groceryBudget: number) => {
    const conn: YnabConnection = {
      accessToken: "mock-token",
      budgetId: "mock-budget",
      budgetName: "My Budget",
      categoryId: "mock-groceries",
      accountId: "mock-account",
    };
    saveConnection(conn);
    setConnection(conn);
    setGroceryBalance({
      name: "Groceries",
      budgeted: groceryBudget,
      spent: groceryBudget * 0.15,
      remaining: groceryBudget * 0.85,
    });
  }, []);

  return {
    connected: !!connection,
    loading,
    connection,
    groceryBalance,
    disconnect,
    syncSpend,
    mockConnect,
  };
}
