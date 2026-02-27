"use client";

import { useEffect } from "react";
import { useShopStore } from "@/stores/shop-store";
import { useAuthStore } from "@/stores/auth-store";
import { useThemeStore } from "@/stores/theme-store";

export function StoreHydrator() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    useShopStore.persist.rehydrate();
    useAuthStore.persist.rehydrate();
    useThemeStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  return null;
}
