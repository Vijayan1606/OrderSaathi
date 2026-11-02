"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { Product, SchemeCalculationResult, Scheme } from "@/types";
import { calculateOrderSchemes } from "@/lib/schemes/engine";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  itemCount: number;
  calculation: SchemeCalculationResult;
  schemes: Scheme[];
  notes: string;
  setNotes: (notes: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({
  children,
  initialSchemes = [],
}: {
  children: React.ReactNode;
  initialSchemes?: Scheme[];
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>(initialSchemes);
  const [notes, setNotes] = useState("");

  // Hydrate cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ordersaathi_cart");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Failed to read cart from local storage", e);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("ordersaathi_cart", JSON.stringify(items));
    } catch (e) {
      console.warn("Failed to persist cart", e);
    }
  }, [items]);

  const addToCart = (product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    );
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
    setNotes("");
  };

  const itemCount = useMemo(
    () => items.reduce((acc, it) => acc + it.quantity, 0),
    [items]
  );

  // Calculate order schemes whenever items change
  const calculation = useMemo(() => {
    return calculateOrderSchemes(items, schemes);
  }, [items, schemes]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        itemCount,
        calculation,
        schemes,
        notes,
        setNotes,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
