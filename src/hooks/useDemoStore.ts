import { useCallback, useEffect, useState } from "react";
import { Basket, DemoState, Preferences, PurchaseRecord } from "@/lib/types";

const KEY = "walmart-ai-demo-v2";

const DEFAULT: DemoState = {
  prefs: {
    duration: "weekly",
    budgetSource: "manual",
    weeklyBudget: 100,
    household: 2,
    diets: [],
    avoidJunk: true,
    preferredBrand: "Great Value",
  },
  basket: null,
  history: [],
  onboarded: false,
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

/** Single demo-user store. Swap for Supabase later without touching screens. */
export function useDemoStore() {
  const [state, setState] = useState<DemoState>(load);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  const setPrefs = useCallback((prefs: Preferences) => {
    setState(s => ({ ...s, prefs, onboarded: true }));
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
      junkCount: basket.lines.filter(l => l.item.isJunk).reduce((n, l) => n + l.qty, 0),
      healthySwaps: basket.lines.filter(l => l.item.healthScore >= 8).length,
      strategy: basket.strategy,
    };
    setState(s => ({ ...s, history: [rec, ...s.history], basket: null }));
    return rec;
  }, []);

  return { state, setPrefs, setBasket, recordPurchase };
}
