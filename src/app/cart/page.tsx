/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { PRICING, calculateCartTotal, calculateSavings } from "@/lib/pricing";

export default function CartPage() {
  const { items, removeItem, clearCart } = useCart();
  const total = calculateCartTotal(items.length);
  const savings = calculateSavings(items.length);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setCheckingOut(true);
    setCheckoutError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoIds: items.map((i) => i.photo.id) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCheckoutError(data.error || "Checkout failed. Please try again.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setCheckoutError("Something went wrong. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl tracking-wider text-text-primary">YOUR CART</h1>

      {/* Pricing tiers */}
      <div className="mt-6 grid grid-cols-4 gap-2">
        {[
          { label: "1–4 photos", rate: "$9.99", active: items.length >= 1 && items.length <= 4, savings: null },
          { label: "5–10 photos", rate: "$7.99", active: items.length >= 5 && items.length <= 10, savings: "Save 20%" },
          { label: "11–20 photos", rate: "$5.99", active: items.length >= 11 && items.length <= 20, savings: "Save 40%" },
          { label: "21–50 photos", rate: "$4.99", active: items.length >= 21, savings: "Save 50%" },
        ].map((tier) => (
          <div
            key={tier.label}
            className={`rounded-lg border p-3 text-center ${tier.active ? "border-accent bg-accent/10" : "border-border bg-bg-card"}`}
          >
            <p className="font-display text-base text-text-primary">{tier.rate}</p>
            <p className="text-[11px] text-text-secondary">{tier.label}</p>
            {tier.savings && <p className="text-[10px] text-accent">{tier.savings}</p>}
          </div>
        ))}
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
                <span className="text-text-secondary">{items.length} photo{items.length !== 1 ? "s" : ""} at $9.99 each</span>
                <span className="text-text-secondary">${(items.length * PRICING.base).toFixed(2)}</span>
              </div>
              {savings > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-accent">Volume discount</span>
                  <span className="text-accent">-${savings.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-border pt-2">
                <span className="text-text-primary font-medium">Total</span>
                <span className="font-display text-3xl text-text-primary">${total.toFixed(2)}</span>
              </div>
              {savings > 0 && (
                <p className="text-center text-xs text-accent">You're saving ${savings.toFixed(2)} with volume pricing!</p>
              )}
            </div>
            {checkoutError && (
              <p className="mt-4 text-center text-sm text-red-400">{checkoutError}</p>
            )}
            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className={`mt-6 w-full rounded-lg py-3 text-sm font-semibold transition-colors ${
                checkingOut
                  ? "bg-bg-elevated text-text-muted cursor-not-allowed"
                  : "bg-accent text-white hover:bg-accent-hover"
              }`}
            >
              {checkingOut ? "Processing..." : "Checkout"}
            </button>
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