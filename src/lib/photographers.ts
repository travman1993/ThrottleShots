export interface Photographer {
  id: string;
  name: string;
  /** Stripe Connect account ID. Null = platform owner (Travis), funds stay in main account. */
  stripeAccountId: string | null;
}

export const PHOTOGRAPHERS: Photographer[] = [
  {
    id: "travis",
    name: "Travis",
    stripeAccountId: null, // platform owner — no transfer needed
  },
  {
    id: "chris",
    name: "Chris",
    stripeAccountId: process.env.CHRIS_STRIPE_ACCOUNT_ID || null,
  },
];

export function getPhotographer(id: string | null | undefined): Photographer {
  if (!id) return PHOTOGRAPHERS[0];
  return PHOTOGRAPHERS.find((p) => p.id === id) ?? PHOTOGRAPHERS[0];
}
