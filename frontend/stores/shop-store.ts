"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem, Order } from "@/lib/types";

type ShopState = {
  cart: CartItem[];
  orders: Order[];
  addToCart: (productId: string, variantId: string, quantity?: number) => void;
  removeFromCart: (productId: string, variantId: string) => void;
  setCartQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
  addOrder: (order: Order) => void;
};

const updateCartItem = (
  cart: CartItem[],
  productId: string,
  variantId: string,
  quantity: number
): CartItem[] => {
  const existing = cart.find((item) => item.productId === productId && item.variantId === variantId);
  if (!existing && quantity <= 0) {
    return cart;
  }
  if (!existing) {
    return [...cart, { productId, variantId, quantity }];
  }
  return cart
    .map((item) =>
      item.productId === productId && item.variantId === variantId ? { ...item, quantity } : item
    )
    .filter((item) => item.quantity > 0);
};

export const useShopStore = create<ShopState>()(
  persist(
    (set) => ({
      cart: [],
      orders: [],
      addToCart: (productId, variantId, quantity = 1) =>
        set((state) => {
          const existing = state.cart.find(
            (item) => item.productId === productId && item.variantId === variantId
          );
          const nextQuantity = (existing?.quantity ?? 0) + quantity;
          return { cart: updateCartItem(state.cart, productId, variantId, nextQuantity) };
        }),
      removeFromCart: (productId, variantId) =>
        set((state) => ({
          cart: state.cart.filter(
            (item) => !(item.productId === productId && item.variantId === variantId)
          )
        })),
      setCartQuantity: (productId, variantId, quantity) =>
        set((state) => ({ cart: updateCartItem(state.cart, productId, variantId, quantity) })),
      clearCart: () => set({ cart: [] }),
      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders]
        }))
    }),
    {
      name: "farmley-inspired-shop-store",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true
    }
  )
);
