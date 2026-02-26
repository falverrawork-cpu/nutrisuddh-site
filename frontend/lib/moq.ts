import { CartItem } from "@/lib/types";
import { products } from "@/data/products";

export const MOQ_MIN_UNITS = 3;
export const MOQ_WARNING_TEXT =
  "Minimum order quantity is 3. Please add more products to proceed.";

export function getCartUnits(cart: CartItem[]) {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

export function hasComboInCart(cart: CartItem[]) {
  return cart.some((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    return Boolean(product?.tags.includes("combo-pack"));
  });
}

export function isMoqSatisfied(cart: CartItem[]) {
  return hasComboInCart(cart) || getCartUnits(cart) >= MOQ_MIN_UNITS;
}
