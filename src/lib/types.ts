export type Category = "produce" | "dairy" | "pantry" | "snacks" | "beverages" | "protein";

export interface CatalogItem {
  id: string;
  name: string;
  category: Category;
  price: number;        // current shelf price
  basePrice: number;    // non-sale reference price
  unit: string;
  onSale: boolean;
  healthScore: number;  // 0-10 (10 = healthiest)
  isJunk?: boolean;
  tags?: string[];      // e.g. "vegetarian", "gluten-free", "low-sugar"
}

export interface Deal {
  itemId: string;
  source: string;     // e.g. "Flipp / Walmart Weekly"
  label: string;      // e.g. "20% off"
  savings: number;    // dollars off vs basePrice
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
}

export interface Preferences {
  weeklyBudget: number;
  household: number;
  diets: string[];          // ["vegetarian", "gluten-free", "low-sugar"]
  avoidJunk: boolean;
}

export interface PurchaseRecord {
  id: string;
  date: string;       // ISO
  total: number;
  savings: number;
  budget: number;
  itemCount: number;
}

export interface DemoState {
  prefs: Preferences;
  basket: Basket | null;
  history: PurchaseRecord[];
}
