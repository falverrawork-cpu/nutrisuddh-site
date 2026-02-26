"use client";

import { useEffect } from "react";
import { useShopStore } from "@/stores/shop-store";
import { useAuthStore } from "@/stores/auth-store";

export function StoreHydrator() {
  useEffect(() => {
    useShopStore.persist.rehydrate();
    useAuthStore.persist.rehydrate();
  }, []);

  return null;
}
