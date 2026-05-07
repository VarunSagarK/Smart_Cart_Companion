import { CATALOG } from "./mockCatalog";
import { Deal } from "./types";

/**
 * Mocked Flipp-style weekly circulars. Replace with a real Flipp API
 * call later — same Deal[] shape.
 */
export const DEALS: Deal[] = CATALOG.filter(i => i.onSale).map(i => ({
  itemId: i.id,
  source: "Walmart Weekly",
  label: `Save $${(i.basePrice - i.price).toFixed(2)}`,
  savings: +(i.basePrice - i.price).toFixed(2),
}));

export const dealForItem = (itemId: string) => DEALS.find(d => d.itemId === itemId);
