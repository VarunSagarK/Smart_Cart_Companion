import { useCallback, useSyncExternalStore } from "react";
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
    preferredBrands: [],
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
    const parsed = JSON.parse(raw);
    // Migration: legacy single preferredBrand → preferredBrands[]
    const legacyBrand = parsed?.prefs?.preferredBrand;
    const migratedBrands: string[] | undefined =
      Array.isArray(parsed?.prefs?.preferredBrands)
        ? parsed.prefs.preferredBrands
        : legacyBrand
          ? [legacyBrand]
          : undefined;
    return {
      ...DEFAULT,
      ...parsed,
      prefs: {
        ...DEFAULT.prefs,
        ...(parsed.prefs ?? {}),
        preferredBrands: migratedBrands ?? DEFAULT.prefs.preferredBrands,
      },
    };
  } catch {
    return DEFAULT;
  }
}

/* ---------- Module-scoped global store (single source of truth) ---------- */
let memoryState: DemoState = load();
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(memoryState));
  } catch { /* ignore quota errors */ }
}

function emit() {
  for (const l of listeners) l();
}

function setState(updater: (s: DemoState) => DemoState) {
  memoryState = updater(memoryState);
  persist();
  emit();
}

/* Sync across tabs */
if (typeof window !== "undefined") {
  window.addEventListener("storage", e => {
    if (e.key === KEY && e.newValue) {
      try {
        memoryState = { ...DEFAULT, ...JSON.parse(e.newValue) };
        emit();
      } catch { /* ignore */ }
    }
  });
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
};
const getSnapshot = () => memoryState;

/* ---------- Public hook ---------- */
export function useDemoStore() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

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

  /** Remove a single line entirely (by item + weekIndex). */
  const removeLineFromBasket = useCallback((itemId: string, weekIndex?: number) => {
    setState(s => {
      if (!s.basket) return s;
      const lines = s.basket.lines.filter(
        l => !(l.item.id === itemId && (l.weekIndex ?? 0) === (weekIndex ?? 0)),
      );
      if (!lines.length) return { ...s, basket: null };
      const subtotal = +lines.reduce((n, l) => n + l.item.price * l.qty, 0).toFixed(2);
      const savings = +lines.reduce((n, l) => n + (l.item.basePrice - l.item.price) * l.qty, 0).toFixed(2);
      return { ...s, basket: { ...s.basket, lines, subtotal, savings } };
    });
  }, []);

  /** Update qty for a line. qty<=0 removes it. */
  const updateLineQty = useCallback((itemId: string, qty: number, weekIndex?: number) => {
    setState(s => {
      if (!s.basket) return s;
      let lines = s.basket.lines.map(l =>
        l.item.id === itemId && (l.weekIndex ?? 0) === (weekIndex ?? 0)
          ? { ...l, qty: Math.max(0, qty) }
          : l,
      );
      lines = lines.filter(l => l.qty > 0);
      if (!lines.length) return { ...s, basket: null };
      const subtotal = +lines.reduce((n, l) => n + l.item.price * l.qty, 0).toFixed(2);
      const savings = +lines.reduce((n, l) => n + (l.item.basePrice - l.item.price) * l.qty, 0).toFixed(2);
      return { ...s, basket: { ...s.basket, lines, subtotal, savings } };
    });
  }, []);

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
    removeLineFromBasket,
    updateLineQty,
    clearBasket,
    toggleWishlist,
    recordPurchase,
  };
}
