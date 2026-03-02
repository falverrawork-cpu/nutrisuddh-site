"use client";

import Link from "@/components/common/app-link";
import { useState } from "react";
import { CartItemRow } from "@/components/cart/cart-item-row";
import { CartHighlightBox } from "@/components/cart/cart-highlight-box";
import { ConfettiBurst } from "@/components/common/confetti-burst";
import { getDetailedCartItems } from "@/lib/cart";
import { formatCurrency } from "@/lib/utils";
import { useShopStore } from "@/stores/shop-store";
import { useUIStore } from "@/stores/ui-store";
import { getCartNudge, getCartPricing, isEligibleSinglePack } from "@/lib/pricing";

export function CartView() {
  const [showConfetti, setShowConfetti] = useState(false);

  const cart = useShopStore((state) => state.cart);
  const setCartQuantity = useShopStore((state) => state.setCartQuantity);
  const removeFromCart = useShopStore((state) => state.removeFromCart);
  const addToast = useUIStore((state) => state.addToast);

  const lines = getDetailedCartItems(cart);
  const pricing = getCartPricing(cart);

  if (lines.length === 0) {
    return (
      <div className="card-surface mx-auto mt-8 max-w-2xl p-10 text-center">
        <h2 className="font-display text-3xl">Your cart is empty</h2>
        <p className="mt-2 text-sm text-gray-600">Browse our collections to add premium snacks.</p>
        <Link href="/collections/flavoured-makhana" className="focus-ring mt-4 inline-block rounded-full bg-pine px-6 py-2 text-sm text-white">
          Explore collections
        </Link>
      </div>
    );
  }

  return (
    <>
      <ConfettiBurst show={showConfetti} onDone={() => setShowConfetti(false)} />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="card-surface p-5">
          <div className="space-y-4">
            {lines.map((line) => (
              <CartItemRow
                key={`${line.item.productId}-${line.item.variantId}`}
                line={line}
                onQuantityChange={(quantity) => {
                  const nextEligibleQty = isEligibleSinglePack(line.product)
                    ? Math.max(0, pricing.eligibleQty - line.item.quantity + quantity)
                    : pricing.eligibleQty;

                  if (quantity <= 0) {
                    removeFromCart(line.item.productId, line.item.variantId);
                  } else {
                    setCartQuantity(line.item.productId, line.item.variantId, quantity);
                  }
                  addToast(getCartNudge(nextEligibleQty).message, "info");

                  if ((pricing.eligibleQty < 3 && nextEligibleQty >= 3) || (pricing.eligibleQty < 6 && nextEligibleQty >= 6)) {
                    setShowConfetti(true);
                  }
                }}
                onRemove={() => {
                  const nextEligibleQty = isEligibleSinglePack(line.product)
                    ? Math.max(0, pricing.eligibleQty - line.item.quantity)
                    : pricing.eligibleQty;

                  removeFromCart(line.item.productId, line.item.variantId);
                  addToast(getCartNudge(nextEligibleQty).message, "info");
                }}
              />
            ))}
          </div>
        </div>

        <aside className="card-surface h-fit p-5">
          <h3 className="text-lg font-semibold">Order summary</h3>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(pricing.subtotal)}</span></div>
            {pricing.discountCode && (
              <div className="flex justify-between text-pine">
                <span>Discount</span>
                <span>-{formatCurrency(pricing.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between"><span>Shipping</span><span>{pricing.shipping === 0 ? "Free" : formatCurrency(pricing.shipping)}</span></div>
          </div>

          <div className="mt-3 border-t border-stone pt-3 text-sm font-semibold">
            Total: {formatCurrency(pricing.finalPayable)}
          </div>

          <CartHighlightBox cart={cart} />
        </aside>
      </div>
    </>
  );
}
