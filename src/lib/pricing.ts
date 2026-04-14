export const PRICING = {
  base: 9.99,   // baseline used for savings calculations
  tier1: 9.99,  // 1–4 photos
  tier2: 7.99,  // 5–10 photos
  tier3: 5.99,  // 11–20 photos
  tier4: 4.99,  // 21–50 photos
};

export const MAX_PHOTOS = 50;

export function getTierRate(itemCount: number): number {
  if (itemCount >= 21) return PRICING.tier4;
  if (itemCount >= 11) return PRICING.tier3;
  if (itemCount >= 5)  return PRICING.tier2;
  return PRICING.tier1;
}

export function calculateCartTotal(itemCount: number): number {
  if (itemCount === 0) return 0;
  const rate = getTierRate(itemCount);
  return Math.round(itemCount * rate * 100) / 100;
}

export function calculateSavings(itemCount: number): number {
  if (itemCount === 0) return 0;
  const fullPrice = Math.round(itemCount * PRICING.base * 100) / 100;
  const discounted = calculateCartTotal(itemCount);
  return Math.round((fullPrice - discounted) * 100) / 100;
}
