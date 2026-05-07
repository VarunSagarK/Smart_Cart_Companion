import { CatalogItem } from "./types";

/**
 * Mocked Walmart-style catalog. Brand + bulk flags drive the
 * Brand Preference and Bulk Saver basket strategies.
 * cuisines drives Food-Type filters from AI onboarding.
 *
 * Each item carries a realistic catalog-style product image (Unsplash),
 * with graceful emoji fallback in <ProductImage /> when an URL fails.
 */

const u = (id: string) => `https://images.unsplash.com/${id}?w=400&q=80&auto=format&fit=crop`;

export const CATALOG: CatalogItem[] = [
  // produce
  { id: "p1", name: "Bananas (bunch)", brand: "Fresh", category: "produce", price: 1.48, basePrice: 1.78, unit: "bunch", onSale: true, healthScore: 9, tags: ["vegetarian","vegan","gluten-free","dairy-free","halal","kosher","low-carb","family-essentials","budget-saver"], cuisines: ["american","quick-meals"], image: u("photo-1571771894821-ce9b6c11b08e") },
  { id: "p2", name: "Gala Apples (3 lb)", brand: "Fresh", category: "produce", price: 3.97, basePrice: 4.97, unit: "bag", onSale: true, healthScore: 9, bulk: true, tags: ["vegetarian","vegan","gluten-free","dairy-free","halal","kosher","family-essentials"], cuisines: ["american","quick-meals"], image: u("photo-1560806887-1e4cd0b6cbd6") },
  { id: "p3", name: "Baby Spinach", brand: "Marketside", category: "produce", price: 2.48, basePrice: 2.98, unit: "5 oz", onSale: true, healthScore: 10, tags: ["vegetarian","vegan","gluten-free","dairy-free","halal","kosher","keto","low-carb","diabetic-friendly","organic-preferred"], cuisines: ["mediterranean","organic","quick-meals"], image: u("photo-1651427660796-1bc57aafa229") },
  { id: "p4", name: "Roma Tomatoes", brand: "Fresh", category: "produce", price: 1.27, basePrice: 1.27, unit: "lb", onSale: false, healthScore: 9, tags: ["vegetarian","vegan","gluten-free","dairy-free","halal","kosher","keto","low-carb","diabetic-friendly"], cuisines: ["italian","mexican","mediterranean"], image: u("photo-1524593166156-312f362cada0") },
  { id: "p5", name: "Carrots (2 lb)", brand: "Great Value", category: "produce", price: 1.94, basePrice: 1.94, unit: "bag", onSale: false, healthScore: 9, bulk: true, tags: ["vegetarian","vegan","gluten-free","dairy-free","halal","kosher","family-essentials","budget-saver"], cuisines: ["american","comfort"], image: u("photo-1598170845058-32b9d6a5da37") },
  { id: "p6", name: "Avocados (4 ct)", brand: "Fresh", category: "produce", price: 4.48, basePrice: 5.48, unit: "pack", onSale: true, healthScore: 9, tags: ["vegetarian","vegan","gluten-free","dairy-free","halal","kosher","keto","low-carb","diabetic-friendly"], cuisines: ["mexican","quick-meals"], image: u("photo-1523049673857-eb18f1d7b578") },
  { id: "p7", name: "Broccoli Crowns", brand: "Marketside", category: "produce", price: 1.98, basePrice: 1.98, unit: "lb", onSale: false, healthScore: 10, tags: ["vegetarian","vegan","gluten-free","dairy-free","halal","kosher","keto","low-carb","diabetic-friendly","organic-preferred"], cuisines: ["asian","chinese","organic"], image: u("photo-1615485290382-441e4d049cb5") },

  // dairy
  { id: "d1", name: "2% Milk", brand: "Great Value", category: "dairy", price: 3.18, basePrice: 3.68, unit: "gallon", onSale: true, healthScore: 7, bulk: true, tags: ["vegetarian","gluten-free","halal","kosher","family-essentials","budget-saver"], cuisines: ["american","comfort"], image: u("photo-1634141510639-d691d86f47be") },
  { id: "d2", name: "Large Eggs (dozen)", brand: "Great Value", category: "dairy", price: 3.42, basePrice: 3.42, unit: "dozen", onSale: false, healthScore: 8, tags: ["vegetarian","gluten-free","halal","kosher","keto","low-carb","high-protein","diabetic-friendly","family-essentials"], cuisines: ["american","quick-meals"], image: u("photo-1506976785307-8732e854ad03") },
  { id: "d3", name: "Greek Yogurt", brand: "Marketside", category: "dairy", price: 4.96, basePrice: 5.96, unit: "32 oz", onSale: true, healthScore: 8, tags: ["vegetarian","gluten-free","halal","kosher","high-protein","diabetic-friendly"], cuisines: ["mediterranean","middle-eastern"], image: u("photo-1562114808-b4b33cf60f4f") },
  { id: "d4", name: "Sharp Cheddar Block", brand: "Great Value", category: "dairy", price: 4.27, basePrice: 4.27, unit: "8 oz", onSale: false, healthScore: 6, tags: ["vegetarian","gluten-free","halal","kosher","keto","low-carb"], cuisines: ["american","comfort"], image: u("photo-1683314573422-649a3c6ad784") },
  { id: "d5", name: "Almond Milk", brand: "Silk", category: "dairy", price: 3.68, basePrice: 3.68, unit: "64 oz", onSale: false, healthScore: 8, tags: ["vegetarian","vegan","gluten-free","dairy-free","halal","kosher","low-carb"], cuisines: ["american","organic"], image: u("photo-1556881286-fc6915169721") },

  // pantry
  { id: "pa1", name: "Brown Rice", brand: "Great Value", category: "pantry", price: 2.78, basePrice: 2.78, unit: "2 lb", onSale: false, healthScore: 8, bulk: true, tags: ["vegetarian","vegan","gluten-free","dairy-free","halal","kosher","family-essentials","budget-saver"], cuisines: ["asian","chinese","indian"], image: u("photo-1586201375761-83865001e31c") },
  { id: "pa2", name: "Whole Wheat Pasta", brand: "Barilla", category: "pantry", price: 1.24, basePrice: 1.58, unit: "lb", onSale: true, healthScore: 7, tags: ["vegetarian","vegan","dairy-free","halal","kosher","family-essentials","budget-saver"], cuisines: ["italian","comfort","quick-meals"], image: u("photo-1551462147-37885acc36f1") },
  { id: "pa3", name: "Black Beans (canned)", brand: "Great Value", category: "pantry", price: 0.88, basePrice: 0.88, unit: "15 oz", onSale: false, healthScore: 9, tags: ["vegetarian","vegan","gluten-free","dairy-free","halal","kosher","high-protein","budget-saver","diabetic-friendly"], cuisines: ["mexican","quick-meals"], image: u("photo-1564894809611-1742fc40ed80") },
  { id: "pa4", name: "Olive Oil", brand: "Bertolli", category: "pantry", price: 6.97, basePrice: 7.97, unit: "16 oz", onSale: true, healthScore: 8, tags: ["vegetarian","vegan","gluten-free","dairy-free","halal","kosher","keto","low-carb"], cuisines: ["italian","mediterranean"], image: u("photo-1474979266404-7eaacbcd87c5") },
  { id: "pa5", name: "Old-Fashioned Oats", brand: "Quaker", category: "pantry", price: 3.84, basePrice: 3.84, unit: "42 oz", onSale: false, healthScore: 9, bulk: true, tags: ["vegetarian","vegan","dairy-free","halal","kosher","family-essentials","budget-saver","diabetic-friendly"], cuisines: ["american","quick-meals"], image: u("photo-1614373532018-92a75430a0da") },
  { id: "pa6", name: "Peanut Butter", brand: "Great Value", category: "pantry", price: 2.92, basePrice: 3.42, unit: "16 oz", onSale: true, healthScore: 7, tags: ["vegetarian","vegan","gluten-free","dairy-free","halal","kosher","high-protein","family-essentials"], cuisines: ["american","comfort"], image: u("photo-1615110250484-e8c3b151b957") },

  // protein
  { id: "pr1", name: "Chicken Breast", brand: "Tyson", category: "protein", price: 8.97, basePrice: 10.97, unit: "2 lb", onSale: true, healthScore: 8, bulk: true, tags: ["gluten-free","dairy-free","halal","high-protein","keto","low-carb","family-essentials","diabetic-friendly"], cuisines: ["american","indian","mexican","mediterranean","quick-meals"], image: u("photo-1587593810167-a84920ea0781") },
  { id: "pr2", name: "Ground Turkey", brand: "Jennie-O", category: "protein", price: 4.48, basePrice: 4.48, unit: "lb", onSale: false, healthScore: 8, tags: ["gluten-free","dairy-free","halal","high-protein","keto","low-carb","diabetic-friendly"], cuisines: ["american","mexican","comfort"], image: u("photo-1602470520998-f4a52199a3d6") },
  { id: "pr3", name: "Wild Salmon Fillet", brand: "Marketside", category: "protein", price: 9.94, basePrice: 11.94, unit: "lb", onSale: true, healthScore: 10, tags: ["gluten-free","dairy-free","halal","kosher","high-protein","keto","low-carb","organic-preferred","diabetic-friendly"], cuisines: ["seafood","mediterranean","asian"], image: u("photo-1499125562588-29fb8a56b5d5") },
  { id: "pr4", name: "Firm Tofu", brand: "House Foods", category: "protein", price: 2.18, basePrice: 2.18, unit: "14 oz", onSale: false, healthScore: 8, tags: ["vegetarian","vegan","gluten-free","dairy-free","halal","kosher","high-protein","low-carb","budget-saver"], cuisines: ["asian","chinese","vegetarian-comfort"], image: u("photo-1722635940350-d1b2e5129379") },

  // snacks
  { id: "s1", name: "Mixed Nuts", brand: "Great Value", category: "snacks", price: 5.98, basePrice: 6.98, unit: "10 oz", onSale: true, healthScore: 7, tags: ["vegetarian","vegan","gluten-free","dairy-free","halal","kosher","keto","low-carb","high-protein"], cuisines: ["snacks","mediterranean"], image: u("photo-1600189020840-e3dbc646d9a9") },
  { id: "s2", name: "Granola Bars", brand: "Nature Valley", category: "snacks", price: 3.27, basePrice: 3.27, unit: "8 ct", onSale: false, healthScore: 5, tags: ["vegetarian","family-essentials"], cuisines: ["snacks","quick-meals"], image: u("photo-1613919113640-25732ec5e61f") },
  { id: "s3", name: "Potato Chips", brand: "Lay's", category: "snacks", price: 2.98, basePrice: 3.98, unit: "8 oz", onSale: true, healthScore: 2, isJunk: true, tags: ["vegetarian","vegan","gluten-free"], cuisines: ["snacks","comfort"], image: u("photo-1621939514649-280e2ee25f60") },
  { id: "s4", name: "Chocolate Cookies", brand: "Oreo", category: "snacks", price: 2.48, basePrice: 2.98, unit: "pack", onSale: true, healthScore: 1, isJunk: true, tags: ["vegetarian"], cuisines: ["snacks","comfort"], image: u("photo-1598839950984-034f6dc7b495") },
  { id: "s5", name: "Hummus Tub", brand: "Sabra", category: "snacks", price: 3.48, basePrice: 3.48, unit: "10 oz", onSale: false, healthScore: 8, tags: ["vegetarian","vegan","gluten-free","dairy-free","halal","kosher","low-carb"], cuisines: ["middle-eastern","mediterranean","snacks"], image: u("photo-1593001874117-c99c800e3eb7") },

  // beverages
  { id: "b1", name: "Sparkling Water (8 pk)", brand: "Great Value", category: "beverages", price: 3.96, basePrice: 4.96, unit: "8 pk", onSale: true, healthScore: 9, bulk: true, tags: ["vegetarian","vegan","gluten-free","dairy-free","halal","kosher","keto","low-carb","diabetic-friendly"], cuisines: ["american"], image: u("photo-1625865019554-220ea80ea813") },
  { id: "b2", name: "Orange Juice", brand: "Tropicana", category: "beverages", price: 3.48, basePrice: 3.48, unit: "59 oz", onSale: false, healthScore: 5, tags: ["vegetarian","vegan","gluten-free","dairy-free","halal","kosher","family-essentials"], cuisines: ["american"], image: u("photo-1577680716097-9a565ddc2007") },
  { id: "b3", name: "Cola 12-pack", brand: "Coca-Cola", category: "beverages", price: 6.48, basePrice: 7.48, unit: "12 pk", onSale: true, healthScore: 1, isJunk: true, tags: ["vegetarian","vegan"], cuisines: ["american","comfort"], image: u("photo-1624552184280-9e9631bbeee9") },
  { id: "b4", name: "Cold Brew Coffee", brand: "Starbucks", category: "beverages", price: 4.97, basePrice: 4.97, unit: "32 oz", onSale: false, healthScore: 7, tags: ["vegetarian","vegan","gluten-free","dairy-free","halal","kosher","low-carb"], cuisines: ["american"], image: u("photo-1517701604599-bb29b565090c") },
];

/** Distinct brand list, alphabetically sorted for clean dropdown UX. */
export const ALL_BRANDS = Array.from(new Set(CATALOG.map(c => c.brand).filter(Boolean) as string[])).sort((a, b) =>
  a.localeCompare(b),
);

/** Common kitchen-have basics — alphabetical by label. */
export const KITCHEN_BASICS: { id: string; label: string; emoji: string }[] = [
  { id: "p1", label: "Bananas", emoji: "🍌" },
  { id: "pa2", label: "Bread / Pasta", emoji: "🍞" },
  { id: "d2", label: "Eggs", emoji: "🥚" },
  { id: "d1", label: "Milk", emoji: "🥛" },
  { id: "pa4", label: "Oil", emoji: "🫒" },
  { id: "pa6", label: "Peanut Butter", emoji: "🥜" },
  { id: "pa1", label: "Rice", emoji: "🍚" },
  { id: "s2", label: "Snacks", emoji: "🍪" },
];

/** Category-level fallback emoji used by ProductImage when an image errors. */
export const CATEGORY_EMOJI: Record<string, string> = {
  produce: "🥬",
  dairy: "🥛",
  pantry: "🥫",
  snacks: "🍿",
  beverages: "🥤",
  protein: "🍗",
};
