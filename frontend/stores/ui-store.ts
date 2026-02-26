"use client";

import { create } from "zustand";

export type ToastType = "success" | "info";

export type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

type UIState = {
  isCartOpen: boolean;
  isMobileNavOpen: boolean;
  isAuthModalOpen: boolean;
  toasts: Toast[];
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
};

export const useUIStore = create<UIState>((set) => ({
  isCartOpen: false,
  isMobileNavOpen: false,
  isAuthModalOpen: false,
  toasts: [],
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  openMobileNav: () => set({ isMobileNavOpen: true }),
  closeMobileNav: () => set({ isMobileNavOpen: false }),
  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  addToast: (message, type = "success") =>
    set((state) => ({
      toasts: [...state.toasts, { id: `${Date.now()}-${Math.random()}`, message, type }]
    })),
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }))
}));
