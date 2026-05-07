import { useCallback, useEffect, useState } from "react";
import { Basket, CatalogItem, DemoState, Preferences, PurchaseRecord } from "@/lib/types";

const KEY = "walmart-ai-demo-v3";

const DEFAULT: DemoState = {
  prefs: {
    duration: "weekly",
    budgetSource: "manual",
    weeklyBudget: 100,
    rawBudget: 100,
    household: 2,
    householdBreakdown: { adults: 2, seniors: 0, kids: 0 },
    diets: [],
    foodTypes: [],
    motivation: "weekly-essentials",
    kitchenHave: [],
    avoidJunk: true,
    preferredBrand: "Great Value",
  },
  basket: null,
  history: [],
  wishlist: [],
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

  /** Add items (with optional weekIndex assignment) to the persistent cart. */
  const addItemsToBasket = useCallback(
    (items: CatalogItem[], weekIndex?: number) => {
      if (!items.length) return;
      setState(s => {
        const existing = s.basket;
        const baseLines = existing?.lines ?? [];
        const map = new Map(baseLines.map(l => [`${l.item.id}-${l.weekIndex ?? 0}`, { ...l }]));
        for (const item of items) {
          const k = `${item.id}-${weekIndex ?? 0}`;
          const cur = map.get(k);
          if (cur) cur.qty += 1;
          else map.set(k, { item, qty: 1, weekIndex });
        }
        const lines = Array.from(map.values());
        const subtotal = +lines.reduce((n, l) => n + l.item.price * l.qty, 0).toFixed(2);
        const savings = +lines.reduce((n, l) => n + (l.item.basePrice - l.item.price) * l.qty, 0).toFixed(2);
        const basket: Basket = {
          lines,
          subtotal,
          savings,
          budget: existing?.budget ?? s.prefs.weeklyBudget,
          strategy: existing?.strategy ?? "healthiest",
        };
        return { ...s, basket };
      });
    },
    [],
  );

  const clearBasket = useCallback(() => {
    setState(s => ({ ...s, basket: null }));
  }, []);

  const toggleWishlist = useCallback((id: string) => {
    setState(s => ({
      ...s,
      wishlist: s.wishlist.includes(id) ? s.wishlist.filter(x => x !== id) : [...s.wishlist, id],
    }));
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

  const cartCount = state.basket?.lines.reduce((n, l) => n + l.qty, 0) ?? 0;

  return {
    state,
    cartCount,
    setPrefs,
    setBasket,
    addItemsToBasket,
    clearBasket,
    toggleWishlist,
    recordPurchase,
  };
}
