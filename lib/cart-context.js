"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "lotus-bleu-cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = (product) => {
    setItems((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev;
      return [...prev, { id: product.id, name: product.name, price: product.price }];
    });
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearCart = () => setItems([]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.price), 0),
    [items]
  );

  const value = { items, addItem, removeItem, clearCart, total };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans un CartProvider");
  return ctx;
}
