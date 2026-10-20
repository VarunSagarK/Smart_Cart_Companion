import { dealForItem } from "./mockDeals";
import {
  Basket,
  BasketLine,
  BasketStrategy,
  CatalogItem,
  DietId,
  MotivationId,
  Preferences,
  ResultFilter,
} from "./types";

/**
 * Pure scoring + filling engine. Strategies share the same machinery
 * but rank items differently. Swap mockCatalog for live APIs later.
 */

function passesDiets(item: CatalogItem, diets: DietId[]): boolean {
  if (!diets.length || diets.includes("no-preference")) return true;
  return diets.every(d => {
    if (d === "no-preference" || d === "family-essentials" || d === "budget-saver" || d === "organic-preferred") return true;
    return item.tags?.includes(d);
  });
}

function passesFoodTypes(item: CatalogItem, types?: Preferences["foodTypes"]): boolean {
  if (!types || !types.length) return true;
  if (!item.cuisines || !item.cuisines.length) return true; // staples always pass
  return item.cuisines.some(c => types.includes(c));
}

function motivationBoost(item: CatalogItem, motivation?: MotivationId): number {
  if (!motivation) return 0;
  switch (motivation) {
    case "budget-friendly":
    case "student-budget":
      return (item.onSale ? 2 : 0) + (item.tags?.includes("budget-saver") ? 2 : 0);
    case "health-conscious":
    case "fitness-goals":
      return item.healthScore * 0.5;
    case "high-protein":
      return item.tags?.includes("high-protein") ? 4 : 0;
    case "comfort-meals":
      return item.cuisines?.includes("comfort") ? 3 : 0;
    case "family-gathering":
    case "weekly-essentials":
      return item.tags?.includes("family-essentials") ? 3 : 0;
    case "kids-lunch-prep":
      return (item.category === "snacks" && !item.isJunk ? 2 : 0) + (item.tags?.includes("family-essentials") ? 2 : 0);
    case "meal-prep":
      return (item.bulk ? 2 : 0) + (item.tags?.includes("high-protein") ? 2 : 0);
    case "quick-easy":
      return item.cuisines?.includes("quick-meals") || item.cuisines?.includes("frozen") ? 3 : 0;
    case "birthday-week":
    case "special-occasion":
    case "vacation-prep":
      return item.cuisines?.includes("comfort") ? 1 : 0;
    default:
      return 0;
  }
}

function rank(item: CatalogItem, strategy: BasketStrategy, prefs: Preferences): number {
  const saleBonus = item.onSale ? 1 : 0;
  const motiv = motivationBoost(item, prefs.motivation);
  let base: number;
  switch (strategy) {
    case "lowest-cost":
      base = (1 / item.price) * (1 + saleBonus * 0.5);
      break;
    case "healthiest":
      base = item.healthScore + saleBonus * 1.5;
      break;
    case "bulk-saver":
      base = (item.bulk ? 5 : 0) + (item.basePrice - item.price) * 2 + item.healthScore * 0.3;
      break;
    case "family":
      base = (item.tags?.includes("family-essentials") ? 4 : 0) + item.healthScore * 0.6 + saleBonus;
      break;
    case "brand": {
      // Support both legacy single brand and new multi-select brands
      const brands = prefs.preferredBrands?.length
        ? prefs.preferredBrands
        : prefs.preferredBrand ? [prefs.preferredBrand] : [];
      base = (brands.length && item.brand && brands.includes(item.brand) ? 6 : 0) + item.healthScore * 0.4 + saleBonus;
      break;
    }
  }
  return base + motiv;
}

function householdMultiplier(prefs: Preferences): number {
  const hb = prefs.householdBreakdown;
  const total = hb ? hb.adults + hb.seniors + hb.kids : prefs.household;
  return Math.max(1, Math.round(total / 2));
}

function weekCount(prefs: Preferences): number {
  return prefs.duration === "monthly" ? 4 : prefs.duration === "biweekly" ? 2 : 1;
}

const MIN_ITEMS = 20; // always show at least this many items regardless of budget

