"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Photo, CartItem } from "@/data/mock";

interface CartContextType {
  items: CartItem[];
  addItem: (photo: Photo) => void;
  removeItem: (photoId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((photo: Photo) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.photo.id === photo.id);
      if (existing) return prev;
      return [...prev, { photo, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((photoId: string) => {
    setItems((prev) => prev.filter((item) => item.photo.id !== photoId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.length;
  const totalPrice = items.reduce((sum, item) => sum + item.photo.price, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}