"use client";

import Link from "@/components/common/app-link";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import { CartItemRow } from "@/components/cart/cart-item-row";
import { CartHighlightBox } from "@/components/cart/cart-highlight-box";
import { ConfettiBurst } from "@/components/common/confetti-burst";
import { getDetailedCartItems } from "@/lib/cart";
import { formatCurrency } from "@/lib/utils";
import { useShopStore } from "@/stores/shop-store";
import { useUIStore } from "@/stores/ui-store";
import { getCartNudge, getCartPricing, isEligibleSinglePack } from "@/lib/pricing";

export function CartDrawer() {
  const [showConfetti, setShowConfetti] = useState(false);

  const cart = useShopStore((state) => state.cart);
  const appliedCouponCode = useShopStore((state) => state.appliedCouponCode);
  const setCartQuantity = useShopStore((state) => state.setCartQuantity);
  const setCartGiftPack = useShopStore((state) => state.setCartGiftPack);
  const removeFromCart = useShopStore((state) => state.removeFromCart);
  const addToast = useUIStore((state) => state.addToast);
  const open = useUIStore((state) => state.isCartOpen);
  const close = useUIStore((state) => state.closeCart);

  const lines = getDetailedCartItems(cart);
  const pricing = getCartPricing(cart, appliedCouponCode);

  return (
    <AnimatePresence>
      {open && (
        <>
          <ConfettiBurst show={showConfetti} onDone={() => setShowConfetti(false)} />

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-50 bg-black/40"
            aria-label="Close cart overlay"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.25 }}
            className="fixed right-0 top-0 z-[60] flex h-full w-full max-w-md flex-col bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-5"
            aria-label="Cart drawer"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl">Your Cart</h2>
              <button type="button" onClick={close} className="focus-ring rounded-full border border-stone p-2">
                <X size={17} />
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="card-surface flex flex-1 flex-col items-center justify-center p-8 text-center">
                <p className="font-semibold">Your cart is empty</p>
                <p className="mt-2 text-sm text-gray-600">Browse collections and add items to continue.</p>
                <Link href="/collections/flavoured-makhana" onClick={close} className="mt-4 rounded-full bg-pine px-4 py-2 text-sm text-white">
                  Shop now
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                  {lines.map((line) => (
                    <CartItemRow
                      key={`${line.item.productId}-${line.item.variantId}`}
                      line={line}
                      onQuantityChange={(quantity) => {
                        if (line.item.sourceCouponCode) return;

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
                        if (line.item.sourceCouponCode) return;

                        const nextEligibleQty = isEligibleSinglePack(line.product)
                          ? Math.max(0, pricing.eligibleQty - line.item.quantity)
                          : pricing.eligibleQty;

                        removeFromCart(line.item.productId, line.item.variantId);
                        addToast(getCartNudge(nextEligibleQty).message, "info");
                      }}
                      onGiftPackChange={(giftPack) => {
                        setCartGiftPack(line.item.productId, line.item.variantId, giftPack);
                      }}
                    />
                  ))}
                </div>
                <div className="mt-4 rounded-2xl border border-stone bg-sand p-3.5 sm:p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Subtotal</span>
                    <span className="font-semibold">{formatCurrency(pricing.subtotal)}</span>
                  </div>
                  {pricing.discountCode && pricing.discountAmount > 0 && (
                    <div className="mt-2 flex items-center justify-between text-sm text-pine">
                      <span>Discount</span>
                      <span>-{formatCurrency(pricing.discountAmount)}</span>
                    </div>
                  )}
                  {pricing.giftPackCharge > 0 && (
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span>Gift Pack Charge</span>
                      <span>{formatCurrency(pricing.giftPackCharge)}</span>
                    </div>
                  )}
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span>Shipping</span>
                    <span>{pricing.shipping === 0 ? "Free" : formatCurrency(pricing.shipping)}</span>
                  </div>
                  <div className="mt-2 border-t border-stone pt-2 text-sm font-semibold">
                    Total: {formatCurrency(pricing.finalPayable)}
                  </div>

                  <CartHighlightBox cart={cart} onCheckout={close} onAddMore={close} />
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
