import { useCallback, useEffect, useState } from "react";
import { Basket, DemoState, Preferences, PurchaseRecord } from "@/lib/types";

const KEY = "walmart-ai-demo-v1";

const DEFAULT: DemoState = {
  prefs: { weeklyBudget: 100, household: 2, diets: [], avoidJunk: true },
  basket: null,
  history: [],
};

function load(): DemoState {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT;
  }
}

/**
 * Single demo-user store. Swap for Supabase queries later
 * without touching screen components.
 */
export function useDemoStore() {
  const [state, setState] = useState<DemoState>(load);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  const setPrefs = useCallback((prefs: Preferences) => {
    setState(s => ({ ...s, prefs }));
  }, []);

  const setBasket = useCallback((basket: Basket | null) => {
    setState(s => ({ ...s, basket }));
  }, []);

  const recordPurchase = useCallback((basket: Basket) => {
    const rec: PurchaseRecord = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      total: basket.subtotal,
      savings: basket.savings,
      budget: basket.budget,
      itemCount: basket.lines.reduce((n, l) => n + l.qty, 0),
    };
    setState(s => ({ ...s, history: [rec, ...s.history], basket: null }));
    return rec;
  }, []);

  return { state, setPrefs, setBasket, recordPurchase };
}
