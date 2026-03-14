"use client";

import { useState } from "react";
import { Minus, Plus, Star } from "lucide-react";
import { Product } from "@/lib/types";
import { GIFT_PACK_CHARGE_BUNDLE_3, GIFT_PACK_CHARGE_BUNDLE_6, isComboBundle3Product, isComboBundle6Product } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";
import { useShopStore } from "@/stores/shop-store";
import { useUIStore } from "@/stores/ui-store";
import { ProductGallery } from "@/components/product/product-gallery";
import { useAuthStore } from "@/stores/auth-store";

export function ProductPurchase({ product, images }: { product: Product; images?: string[] }) {
  const [variantId, setVariantId] = useState(product.variants[0].id);
  const [quantity, setQuantity] = useState(1);
  const [giftPack, setGiftPack] = useState(false);
  const addToCart = useShopStore((state) => state.addToCart);
  const setCartGiftPack = useShopStore((state) => state.setCartGiftPack);
  const openCart = useUIStore((state) => state.openCart);
  const addToast = useUIStore((state) => state.addToast);
  const openAuthModal = useUIStore((state) => state.openAuthModal);
  const token = useAuthStore((state) => state.token);

  const variant = product.variants.find((value) => value.id === variantId) ?? product.variants[0];
  const galleryImages = images && images.length > 0 ? images : product.images;
  const isGiftPackEligible = isComboBundle3Product(product) || isComboBundle6Product(product);
  const giftPackCharge = isComboBundle3Product(product) ? GIFT_PACK_CHARGE_BUNDLE_3 : GIFT_PACK_CHARGE_BUNDLE_6;
  const isComboPack = product.tags.includes("combo-pack");
  const comboName = isComboPack ? product.subtitle : null;

  return (
    <div className="card-surface w-full px-4 pb-4 pt-3 sm:px-6 sm:pb-6 sm:pt-4">
      <div className="mt-3 grid items-start gap-4 sm:mt-4 sm:gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <ProductGallery images={galleryImages} title={product.title} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-pine">Premium Snacking</p>
          {comboName && (
            <div className="mt-3 inline-flex max-w-full rounded-full border border-[#d97706]/20 bg-[linear-gradient(135deg,#fff7ed_0%,#fef3c7_100%)] px-4 py-2 shadow-[0_10px_28px_rgba(217,119,6,0.12)]">
              <p className="line-clamp-1 text-sm font-semibold text-[#7c2d12] sm:text-base">{comboName}</p>
            </div>
          )}
          <h1 className="mt-2 font-display text-2xl sm:text-3xl">{product.title}</h1>
          {!comboName && <p className="text-sm text-gray-600">{product.subtitle}</p>}
          {isComboPack && (
            <p className="mt-2 text-xs text-gray-500">
              Disclaimer: Pack does not come in the exact same packaging shown in the image.
            </p>
          )}

          <div className="mt-3 flex items-center gap-2 text-sm">
            <Star size={14} className="fill-gold text-gold" />
            <span className="font-semibold">{product.rating}</span>
            <span className="text-gray-500">({product.reviewCount} reviews)</span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <p className="text-xl font-semibold sm:text-2xl">{formatCurrency(variant.price)}</p>
            <p className="text-sm text-gray-400 line-through">{formatCurrency(product.compareAtPrice)}</p>
          </div>

          {isGiftPackEligible && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setGiftPack((value) => !value)}
                aria-pressed={giftPack}
                className={`focus-ring inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition ${
                  giftPack
                    ? "border-pine bg-pine/10 text-pine"
                    : "border-stone bg-white text-gray-700"
                }`}
              >
                {giftPack ? "Gift Pack Added" : "Gift for someone else?"} (+{formatCurrency(giftPackCharge)})
              </button>
            </div>
          )}

          <div className="mt-5">
            <p className="mb-2 text-sm font-semibold">Select pack size</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setVariantId(item.id)}
                  className={`focus-ring rounded-full border px-4 py-2 text-sm ${item.id === variantId ? "border-pine bg-pine text-white" : "border-stone"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-full border border-stone">
              <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="focus-ring px-3 py-2" aria-label="Decrease quantity">
                <Minus size={15} />
              </button>
              <span className="px-3 text-sm">{quantity}</span>
              <button type="button" onClick={() => setQuantity((q) => q + 1)} className="focus-ring px-3 py-2" aria-label="Increase quantity">
                <Plus size={15} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!token) {
                  openAuthModal();
                  addToast("Please login or sign up to add items to cart.", "info");
                  return;
                }
                addToCart(product.id, variantId, quantity);
                if (giftPack) {
                  setCartGiftPack(product.id, variantId, true);
                }
                addToast(`${product.title} added to cart`);
                openCart();
              }}
              className="focus-ring flex-1 rounded-full bg-pine px-5 py-2.5 text-sm font-semibold text-white"
            >
              Add to cart
            </button>
          </div>

          <button type="button" className="focus-ring mt-3 w-full rounded-full border border-pine py-2 text-sm font-semibold text-pine">
            Buy now
          </button>
        </div>
      </div>
    </div>
  );
}
