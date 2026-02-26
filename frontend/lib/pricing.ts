import { CartItem, Product } from "@/lib/types";
import { getDetailedCartItems } from "@/lib/cart";

export const SINGLE_PACK_MRP = 299;
export const SINGLE_PACK_SELLING_PRICE = 219;
export const SHIPPING_FEE_DEFAULT = 79;

export const DISCOUNT_COMBO03 = 178;
export const DISCOUNT_PARTY06 = 375;

export type DiscountCode = "COMBO03" | "PARTY06" | "COMBO03+PARTY06";

export type CartNudge = {
  message: string;
  progressCurrent: number;
  progressTarget: 3 | 6;
};

export type CartPricing = {
  subtotal: number;
  shipping: number;
  discountAmount: number;
  discountCode: DiscountCode | null;
  finalPayable: number;
  eligibleQty: number;
  nudgeEligibleQty: number;
  comboQty: number;
  nudge: CartNudge;
};

export function isComboPackProduct(product: Product) {
  return product.tags.includes("combo-pack");
}

export function isEligibleSinglePack(product: Product) {
  return product.tags.includes("makhana-single");
}

export function isComboBundle3Product(product: Product) {
  return isComboPackProduct(product) && product.tags.includes("bundle-3");
}

export function isComboBundle6Product(product: Product) {
  return isComboPackProduct(product) && product.tags.includes("bundle-6");
}

export function getCartNudge(eligibleQty: number): CartNudge {
  if (eligibleQty <= 0) {
    return {
      message: "Add 3 items to unlock Free Delivery + Flat ₹178 OFF",
      progressCurrent: 0,
      progressTarget: 3
    };
  }

  if (eligibleQty === 1) {
    return {
      message: "Add 2 more items to unlock Free Delivery + Flat ₹178 OFF (Pay ₹479 for 3)",
      progressCurrent: 1,
      progressTarget: 3
    };
  }

  if (eligibleQty === 2) {
    return {
      message: "Add 1 more item to unlock Free Delivery + Flat ₹178 OFF",
      progressCurrent: 2,
      progressTarget: 3
    };
  }

  if (eligibleQty >= 3 && eligibleQty < 6) {
    return {
      message: "Unlocked: ₹178 OFF + Free Delivery. Add up to 6 to unlock ₹375 OFF (Pay ₹939 for 6)",
      progressCurrent: eligibleQty,
      progressTarget: 6
    };
  }

  return {
    message: "Party Deal Active: ₹375 OFF + Free Delivery (Pay ₹939)",
    progressCurrent: 6,
    progressTarget: 6
  };
}

export function getCartPricing(cart: CartItem[]): CartPricing {
  const lines = getDetailedCartItems(cart);

  const subtotal = lines.reduce((sum, line) => sum + line.linePrice, 0);
  const eligibleQty = lines
    .filter((line) => isEligibleSinglePack(line.product))
    .reduce((sum, line) => sum + line.item.quantity, 0);
  const comboQty = lines
    .filter((line) => isComboPackProduct(line.product))
    .reduce((sum, line) => sum + line.item.quantity, 0);
  const comboBundle3Qty = lines
    .filter((line) => isComboBundle3Product(line.product))
    .reduce((sum, line) => sum + line.item.quantity, 0);
  const comboBundle6Qty = lines
    .filter((line) => isComboBundle6Product(line.product))
    .reduce((sum, line) => sum + line.item.quantity, 0);
  const comboEquivalentQty = comboBundle3Qty * 3 + comboBundle6Qty * 6;
  const nudgeEligibleQty = Math.max(eligibleQty, comboEquivalentQty);

  let singlePackDiscountAmount = 0;
  let comboPackDiscountAmount = 0;
  let discountCode: DiscountCode | null = null;

  if (eligibleQty >= 6) {
    singlePackDiscountAmount = DISCOUNT_PARTY06;
  } else if (eligibleQty >= 3) {
    singlePackDiscountAmount = DISCOUNT_COMBO03;
  }

  if (comboBundle3Qty > 0) {
    comboPackDiscountAmount += comboBundle3Qty * DISCOUNT_COMBO03;
  }
  if (comboBundle6Qty > 0) {
    comboPackDiscountAmount += comboBundle6Qty * DISCOUNT_PARTY06;
  }

  const discountAmount = singlePackDiscountAmount + comboPackDiscountAmount;

  const hasCombo03Discount =
    singlePackDiscountAmount === DISCOUNT_COMBO03 || comboBundle3Qty > 0;
  const hasParty06Discount =
    singlePackDiscountAmount === DISCOUNT_PARTY06 || comboBundle6Qty > 0;

  if (hasCombo03Discount && hasParty06Discount) {
    discountCode = "COMBO03+PARTY06";
  } else if (hasParty06Discount) {
    discountCode = "PARTY06";
  } else if (hasCombo03Discount) {
    discountCode = "COMBO03";
  }

  const shipping = eligibleQty >= 3 || comboQty > 0 ? 0 : SHIPPING_FEE_DEFAULT;
  const finalPayable = Math.max(0, subtotal - discountAmount + shipping);

  return {
    subtotal,
    shipping,
    discountAmount,
    discountCode,
    finalPayable,
    eligibleQty,
    nudgeEligibleQty,
    comboQty,
    nudge: getCartNudge(nudgeEligibleQty)
  };
}
