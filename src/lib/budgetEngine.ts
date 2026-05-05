import { dealForItem } from "./mockDeals";
import { Basket, BasketLine, CatalogItem, Preferences } from "./types";

/**
 * optimizeBasket — given a budget + preferences, builds a balanced basket
 * under the budget, prioritizing on-sale items and higher healthScore.
 *
 * Pure function: swap CATALOG / DEALS for live API data later.
 */
export function optimizeBasket(prefs: Preferences, catalog: CatalogItem[]): Basket {
  const filtered = catalog.filter(i => {
    if (prefs.avoidJunk && i.isJunk) return false;
    for (const d of prefs.diets) {
      if (!i.tags?.includes(d)) return false;
    }
    return true;
  });

  // score = healthScore + sale bonus, value = score / price
  const ranked = [...filtered].sort((a, b) => {
    const sa = (a.healthScore + (a.onSale ? 2 : 0)) / a.price;
    const sb = (b.healthScore + (b.onSale ? 2 : 0)) / b.price;
    return sb - sa;
  });

  // Aim for category balance: ensure at least 1 from each available category first.
  const lines: BasketLine[] = [];
  const seenCats = new Set<string>();
  let total = 0;
  const householdMult = Math.max(1, Math.round(prefs.household / 2));

  for (const item of ranked) {
    if (seenCats.has(item.category)) continue;
    const qty = householdMult;
    const cost = item.price * qty;
    if (total + cost > prefs.weeklyBudget) continue;
    lines.push({ item, qty, appliedDeal: dealForItem(item.id) });
    total += cost;
    seenCats.add(item.category);
  }

  // Then greedily add the next-best-value items until budget is filled.
  for (const item of ranked) {
    if (lines.find(l => l.item.id === item.id)) continue;
    const cost = item.price * householdMult;
    if (total + cost > prefs.weeklyBudget) continue;
    lines.push({ item, qty: householdMult, appliedDeal: dealForItem(item.id) });
    total += cost;
  }

  const savings = lines.reduce(
    (s, l) => s + (l.item.basePrice - l.item.price) * l.qty,
    0,
  );

  return {
    lines,
    subtotal: +total.toFixed(2),
    savings: +savings.toFixed(2),
    budget: prefs.weeklyBudget,
  };
}

/** Suggest a healthier swap for a given line, if a same-category higher-score item fits. */
export function suggestSwap(
  line: BasketLine,
  basket: Basket,
  catalog: CatalogItem[],
): CatalogItem | null {
  const remaining = basket.budget - basket.subtotal + line.item.price * line.qty;
  return (
    catalog
      .filter(
        i =>
          i.category === line.item.category &&
          i.id !== line.item.id &&
          i.healthScore > line.item.healthScore &&
          i.price * line.qty <= remaining,
      )
      .sort((a, b) => b.healthScore - a.healthScore)[0] ?? null
  );
}
