export type Category = "produce" | "dairy" | "pantry" | "snacks" | "beverages" | "protein";

export type DietId =
  | "vegetarian"
  | "vegan"
  | "high-protein"
  | "keto"
  | "low-carb"
  | "gluten-free"
  | "dairy-free"
  | "halal"
  | "kosher"
  | "diabetic-friendly"
  | "family-essentials"
  | "budget-saver"
  | "organic-preferred"
  | "no-preference";

export type BasketStrategy =
  | "lowest-cost"
  | "healthiest"
  | "bulk-saver"
  | "family"
  | "brand";

export type BudgetSource = "manual" | "ynab" | "mint";
export type PlanDuration = "weekly" | "monthly";

export interface CatalogItem {
  id: string;
  name: string;
  brand?: string;
  category: Category;
  price: number;
  basePrice: number;
  unit: string;
  onSale: boolean;
  healthScore: number;   // 0-10
  isJunk?: boolean;
  bulk?: boolean;        // good per-unit value at scale
  tags?: string[];       // diet tags
}

export interface Deal {
  itemId: string;
  source: string;
  label: string;
  savings: number;
}

export interface BasketLine {
  item: CatalogItem;
  qty: number;
  appliedDeal?: Deal;
}

export interface Basket {
  lines: BasketLine[];
  subtotal: number;
  savings: number;
  budget: number;
  strategy: BasketStrategy;
}

export interface Preferences {
  duration: PlanDuration;
  budgetSource: BudgetSource;
  weeklyBudget: number;     // normalized weekly $
  household: number;
  diets: DietId[];
  avoidJunk: boolean;
  preferredBrand?: string;  // used by brand strategy
}

export interface PurchaseRecord {
  id: string;
  date: string;
  total: number;
  savings: number;
  budget: number;
  itemCount: number;
  junkCount: number;
  healthySwaps: number;
  strategy: BasketStrategy;
}

export interface DemoState {
  prefs: Preferences;
  basket: Basket | null;
  history: PurchaseRecord[];
  onboarded: boolean;
}
