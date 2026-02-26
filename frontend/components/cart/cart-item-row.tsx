"use client";

import Image from "@/components/common/app-image";
import Link from "@/components/common/app-link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { DetailedCartItem } from "@/lib/cart";
import { formatCurrency } from "@/lib/utils";

type Props = {
  line: DetailedCartItem;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
};

export function CartItemRow({ line, onQuantityChange, onRemove }: Props) {
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
        <div className="mt-2 flex items-center justify-between">
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
        </div>
      </div>
      <p className="text-sm font-semibold">{formatCurrency(line.linePrice)}</p>
    </div>
  );
}
