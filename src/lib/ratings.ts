/**
 * Deterministic pseudo-random rating generator.
 * Given an item id, always returns the same rating + review count.
 * No randomness at render time — stable across re-renders and reloads.
 */

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Returns a rating between 3.5 and 4.9, always the same for a given id. */
export function itemRating(id: string): number {
  const h = hash(id + "rating");
  // 0–14 maps to 3.5–4.9 in 0.1 steps
  return +(3.5 + (h % 15) * 0.1).toFixed(1);
}

/** Returns a review count between 48 and 3200, always the same for a given id. */
export function itemReviewCount(id: string): number {
  const h = hash(id + "reviews");
  return 48 + (h % 3153);
}

/** Render star string e.g. "★★★★½" — up to 5 chars */
export function starsDisplay(rating: number): string {
  const full = Math.floor(rating);
  const half = rating - full >= 0.3 && rating - full < 0.8;
  const empty = 5 - full - (half ? 1 : 0);
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
}
