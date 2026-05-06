import { CatalogItem } from "./types";

/**
 * Mocked Walmart-style catalog. Brand + bulk flags drive the
 * Brand Preference and Bulk Saver basket strategies.
 */
export const CATALOG: CatalogItem[] = [
  // produce
  { id: "p1", name: "Bananas (bunch)", brand: "Fresh", category: "produce", price: 1.48, basePrice: 1.78, unit: "bunch", onSale: true, healthScore: 9, tags: ["vegetarian","vegan","gluten-free","dairy-free","halal","kosher","low-carb","family-essentials","budget-saver"] },
  { id: "p2", name: "Gala Apples (3 lb)", brand: "Fresh", category: "produce", price: 3.97, basePrice: 4.97, unit: "bag", onSale: true, healthScore: 9, bulk: true, tags: ["vegetarian","vegan","gluten-free","dairy-free","halal","kosher","family-essentials"] },
  { id: "p3", name: "Baby Spinach", brand: "Marketside", category: "produce", price: 2.48, basePrice: 2.98, unit: "5 oz", onSale: true, healthScore: 10, tags: ["vegetarian","vegan","gluten-free","dairy-free","halal","kosher","keto","low-carb","diabetic-friendly","organic-preferred"] },
  { id: "p4", name: "Roma Tomatoes", brand: "Fresh", category: "produce", price: 1.27, basePrice: 1.27, unit: "lb", onSale: false, healthScore: 9, tags: ["vegetarian","vegan","gluten-free","dairy-free","halal","kosher","keto","low-carb","diabetic-friendly"] },
  { id: "p5", name: "Carrots (2 lb)", brand: "Great Value", category: "produce", price: 1.94, basePrice: 1.94, unit: "bag", onSale: false, healthScore: 9, bulk: true, tags: ["vegetarian","vegan","gluten-free","dairy-free","halal","kosher","family-essentials","budget-saver"] },
  { id: "p6", name: "Avocados (4 ct)", brand: "Fresh", category: "produce", price: 4.48, basePrice: 5.48, unit: "pack", onSale: true, healthScore: 9, tags: ["vegetarian","vegan","gluten-free","dairy-free","halal","kosher","keto","low-carb","diabetic-friendly"] },
  { id: "p7", name: "Broccoli Crowns", brand: "Marketside", category: "produce", price: 1.98, basePrice: 1.98, unit: "lb", onSale: false, healthScore: 10, tags: ["vegetarian","vegan","gluten-free","dairy-free","halal","kosher","keto","low-carb","diabetic-friendly","organic-preferred"] },

  // dairy
  { id: "d1", name: "2% Milk", brand: "Great Value", category: "dairy", price: 3.18, basePrice: 3.68, unit: "gallon", onSale: true, healthScore: 7, bulk: true, tags: ["vegetarian","gluten-free","halal","kosher","family-essentials","budget-saver"] },
  { id: "d2", name: "Large Eggs (dozen)", brand: "Great Value", category: "dairy", price: 3.42, basePrice: 3.42, unit: "dozen", onSale: false, healthScore: 8, tags: ["vegetarian","gluten-free","halal","kosher","keto","low-carb","high-protein","diabetic-friendly","family-essentials"] },
  { id: "d3", name: "Greek Yogurt", brand: "Marketside", category: "dairy", price: 4.96, basePrice: 5.96, unit: "32 oz", onSale: true, healthScore: 8, tags: ["vegetarian","gluten-free","halal","kosher","high-protein","diabetic-friendly"] },
  { id: "d4", name: "Sharp Cheddar Block", brand: "Great Value", category: "dairy", price: 4.27, basePrice: 4.27, unit: "8 oz", onSale: false, healthScore: 6, tags: ["vegetarian","gluten-free","halal","kosher","keto","low-carb"] },
  { id: "d5", name: "Almond Milk", brand: "Silk", category: "dairy", price: 3.68, basePrice: 3.68, unit: "64 oz", onSale: false, healthScore: 8, tags: ["vegetarian","vegan","gluten-free","dairy-free","halal","kosher","low-carb"] },

  // pantry
  { id: "pa1", name: "Brown Rice", brand: "Great Value", category: "pantry", price: 2.78, basePrice: 2.78, unit: "2 lb", onSale: false, healthScore: 8, bulk: true, tags: ["vegetarian","vegan","gluten-free","dairy-free","halal","kosher","family-essentials","budget-saver"] },
  { id: "pa2", name: "Whole Wheat Pasta", brand: "Barilla", category: "pantry", price: 1.24, basePrice: 1.58, unit: "lb", onSale: true, healthScore: 7, tags: ["vegetarian","vegan","dairy-free","halal","kosher","family-essentials","budget-saver"] },
  { id: "pa3", name: "Black Beans (canned)", brand: "Great Value", category: "pantry", price: 0.88, basePrice: 0.88, unit: "15 oz", onSale: false, healthScore: 9, tags: ["vegetarian","vegan","gluten-free","dairy-free","halal","kosher","high-protein","budget-saver","diabetic-friendly"] },
  { id: "pa4", name: "Olive Oil", brand: "Bertolli", category: "pantry", price: 6.97, basePrice: 7.97, unit: "16 oz", onSale: true, healthScore: 8, tags: ["vegetarian","vegan","gluten-free","dairy-free","halal","kosher","keto","low-carb"] },
  { id: "pa5", name: "Old-Fashioned Oats", brand: "Quaker", category: "pantry", price: 3.84, basePrice: 3.84, unit: "42 oz", onSale: false, healthScore: 9, bulk: true, tags: ["vegetarian","vegan","dairy-free","halal","kosher","family-essentials","budget-saver","diabetic-friendly"] },
  { id: "pa6", name: "Peanut Butter", brand: "Great Value", category: "pantry", price: 2.92, basePrice: 3.42, unit: "16 oz", onSale: true, healthScore: 7, tags: ["vegetarian","vegan","gluten-free","dairy-free","halal","kosher","high-protein","family-essentials"] },

  // protein
  { id: "pr1", name: "Chicken Breast", brand: "Tyson", category: "protein", price: 8.97, basePrice: 10.97, unit: "2 lb", onSale: true, healthScore: 8, bulk: true, tags: ["gluten-free","dairy-free","halal","high-protein","keto","low-carb","family-essentials","diabetic-friendly"] },
  { id: "pr2", name: "Ground Turkey", brand: "Jennie-O", category: "protein", price: 4.48, basePrice: 4.48, unit: "lb", onSale: false, healthScore: 8, tags: ["gluten-free","dairy-free","halal","high-protein","keto","low-carb","diabetic-friendly"] },
  { id: "pr3", name: "Wild Salmon Fillet", brand: "Marketside", category: "protein", price: 9.94, basePrice: 11.94, unit: "lb", onSale: true, healthScore: 10, tags: ["gluten-free","dairy-free","halal","kosher","high-protein","keto","low-carb","organic-preferred","diabetic-friendly"] },
  { id: "pr4", name: "Firm Tofu", brand: "House Foods", category: "protein", price: 2.18, basePrice: 2.18, unit: "14 oz", onSale: false, healthScore: 8, tags: ["vegetarian","vegan","gluten-free","dairy-free","halal","kosher","high-protein","low-carb","budget-saver"] },

  // snacks
  { id: "s1", name: "Mixed Nuts", brand: "Great Value", category: "snacks", price: 5.98, basePrice: 6.98, unit: "10 oz", onSale: true, healthScore: 7, tags: ["vegetarian","vegan","gluten-free","dairy-free","halal","kosher","keto","low-carb","high-protein"] },
  { id: "s2", name: "Granola Bars", brand: "Nature Valley", category: "snacks", price: 3.27, basePrice: 3.27, unit: "8 ct", onSale: false, healthScore: 5, tags: ["vegetarian","family-essentials"] },
  { id: "s3", name: "Potato Chips", brand: "Lay's", category: "snacks", price: 2.98, basePrice: 3.98, unit: "8 oz", onSale: true, healthScore: 2, isJunk: true, tags: ["vegetarian","vegan","gluten-free"] },
  { id: "s4", name: "Chocolate Cookies", brand: "Oreo", category: "snacks", price: 2.48, basePrice: 2.98, unit: "pack", onSale: true, healthScore: 1, isJunk: true, tags: ["vegetarian"] },
  { id: "s5", name: "Hummus Tub", brand: "Sabra", category: "snacks", price: 3.48, basePrice: 3.48, unit: "10 oz", onSale: false, healthScore: 8, tags: ["vegetarian","vegan","gluten-free","dairy-free","halal","kosher","low-carb"] },

  // beverages
  { id: "b1", name: "Sparkling Water (8 pk)", brand: "Great Value", category: "beverages", price: 3.96, basePrice: 4.96, unit: "8 pk", onSale: true, healthScore: 9, bulk: true, tags: ["vegetarian","vegan","gluten-free","dairy-free","halal","kosher","keto","low-carb","diabetic-friendly"] },
  { id: "b2", name: "Orange Juice", brand: "Tropicana", category: "beverages", price: 3.48, basePrice: 3.48, unit: "59 oz", onSale: false, healthScore: 5, tags: ["vegetarian","vegan","gluten-free","dairy-free","halal","kosher","family-essentials"] },
  { id: "b3", name: "Cola 12-pack", brand: "Coca-Cola", category: "beverages", price: 6.48, basePrice: 7.48, unit: "12 pk", onSale: true, healthScore: 1, isJunk: true, tags: ["vegetarian","vegan"] },
  { id: "b4", name: "Cold Brew Coffee", brand: "Starbucks", category: "beverages", price: 4.97, basePrice: 4.97, unit: "32 oz", onSale: false, healthScore: 7, tags: ["vegetarian","vegan","gluten-free","dairy-free","halal","kosher","low-carb"] },
];

export const ALL_BRANDS = Array.from(new Set(CATALOG.map(c => c.brand).filter(Boolean))) as string[];
