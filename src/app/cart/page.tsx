/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { PRICING, calculateCartTotal } from "@/lib/pricing";

export default function CartPage() {
  const { items, removeItem, clearCart } = useCart();
  const total = calculateCartTotal(items.length);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl tracking-wider text-text-primary">YOUR CART</h1>

      {/* Pricing tiers */}
      <div className="mt-6 flex gap-3">
        <div className={`flex-1 rounded-lg border p-3 text-center ${items.length >= 1 && items.length < 3 ? "border-accent bg-accent/10" : "border-border bg-bg-card"}`}>
          <p className="font-display text-lg text-text-primary">$9.99</p>
          <p className="text-xs text-text-secondary">per photo</p>
        </div>
        <div className={`flex-1 rounded-lg border p-3 text-center ${items.length >= 3 && items.length < 5 ? "border-accent bg-accent/10" : "border-border bg-bg-card"}`}>
          <p className="font-display text-lg text-text-primary">$19.99</p>
          <p className="text-xs text-text-secondary">3 photos</p>
          <p className="text-[10px] text-accent">Save $10</p>
        </div>
        <div className={`flex-1 rounded-lg border p-3 text-center ${items.length >= 5 ? "border-accent bg-accent/10" : "border-border bg-bg-card"}`}>
          <p className="font-display text-lg text-text-primary">$29.99</p>
          <p className="text-xs text-text-secondary">5 photos</p>
          <p className="text-[10px] text-accent">Save $20</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-text-muted">Your cart is empty.</p>
          <Link href="/" className="mt-4 inline-block text-sm text-accent hover:text-accent-hover">
            Browse photos →
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-8 space-y-4">
            {items.map((item) => (
              <div key={item.photo.id} className="flex gap-4 rounded-xl border border-border bg-bg-card p-4">
                <div className="relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-lg">
                  <img
                    src={item.photo.thumbnail_url}
                    alt={`${item.photo.color} ${item.photo.vehicle_type}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 items-center justify-between">
                  <div>
                    <p className="text-sm font-medium capitalize text-text-primary">
                      {item.photo.color ? `${item.photo.color} ` : ""}{item.photo.vehicle_type}
                    </p>
                    <p className="mt-1 text-sm text-text-secondary">${item.photo.price}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.photo.id)}
                    className="text-xs text-text-muted transition-colors hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-border bg-bg-card p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">{items.length} photo{items.length !== 1 ? "s" : ""}</span>
                <span className="text-text-secondary">${(items.length * PRICING.single).toFixed(2)}</span>
              </div>
              {total < items.length * PRICING.single && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-accent">Bundle discount</span>
                  <span className="text-accent">
                    -${(items.length * PRICING.single - total).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-border pt-2">
                <span className="text-text-primary font-medium">Total</span>
                <span className="font-display text-3xl text-text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
            <button
              disabled
              className="mt-6 w-full rounded-lg bg-bg-elevated py-3 text-sm font-semibold text-text-muted cursor-not-allowed"
              title="Payment coming soon"
            >
              Checkout — Coming Soon
            </button>
            <p className="mt-2 text-center text-xs text-text-muted">
              Payment integration in progress. Contact us to arrange your purchase.
            </p>
            <button
              onClick={clearCart}
              className="mt-3 w-full text-center text-xs text-text-muted transition-colors hover:text-text-secondary"
            >
              Clear Cart
            </button>
          </div>
        </>
      )}
    </div>
  );
}