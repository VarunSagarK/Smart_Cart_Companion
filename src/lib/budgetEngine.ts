import { dealForItem } from "./mockDeals";
import { Basket, BasketLine, BasketStrategy, CatalogItem, DietId, Preferences } from "./types";

/**
 * Pure scoring + filling engine. Strategies share the same machinery
 * but rank items differently. Swap mockCatalog for live APIs later.
 */

function passesDiets(item: CatalogItem, diets: DietId[]): boolean {
  if (!diets.length || diets.includes("no-preference")) return true;
  // every selected diet must match a tag (except meta-diets handled below)
  return diets.every(d => {
    if (d === "no-preference" || d === "family-essentials" || d === "budget-saver" || d === "organic-preferred") return true;
    return item.tags?.includes(d);
  });
}

function rank(item: CatalogItem, strategy: BasketStrategy, prefs: Preferences): number {
  const saleBonus = item.onSale ? 1 : 0;
  switch (strategy) {
    case "lowest-cost":
      return (1 / item.price) * (1 + saleBonus * 0.5);
    case "healthiest":
      return item.healthScore + saleBonus * 1.5;
    case "bulk-saver":
      return (item.bulk ? 5 : 0) + (item.basePrice - item.price) * 2 + item.healthScore * 0.3;
    case "family":
      return (item.tags?.includes("family-essentials") ? 4 : 0) + item.healthScore * 0.6 + saleBonus;
    case "brand":
      return (prefs.preferredBrand && item.brand === prefs.preferredBrand ? 6 : 0) + item.healthScore * 0.4 + saleBonus;
  }
}

export function optimizeBasket(
  prefs: Preferences,
  catalog: CatalogItem[],
  strategy: BasketStrategy = "healthiest",
): Basket {
  const filtered = catalog.filter(i => {
    if (prefs.avoidJunk && i.isJunk) return false;
    return passesDiets(i, prefs.diets);
  });

  const ranked = [...filtered].sort((a, b) => rank(b, strategy, prefs) - rank(a, strategy, prefs));

  const lines: BasketLine[] = [];
  const seenCats = new Set<string>();
  let total = 0;
  const householdMult = Math.max(1, Math.round(prefs.household / 2));

  // Pass 1: cover each category once
  for (const item of ranked) {
    if (seenCats.has(item.category)) continue;
    const qty = householdMult;
    const cost = item.price * qty;
    if (total + cost > prefs.weeklyBudget) continue;
    lines.push({ item, qty, appliedDeal: dealForItem(item.id) });
    total += cost;
    seenCats.add(item.category);
  }
  // Pass 2: greedily fill remaining budget
  for (const item of ranked) {
    if (lines.find(l => l.item.id === item.id)) continue;
    const cost = item.price * householdMult;
    if (total + cost > prefs.weeklyBudget) continue;
    lines.push({ item, qty: householdMult, appliedDeal: dealForItem(item.id) });
    total += cost;
  }

  const savings = lines.reduce((s, l) => s + (l.item.basePrice - l.item.price) * l.qty, 0);
  return {
    lines,
    subtotal: +total.toFixed(2),
    savings: +savings.toFixed(2),
    budget: prefs.weeklyBudget,
    strategy,
  };
}

export function buildAllStrategies(prefs: Preferences, catalog: CatalogItem[]): Record<BasketStrategy, Basket> {
  const strategies: BasketStrategy[] = ["lowest-cost", "healthiest", "bulk-saver", "family", "brand"];
  return Object.fromEntries(strategies.map(s => [s, optimizeBasket(prefs, catalog, s)])) as Record<BasketStrategy, Basket>;
}

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

export const STRATEGY_META: Record<BasketStrategy, { label: string; tagline: string }> = {
  "lowest-cost": { label: "Lowest Cost", tagline: "Stretch every dollar" },
  "healthiest": { label: "Healthiest", tagline: "Best nutrition in budget" },
  "bulk-saver": { label: "Bulk Saver", tagline: "Per-unit value picks" },
  "family": { label: "Family", tagline: "Household essentials" },
  "brand": { label: "Brand Preference", tagline: "Favor your brand" },
};
