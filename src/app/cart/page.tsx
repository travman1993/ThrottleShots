"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart";

export default function CartPage() {
  const { items, removeItem, clearCart, totalPrice } = useCart();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl tracking-wider text-text-primary">YOUR CART</h1>

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
                  <Image
                    src={item.photo.thumbnail_url}
                    alt={`${item.photo.color} ${item.photo.vehicle_type}`}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </div>
                <div className="flex flex-1 items-center justify-between">
                  <div>
                    <p className="text-sm font-medium capitalize text-text-primary">
                      {item.photo.color} {item.photo.vehicle_type}
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
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Total</span>
              <span className="font-display text-3xl text-text-primary">${totalPrice.toFixed(2)}</span>
            </div>
            <button className="mt-6 w-full rounded-lg bg-accent py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover active:scale-[0.98]">
              Checkout with Stripe
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