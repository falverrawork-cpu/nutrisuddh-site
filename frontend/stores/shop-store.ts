"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem, Order } from "@/lib/types";
import { type DiscountCode } from "@/lib/pricing";

type ShopState = {
  cart: CartItem[];
  orders: Order[];
  appliedCouponCode: DiscountCode | null;
  addToCart: (productId: string, variantId: string, quantity?: number) => void;
  removeFromCart: (productId: string, variantId: string) => void;
  setCartQuantity: (productId: string, variantId: string, quantity: number) => void;
  setAppliedCouponCode: (code: DiscountCode | null) => void;
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

const activeCouponCodes = new Set<DiscountCode>(["COMBO03", "YUVA200", "PARTY06", "YUVA400", "NAVA001", "YUVA03"]);

const syncCouponCart = (cart: CartItem[], appliedCouponCode: DiscountCode | null) => {
  const nextCart = cart.filter((item) => !item.sourceCouponCode);
  const normalizedCoupon =
    nextCart.length > 0 && appliedCouponCode && activeCouponCodes.has(appliedCouponCode)
      ? appliedCouponCode
      : null;

  return { cart: nextCart, appliedCouponCode: normalizedCoupon };
};

export const useShopStore = create<ShopState>()(
  persist(
    (set) => ({
      cart: [],
      orders: [],
      appliedCouponCode: null,
      addToCart: (productId, variantId, quantity = 1) =>
        set((state) => {
          const existing = state.cart.find(
            (item) => item.productId === productId && item.variantId === variantId
          );
          const nextQuantity = (existing?.quantity ?? 0) + quantity;
          return syncCouponCart(updateCartItem(state.cart, productId, variantId, nextQuantity), state.appliedCouponCode);
        }),
      removeFromCart: (productId, variantId) =>
        set((state) =>
          syncCouponCart(
            state.cart.filter(
            (item) => !(item.productId === productId && item.variantId === variantId)
            ),
            state.appliedCouponCode
          )
        ),
      setCartQuantity: (productId, variantId, quantity) =>
        set((state) => syncCouponCart(updateCartItem(state.cart, productId, variantId, quantity), state.appliedCouponCode)),
      setAppliedCouponCode: (code) =>
        set((state) => syncCouponCart(state.cart, code)),
      clearCart: () => set({ cart: [], appliedCouponCode: null }),
      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders]
        }))
    }),
    {
      name: "farmley-inspired-shop-store",
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState, currentState) => {
        const mergedState = {
          ...currentState,
          ...(persistedState as Partial<ShopState>)
        };

        return {
          ...mergedState,
          ...syncCouponCart(mergedState.cart ?? [], mergedState.appliedCouponCode ?? null)
        };
      },
      skipHydration: true
    }
  )
);
