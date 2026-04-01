export const PRICING = {
  single: 9.99,
  bundle3: 19.99,
  bundle5: 29.99,
};

export function calculateCartTotal(itemCount: number): number {
  if (itemCount === 0) return 0;

  let remaining = itemCount;
  let total = 0;

  const fivePacks = Math.floor(remaining / 5);
  total += fivePacks * PRICING.bundle5;
  remaining -= fivePacks * 5;

  const threePacks = Math.floor(remaining / 3);
  total += threePacks * PRICING.bundle3;
  remaining -= threePacks * 3;

  total += remaining * PRICING.single;

  return Math.round(total * 100) / 100;
}
