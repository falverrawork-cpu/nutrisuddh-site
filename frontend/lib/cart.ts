import { products } from "@/data/products";
import { CartItem, Product, ProductVariant } from "@/lib/types";

export type DetailedCartItem = {
  item: CartItem;
  product: Product;
  variant: ProductVariant;
  linePrice: number;
};

export function getDetailedCartItems(cart: CartItem[]): DetailedCartItem[] {
  return cart
    .map((item) => {
      const product = products.find((candidate) => candidate.id === item.productId);
      if (!product) return null;
      const variant = product.variants.find((candidate) => candidate.id === item.variantId) ?? product.variants[0];
      return {
        item,
        product,
        variant,
        linePrice: variant.price * item.quantity
      };
    })
    .filter((entry): entry is DetailedCartItem => Boolean(entry));
}

export function getCartSubtotal(cart: CartItem[]) {
  return getDetailedCartItems(cart).reduce((total, line) => total + line.linePrice, 0);
}
