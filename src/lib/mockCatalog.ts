import { CatalogItem } from "./types";

/**
 * Mocked Walmart-style catalog. Swap this module for a real API call
 * (e.g. Walmart Open Catalog) without touching the budget engine.
 */
export const CATALOG: CatalogItem[] = [
  // produce
  { id: "p1", name: "Bananas (bunch)", category: "produce", price: 1.48, basePrice: 1.78, unit: "bunch", onSale: true, healthScore: 9, tags: ["vegetarian", "gluten-free"] },
  { id: "p2", name: "Gala Apples (3 lb)", category: "produce", price: 3.97, basePrice: 4.97, unit: "bag", onSale: true, healthScore: 9, tags: ["vegetarian", "gluten-free"] },
  { id: "p3", name: "Baby Spinach", category: "produce", price: 2.48, basePrice: 2.98, unit: "5 oz", onSale: true, healthScore: 10, tags: ["vegetarian", "gluten-free", "low-sugar"] },
  { id: "p4", name: "Roma Tomatoes", category: "produce", price: 1.27, basePrice: 1.27, unit: "lb", onSale: false, healthScore: 9, tags: ["vegetarian", "gluten-free", "low-sugar"] },
  { id: "p5", name: "Carrots (2 lb)", category: "produce", price: 1.94, basePrice: 1.94, unit: "bag", onSale: false, healthScore: 9, tags: ["vegetarian", "gluten-free"] },
  { id: "p6", name: "Avocados (4 ct)", category: "produce", price: 4.48, basePrice: 5.48, unit: "pack", onSale: true, healthScore: 9, tags: ["vegetarian", "gluten-free", "low-sugar"] },

  // dairy
  { id: "d1", name: "Great Value 2% Milk", category: "dairy", price: 3.18, basePrice: 3.68, unit: "gallon", onSale: true, healthScore: 7, tags: ["vegetarian"] },
  { id: "d2", name: "Large Eggs (dozen)", category: "dairy", price: 3.42, basePrice: 3.42, unit: "dozen", onSale: false, healthScore: 8, tags: ["vegetarian", "gluten-free", "low-sugar"] },
  { id: "d3", name: "Greek Yogurt", category: "dairy", price: 4.96, basePrice: 5.96, unit: "32 oz", onSale: true, healthScore: 8, tags: ["vegetarian", "gluten-free", "low-sugar"] },
  { id: "d4", name: "Sharp Cheddar Block", category: "dairy", price: 4.27, basePrice: 4.27, unit: "8 oz", onSale: false, healthScore: 6, tags: ["vegetarian", "gluten-free"] },

  // pantry
  { id: "pa1", name: "Brown Rice (2 lb)", category: "pantry", price: 2.78, basePrice: 2.78, unit: "bag", onSale: false, healthScore: 8, tags: ["vegetarian", "gluten-free"] },
  { id: "pa2", name: "Whole Wheat Pasta", category: "pantry", price: 1.24, basePrice: 1.58, unit: "lb", onSale: true, healthScore: 7, tags: ["vegetarian"] },
  { id: "pa3", name: "Black Beans (canned)", category: "pantry", price: 0.88, basePrice: 0.88, unit: "15 oz", onSale: false, healthScore: 9, tags: ["vegetarian", "gluten-free", "low-sugar"] },
  { id: "pa4", name: "Olive Oil", category: "pantry", price: 6.97, basePrice: 7.97, unit: "16 oz", onSale: true, healthScore: 8, tags: ["vegetarian", "gluten-free", "low-sugar"] },
  { id: "pa5", name: "Old-Fashioned Oats", category: "pantry", price: 3.84, basePrice: 3.84, unit: "42 oz", onSale: false, healthScore: 9, tags: ["vegetarian", "low-sugar"] },
  { id: "pa6", name: "Peanut Butter", category: "pantry", price: 2.92, basePrice: 3.42, unit: "16 oz", onSale: true, healthScore: 7, tags: ["vegetarian", "gluten-free"] },

  // protein
  { id: "pr1", name: "Chicken Breast (2 lb)", category: "protein", price: 8.97, basePrice: 10.97, unit: "pack", onSale: true, healthScore: 8, tags: ["gluten-free", "low-sugar"] },
  { id: "pr2", name: "Ground Turkey (1 lb)", category: "protein", price: 4.48, basePrice: 4.48, unit: "lb", onSale: false, healthScore: 8, tags: ["gluten-free", "low-sugar"] },
  { id: "pr3", name: "Wild Salmon Fillet", category: "protein", price: 9.94, basePrice: 11.94, unit: "lb", onSale: true, healthScore: 10, tags: ["gluten-free", "low-sugar"] },
  { id: "pr4", name: "Firm Tofu", category: "protein", price: 2.18, basePrice: 2.18, unit: "14 oz", onSale: false, healthScore: 8, tags: ["vegetarian", "gluten-free", "low-sugar"] },

  // snacks
  { id: "s1", name: "Mixed Nuts", category: "snacks", price: 5.98, basePrice: 6.98, unit: "10 oz", onSale: true, healthScore: 7, tags: ["vegetarian", "gluten-free", "low-sugar"] },
  { id: "s2", name: "Granola Bars", category: "snacks", price: 3.27, basePrice: 3.27, unit: "8 ct", onSale: false, healthScore: 5, tags: ["vegetarian"] },
  { id: "s3", name: "Potato Chips", category: "snacks", price: 2.98, basePrice: 3.98, unit: "8 oz", onSale: true, healthScore: 2, isJunk: true, tags: ["vegetarian"] },
  { id: "s4", name: "Chocolate Cookies", category: "snacks", price: 2.48, basePrice: 2.98, unit: "pack", onSale: true, healthScore: 1, isJunk: true, tags: ["vegetarian"] },
  { id: "s5", name: "Hummus Tub", category: "snacks", price: 3.48, basePrice: 3.48, unit: "10 oz", onSale: false, healthScore: 8, tags: ["vegetarian", "gluten-free", "low-sugar"] },

  // beverages
  { id: "b1", name: "Sparkling Water (8 pk)", category: "beverages", price: 3.96, basePrice: 4.96, unit: "8 pk", onSale: true, healthScore: 9, tags: ["vegetarian", "gluten-free", "low-sugar"] },
  { id: "b2", name: "Orange Juice", category: "beverages", price: 3.48, basePrice: 3.48, unit: "59 oz", onSale: false, healthScore: 5, tags: ["vegetarian", "gluten-free"] },
  { id: "b3", name: "Cola 12-pack", category: "beverages", price: 6.48, basePrice: 7.48, unit: "12 pk", onSale: true, healthScore: 1, isJunk: true, tags: ["vegetarian"] },
  { id: "b4", name: "Cold Brew Coffee", category: "beverages", price: 4.97, basePrice: 4.97, unit: "32 oz", onSale: false, healthScore: 7, tags: ["vegetarian", "gluten-free", "low-sugar"] },
];
