"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

export const MAX_CART_ITEMS = 50;
const STORAGE_KEY = "throttleshots_cart";

interface Photo {
  id: string;
  event_id: string;
  image_url_watermarked: string;
  thumbnail_url: string;
  vehicle_type: string;
  color: string;
  price: number;
}

interface CartItem {
  photo: Photo;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (photo: Photo) => boolean;
  removeItem: (photoId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isFull: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage after mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {}
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever items change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, hydrated]);

  const addItem = useCallback((photo: Photo): boolean => {
    let added = false;
    setItems((prev) => {
      if (prev.length >= MAX_CART_ITEMS) return prev;
      const existing = prev.find((item) => item.photo.id === photo.id);
      if (existing) return prev;
      added = true;
      return [...prev, { photo, quantity: 1 }];
    });
    return added;
  }, []);

  const removeItem = useCallback((photoId: string) => {
    setItems((prev) => prev.filter((item) => item.photo.id !== photoId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  const totalItems = items.length;
  const totalPrice = items.reduce((sum, item) => sum + item.photo.price, 0);
  const isFull = items.length >= MAX_CART_ITEMS;

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, totalItems, totalPrice, isFull }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
