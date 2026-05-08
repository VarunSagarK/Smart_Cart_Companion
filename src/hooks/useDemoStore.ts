/**
 * App-wide state store.
 *
 * Strategy: localStorage is the primary persistence layer (instant, offline).
 * When a Supabase user session exists, changes are also synced to the DB
 * asynchronously — no awaiting, so the UI never stalls.
 *
 * To fully migrate to Supabase-only: replace the localStorage reads/writes
 * with the supabaseSync* functions and add loading states.
 */

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
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

// ── Supabase async sync helpers ───────────────────────────────────────────────

async function syncPrefsToSupabase(userId: string, prefs: Preferences) {
  await supabase.from("preferences").upsert({
    user_id: userId,
    data: JSON.stringify(prefs),
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });
}

async function syncBasketToSupabase(userId: string, basket: Basket | null) {
  if (!basket) {
    await supabase.from("baskets").delete().eq("user_id", userId);
    return;
  }
  await supabase.from("baskets").upsert({
    user_id: userId,
    lines: JSON.stringify(basket.lines),
    subtotal: basket.subtotal,
    savings: basket.savings,
    budget: basket.budget,
    strategy: basket.strategy,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });
}

async function saveOrderToSupabase(userId: string, rec: PurchaseRecord, basket: Basket) {
  await supabase.from("orders").insert({
    id: rec.id,
    user_id: userId,
    basket_snapshot: JSON.stringify(basket.lines),
    total: rec.total,
    savings: rec.savings,
    budget: rec.budget,
    item_count: rec.itemCount,
    junk_count: rec.junkCount,
    healthy_swaps: rec.healthySwaps,
    strategy: rec.strategy,
    created_at: rec.date,
  });
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useDemoStore() {
  const [state, setState] = useState<DemoState>(load);

  // Persist to localStorage on every state change
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  // Async Supabase sync (fire-and-forget, never blocks UI)
  const syncToSupabase = useCallback(
    async (patch: Partial<Pick<DemoState, "prefs" | "basket">>, record?: { rec: PurchaseRecord; basket: Basket }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const uid = session.user.id;
      if (patch.prefs) await syncPrefsToSupabase(uid, patch.prefs);
      if ("basket" in patch) await syncBasketToSupabase(uid, patch.basket ?? null);
      if (record) await saveOrderToSupabase(uid, record.rec, record.basket);
    },
    [],
  );

  const setPrefs = useCallback((prefs: Preferences) => {
    setState(s => ({ ...s, prefs, onboarded: true }));
    syncToSupabase({ prefs });
  }, [syncToSupabase]);

  const setBasket = useCallback((basket: Basket | null) => {
    setState(s => ({ ...s, basket }));
    syncToSupabase({ basket });
  }, [syncToSupabase]);

  /**
   * Add items to basket in a single atomic setState call.
   * Accepts either a flat list (all same weekIndex) or per-line entries
   * with individual weekIndex values for biweekly/monthly grouping.
   */
  const addItemsToBasket = useCallback(
    (
      items: CatalogItem[],
      weekIndex?: number,
      perLineEntries?: Array<{ item: CatalogItem; weekIndex?: number }>,
    ) => {
      const entries = perLineEntries ?? items.map(item => ({ item, weekIndex }));
      if (!entries.length) return;
      setState(s => {
        const existing = s.basket;
        const baseLines = existing?.lines ?? [];
        const map = new Map(baseLines.map(l => [`${l.item.id}-${l.weekIndex ?? 0}`, { ...l }]));
        for (const entry of entries) {
          const k = `${entry.item.id}-${entry.weekIndex ?? 0}`;
          const cur = map.get(k);
          if (cur) cur.qty += 1;
          else map.set(k, { item: entry.item, qty: 1, weekIndex: entry.weekIndex });
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

  const removeItemFromBasket = useCallback((itemId: string) => {
    setState(s => {
      if (!s.basket) return s;
      const lines = s.basket.lines.filter(l => l.item.id !== itemId);
      if (!lines.length) return { ...s, basket: null };
      const subtotal = +lines.reduce((n, l) => n + l.item.price * l.qty, 0).toFixed(2);
      const savings = +lines.reduce((n, l) => n + (l.item.basePrice - l.item.price) * l.qty, 0).toFixed(2);
      return { ...s, basket: { ...s.basket, lines, subtotal, savings } };
    });
  }, []);

  const updateItemQty = useCallback((itemId: string, qty: number) => {
    if (qty < 1) return;
    setState(s => {
      if (!s.basket) return s;
      const lines = s.basket.lines.map(l => l.item.id === itemId ? { ...l, qty } : l);
      const subtotal = +lines.reduce((n, l) => n + l.item.price * l.qty, 0).toFixed(2);
      const savings = +lines.reduce((n, l) => n + (l.item.basePrice - l.item.price) * l.qty, 0).toFixed(2);
      return { ...s, basket: { ...s.basket, lines, subtotal, savings } };
    });
  }, []);

  const clearBasket = useCallback(() => {
    setState(s => ({ ...s, basket: null }));
    syncToSupabase({ basket: null });
  }, [syncToSupabase]);

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
    syncToSupabase({ basket: null }, { rec, basket });
    return rec;
  }, [syncToSupabase]);

  const cartCount = state.basket?.lines.reduce((n, l) => n + l.qty, 0) ?? 0;
  const cartTotal = state.basket?.subtotal ?? 0;

  return {
    state,
    cartCount,
    cartTotal,
    setPrefs,
    setBasket,
    addItemsToBasket,
    removeItemFromBasket,
    updateItemQty,
    clearBasket,
    toggleWishlist,
    recordPurchase,
  };
}
