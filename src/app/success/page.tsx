"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";

export default function SuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-accent"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="font-display text-4xl tracking-wider text-text-primary">
          PAYMENT SUCCESSFUL
        </h1>

        <p className="mt-4 text-text-secondary">
          Thank you for your purchase! Your photos are being prepared.
        </p>

        <div className="mt-6 rounded-xl border border-border bg-bg-card p-6 text-left">
          <h2 className="font-display text-sm tracking-wider text-text-secondary">
            WHAT HAPPENS NEXT
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-accent">→</span>
              You will receive an email with download links for your full-resolution photos.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-accent">→</span>
              If you don&apos;t receive an email within 24 hours, contact us at{" "}
              <a
                href="mailto:hello@throttleshotsmedia.com"
                className="text-accent hover:text-accent-hover underline"
              >
                hello@throttleshotsmedia.com
              </a>
            </li>
          </ul>
        </div>

        <Link
          href="/"
          className="mt-8 inline-block rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          Browse More Photos
        </Link>
      </div>
    </div>
  );
}
