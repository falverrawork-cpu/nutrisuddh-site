"use client";

import Image from "@/components/common/app-image";
import Link from "@/components/common/app-link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { DetailedCartItem } from "@/lib/cart";
import { GIFT_PACK_CHARGE_BUNDLE_3, GIFT_PACK_CHARGE_BUNDLE_6, isComboBundle3Product, isComboBundle6Product } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";

type Props = {
  line: DetailedCartItem;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  onGiftPackChange?: (giftPack: boolean) => void;
};

export function CartItemRow({ line, onQuantityChange, onRemove, onGiftPackChange }: Props) {
  const isCouponItem = Boolean(line.item.sourceCouponCode);
  const isGiftPackEligible = isComboBundle3Product(line.product) || isComboBundle6Product(line.product);
  const giftPackCharge = isComboBundle3Product(line.product) ? GIFT_PACK_CHARGE_BUNDLE_3 : GIFT_PACK_CHARGE_BUNDLE_6;

  return (
    <div className="flex gap-3 border-b border-stone pb-4">
      <Link href={`/products/${line.product.slug}`}>
        <Image
          src={line.product.images[0]}
          alt={line.product.title}
          width={80}
          height={80}
          className="rounded-xl object-cover"
        />
      </Link>
      <div className="flex-1">
        <Link href={`/products/${line.product.slug}`} className="text-sm font-semibold">
          {line.product.title}
        </Link>
        <p className="text-xs text-gray-500">{line.variant.label}</p>
        {isCouponItem && (
          <p className="mt-1 text-[11px] font-medium text-pine">Free with {line.item.sourceCouponCode}</p>
        )}
        {!isCouponItem && isGiftPackEligible && onGiftPackChange && (
          <button
            type="button"
            onClick={() => onGiftPackChange(!line.item.giftPack)}
            aria-pressed={Boolean(line.item.giftPack)}
            className={`focus-ring mt-2 inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-medium transition ${
              line.item.giftPack
                ? "border-pine bg-pine/10 text-pine"
                : "border-stone bg-white text-gray-600"
            }`}
          >
            {line.item.giftPack ? "Gift Pack Added" : "Gift for someone else?"} (+{formatCurrency(giftPackCharge)})
          </button>
        )}
        <div className="mt-2 flex items-center justify-between">
          {isCouponItem ? (
            <span className="rounded-full border border-pine/20 bg-pine/5 px-3 py-1 text-[11px] text-pine">
              Managed by coupon
            </span>
          ) : (
            <>
              <div className="flex items-center rounded-full border border-stone">
                <button
                  type="button"
                  onClick={() => onQuantityChange(Math.max(0, line.item.quantity - 1))}
                  className="focus-ring px-2 py-1"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="px-2 text-sm">{line.item.quantity}</span>
                <button
                  type="button"
                  onClick={() => onQuantityChange(line.item.quantity + 1)}
                  className="focus-ring px-2 py-1"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
              <button type="button" onClick={onRemove} className="focus-ring rounded p-1" aria-label="Remove item">
                <Trash2 size={14} className="text-gray-500" />
              </button>
            </>
          )}
        </div>
      </div>
      <p className="text-sm font-semibold">{isCouponItem ? "FREE" : formatCurrency(line.linePrice)}</p>
    </div>
  );
}
