"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export function CartIconClient() {
  const { totalItems } = useCart();

  return (
    <Link
      href="/cart"
      className="relative text-text-secondary transition-colors hover:text-text-primary"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
      {totalItems > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
          {totalItems}
        </span>
      )}
    </Link>
  );
}