export function optimizeBasket(
  prefs: Preferences,
  catalog: CatalogItem[],
  strategy: BasketStrategy = "healthiest",
): Basket {
  const have = new Set(prefs.kitchenHave ?? []);
  const filtered = catalog.filter(i => {
    if (have.has(i.id)) return false;
    if (prefs.avoidJunk && i.isJunk) return false;
    if (!passesDiets(i, prefs.diets)) return false;
    if (!passesFoodTypes(i, prefs.foodTypes)) return false;
    return true;
  });

  // If very strict filters yield too few items, relax food-type filter
  const pool = filtered.length >= MIN_ITEMS
    ? filtered
    : catalog.filter(i => {
        if (have.has(i.id)) return false;
        if (prefs.avoidJunk && i.isJunk) return false;
        if (!passesDiets(i, prefs.diets)) return false;
        return true; // food-type filter dropped
      });

  const ranked = [...pool].sort((a, b) => rank(b, strategy, prefs) - rank(a, strategy, prefs));

  const lines: BasketLine[] = [];
  const seenCats = new Set<string>();
  let total = 0;
  const householdMult = householdMultiplier(prefs);
  const totalBudget = prefs.weeklyBudget * weekCount(prefs);

  // Pass 1: cover each category once (always include, budget-aware qty)
  for (const item of ranked) {
    if (seenCats.has(item.category)) continue;
    const qty = householdMult;
    lines.push({ item, qty, appliedDeal: dealForItem(item.id) });
    total += item.price * qty;
    seenCats.add(item.category);
  }

  // Pass 2: greedily fill to MIN_ITEMS — ignore budget cap until we hit minimum
  for (const item of ranked) {
    if (lines.length >= MIN_ITEMS && total > totalBudget) break;
    if (lines.find(l => l.item.id === item.id)) continue;
    lines.push({ item, qty: householdMult, appliedDeal: dealForItem(item.id) });
    total += item.price * householdMult;
  }

  // Pass 3: if still under MIN_ITEMS, add anything remaining
  if (lines.length < MIN_ITEMS) {
    for (const item of ranked) {
      if (lines.length >= MIN_ITEMS) break;
      if (lines.find(l => l.item.id === item.id)) continue;
      lines.push({ item, qty: 1, appliedDeal: dealForItem(item.id) });
      total += item.price;
    }
  }

  // Spread across weeks for biweekly/monthly
  const weeks = weekCount(prefs);
  if (weeks > 1) {
    lines.forEach((l, idx) => (l.weekIndex = idx % weeks));
  }

  const savings = lines.reduce((s, l) => s + (l.item.basePrice - l.item.price) * l.qty, 0);
  return {
    lines,
    subtotal: +total.toFixed(2),
    savings: +savings.toFixed(2),
    budget: totalBudget,
    strategy,
  };
}

export function buildAllStrategies(prefs: Preferences, catalog: CatalogItem[]): Record<BasketStrategy, Basket> {
  const strategies: BasketStrategy[] = ["lowest-cost", "healthiest", "bulk-saver", "family", "brand"];
  return Object.fromEntries(strategies.map(s => [s, optimizeBasket(prefs, catalog, s)])) as Record<BasketStrategy, Basket>;
}

/** Apply a result-page filter chip to an existing basket's line set. */
export function applyResultFilter(lines: BasketLine[], filter: ResultFilter): BasketLine[] {
  if (filter === "all") return lines;
  return lines.filter(l => {
    const i = l.item;
    switch (filter) {
      case "budget-saver":      return i.onSale || i.tags?.includes("budget-saver");
      case "bulk-savings":      return !!i.bulk;
      case "family-essentials": return i.tags?.includes("family-essentials");
      case "healthy":           return i.healthScore >= 8 && !i.isJunk;
      case "high-protein":      return i.tags?.includes("high-protein");
      case "organic":           return i.tags?.includes("organic-preferred") || i.cuisines?.includes("organic");
      case "snacks":            return i.category === "snacks";
      default:                  return true;
    }
  });
}

export const RESULT_FILTERS: { id: ResultFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "budget-saver", label: "Budget Saver" },
  { id: "bulk-savings", label: "Bulk Savings" },
  { id: "family-essentials", label: "Family Essentials" },
  { id: "healthy", label: "Healthy" },
  { id: "high-protein", label: "High Protein" },
  { id: "organic", label: "Organic" },
  { id: "snacks", label: "Snacks" },
];

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
