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

export type FoodTypeId =
  | "american"
  | "asian"
  | "chinese"
  | "comfort"
  | "frozen"
  | "indian"
  | "italian"
  | "mediterranean"
  | "mexican"
  | "middle-eastern"
  | "organic"
  | "quick-meals"
  | "seafood"
  | "snacks"
  | "vegetarian-comfort";

export type MotivationId =
  | "birthday-week"
  | "budget-friendly"
  | "comfort-meals"
  | "family-gathering"
  | "fitness-goals"
  | "health-conscious"
  | "high-protein"
  | "kids-lunch-prep"
  | "meal-prep"
  | "quick-easy"
  | "special-occasion"
  | "student-budget"
  | "vacation-prep"
  | "weekly-essentials";

export type BasketStrategy =
  | "lowest-cost"
  | "healthiest"
  | "bulk-saver"
  | "family"
  | "brand";

/** Filter chips for Results page (drives a re-rank/refilter). */
export type ResultFilter =
  | "all"
  | "budget-saver"
  | "bulk-savings"
  | "family-essentials"
  | "healthy"
  | "high-protein"
  | "organic"
  | "snacks";

export type BudgetSource = "manual" | "ynab" | "mint";
export type PlanDuration = "weekly" | "biweekly" | "monthly";

export interface Household {
  adults: number;
  seniors: number;
  kids: number;
  kidsAges?: string;
  seniorsAges?: string;
}

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
  bulk?: boolean;
  tags?: string[];          // diet tags
  cuisines?: FoodTypeId[];  // food-type tags
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
  weekIndex?: number;       // for biweekly/monthly grouping
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
  /** Total budget the user entered (weekly/biweekly/monthly) — for display only. */
  rawBudget?: number;
  household: number;        // legacy — total people
  householdBreakdown?: Household;
  diets: DietId[];
  foodTypes?: FoodTypeId[];
  motivation?: MotivationId;
  kitchenHave?: string[];   // ids of items already at home
  avoidJunk: boolean;
  preferredBrand?: string;       // legacy single brand (kept for compatibility)
  preferredBrands?: string[];    // multi-select brands
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
  wishlist: string[];
  onboarded: boolean;
}
