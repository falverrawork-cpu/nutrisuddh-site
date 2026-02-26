"use client";

import Image from "@/components/common/app-image";
import Link from "@/components/common/app-link";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Product } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";
import { useShopStore } from "@/stores/shop-store";
import { useUIStore } from "@/stores/ui-store";
import { useAuthStore } from "@/stores/auth-store";

type Props = {
  product: Product;
};

export function ProductCard({ product }: Props) {
  const addToCart = useShopStore((state) => state.addToCart);
  const toggleWishlist = useShopStore((state) => state.toggleWishlist);
  const wishlist = useShopStore((state) => state.wishlist);
  const addToast = useUIStore((state) => state.addToast);
  const openCart = useUIStore((state) => state.openCart);
  const openAuthModal = useUIStore((state) => state.openAuthModal);
  const token = useAuthStore((state) => state.token);

  const inWishlist = wishlist.includes(product.id);
  const isComboPack = product.tags.includes("combo-pack");

  return (
    <motion.article whileHover={{ y: -3 }} transition={{ duration: 0.2 }} className="group card-surface overflow-hidden">
      <div className="relative aspect-square overflow-hidden bg-sand">
        <Link href={`/products/${product.slug}`} aria-label={product.title}>
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className={cn(
              "transition-all duration-500 group-hover:opacity-0",
              isComboPack ? "object-cover scale-125 p-0" : "object-contain p-2"
            )}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          <Image
            src={product.images[1]}
            alt={product.title}
            fill
            className={cn(
              "opacity-0 transition-all duration-500 group-hover:opacity-100",
              isComboPack ? "object-cover scale-125 p-0" : "object-contain p-2"
            )}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        </Link>
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {product.badges.slice(0, 2).map((badge) => (
            <span key={badge} className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-pine">
              {badge}
            </span>
          ))}
        </div>
        <div className="absolute right-2 top-2 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              toggleWishlist(product.id);
              addToast(inWishlist ? "Removed from wishlist" : "Added to wishlist", "info");
            }}
            aria-label="Toggle wishlist"
            className={cn(
              "focus-ring rounded-full border border-stone bg-white p-2",
              inWishlist && "border-pine text-pine"
            )}
          >
            <Heart size={15} fill={inWishlist ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-1 text-sm font-semibold sm:text-base">{product.title}</h3>
        </Link>
        <p className="mt-1 line-clamp-1 text-xs text-gray-500">{product.subtitle}</p>
        <div className="mt-2 flex items-center gap-2">
          <p className="text-sm font-semibold text-ink">{formatCurrency(product.price)}</p>
          <p className="text-xs text-gray-400 line-through">{formatCurrency(product.compareAtPrice)}</p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!token) {
              openAuthModal();
              addToast("Please login or sign up to add items to cart.", "info");
              return;
            }
            addToCart(product.id, product.variants[0].id, 1);
            addToast(`${product.title} added to cart`);
            openCart();
          }}
          className="focus-ring mt-3 w-full rounded-full bg-pine py-2 text-sm font-medium text-white transition-colors hover:bg-accent"
        >
          Quick Add
        </button>
      </div>
    </motion.article>
  );
}
