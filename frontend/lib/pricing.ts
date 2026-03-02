import { CartItem, Product } from "@/lib/types";
import { getDetailedCartItems } from "@/lib/cart";

export const SINGLE_PACK_MRP = 299;
export const SINGLE_PACK_SELLING_PRICE = 219;
export const SHIPPING_FEE_DEFAULT = 79;

export type DiscountCode = "COMBO03" | "YUVA200" | "PARTY06" | "YUVA400" | "NAVA001";

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
  comboBundle3Qty: number;
  comboBundle6Qty: number;
  nudge: CartNudge;
};

export type CartHighlightState = {
  title: string;
  message: string;
  progressCurrent?: number;
  progressTarget?: number;
  savedNow?: number;
  projectedSavings?: number;
  fomoLine?: string;
  primaryCtaLabel: string;
  addMoreHref: string;
  showPrimaryCta: boolean;
  showCheckoutCta: boolean;
  unlocked: boolean;
};

export type CouponOffer = {
  code: DiscountCode;
  label: string;
  description: string;
};

export const COUPON_OFFERS: CouponOffer[] = [
  { code: "COMBO03", label: "COMBO03", description: "25% OFF + Free Delivery" },
  { code: "YUVA200", label: "YUVA200", description: "Flat ₹200 OFF + Free Delivery" },
  { code: "PARTY06", label: "PARTY06", description: "30% OFF + Free Delivery" },
  { code: "YUVA400", label: "YUVA400", description: "Flat ₹400 OFF + Free Delivery" },
  { code: "NAVA001", label: "NAVA001", description: "Total becomes ₹1 + Free Delivery" }
];

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
      message: "Add 3 single packs to unlock 25% OFF + Free Delivery",
      progressCurrent: 0,
      progressTarget: 3
    };
  }

  if (eligibleQty === 1) {
    return {
      message: "Add 2 more single packs to unlock 25% OFF + Free Delivery",
      progressCurrent: 1,
      progressTarget: 3
    };
  }

  if (eligibleQty === 2) {
    return {
      message: "Add 1 more single pack to unlock 25% OFF + Free Delivery",
      progressCurrent: 2,
      progressTarget: 3
    };
  }

  if (eligibleQty >= 3 && eligibleQty < 6) {
    return {
      message: "Unlocked 25% OFF. Add up to 6 packs for 30% OFF + Free Delivery.",
      progressCurrent: eligibleQty,
      progressTarget: 6
    };
  }

  return {
    message: "Eligible: 30% OFF + Free Delivery.",
    progressCurrent: 6,
    progressTarget: 6
  };
}

export function getCartHighlightState(cart: CartItem[]): CartHighlightState {
  const lines = getDetailedCartItems(cart);
  const subtotal = lines.reduce((sum, line) => sum + line.linePrice, 0);
  const singleQty = lines
    .filter((line) => isEligibleSinglePack(line.product))
    .reduce((sum, line) => sum + line.item.quantity, 0);
  const comboBundle3Qty = lines
    .filter((line) => isComboBundle3Product(line.product))
    .reduce((sum, line) => sum + line.item.quantity, 0);
  const comboBundle6Qty = lines
    .filter((line) => isComboBundle6Product(line.product))
    .reduce((sum, line) => sum + line.item.quantity, 0);
  const comboQty = comboBundle3Qty + comboBundle6Qty;
  const savedNow = lines.reduce((sum, line) => {
    const originalLinePrice = line.product.compareAtPrice * line.item.quantity;
    return sum + Math.max(0, originalLinePrice - line.linePrice);
  }, 0);
  const qualifiedForParty = singleQty >= 6 || comboBundle3Qty >= 2 || comboBundle6Qty >= 1;

  if (qualifiedForParty) {
    return {
      title: "Offer Unlocked 🎉",
      message: "You qualify for 30% OFF + FREE Delivery. Apply your discount at checkout.",
      primaryCtaLabel: "Apply at Checkout",
      addMoreHref: "/checkout",
      showPrimaryCta: true,
      showCheckoutCta: false,
      unlocked: true
    };
  }

  if (comboBundle3Qty === 1 && singleQty === 0 && comboBundle6Qty === 0) {
    return {
      title: "Smart choice 😎",
      message: "Add 1 more combo pack to unlock 30% OFF + FREE Delivery.",
      progressCurrent: 1,
      progressTarget: 2,
      fomoLine: "Most customers add 1 more combo to unlock the offer 😉",
      primaryCtaLabel: "Add More & Save",
      addMoreHref: "/collections/combos",
      showPrimaryCta: true,
      showCheckoutCta: true,
      unlocked: false
    };
  }

  if (comboQty === 0 && singleQty === 1) {
    const remaining = 2;
    const projectedSavings = Math.round((subtotal + remaining * SINGLE_PACK_SELLING_PRICE) * 0.25);
    return {
      title: `You saved ₹${savedNow} 🎉`,
      message: `Add ${remaining} more products & save up to ₹${projectedSavings} with 25% OFF + FREE Delivery.`,
      progressCurrent: 1,
      progressTarget: 3,
      savedNow,
      projectedSavings,
      fomoLine: "Most customers add 2 more to unlock the offer 😉",
      primaryCtaLabel: "Add More & Save",
      addMoreHref: "/collections/flavoured-makhana",
      showPrimaryCta: true,
      showCheckoutCta: true,
      unlocked: false
    };
  }

  if (comboQty === 0 && singleQty === 2) {
    const remaining = 1;
    const projectedSavings = Math.round((subtotal + remaining * SINGLE_PACK_SELLING_PRICE) * 0.25);
    return {
      title: "Almost there 🔥",
      message: "Add 1 more item to unlock 25% OFF + FREE Delivery.",
      progressCurrent: 2,
      progressTarget: 3,
      projectedSavings,
      fomoLine: "Most customers add 1 more to unlock the offer 😉",
      primaryCtaLabel: "Add More & Save",
      addMoreHref: "/collections/flavoured-makhana",
      showPrimaryCta: true,
      showCheckoutCta: true,
      unlocked: false
    };
  }

  if (comboQty === 0 && singleQty >= 3 && singleQty <= 5) {
    const remaining = 6 - singleQty;
    const projectedSavings = Math.round((subtotal + remaining * SINGLE_PACK_SELLING_PRICE) * 0.3);
    return {
      title: "Nice! You unlocked 25% 🎉",
      message: `Add ${remaining} more to unlock 30% OFF + FREE Delivery.`,
      progressCurrent: singleQty,
      progressTarget: 6,
      projectedSavings,
      fomoLine: "Most customers add 2 more to unlock the offer 😉",
      primaryCtaLabel: "Add More & Save",
      addMoreHref: "/collections/flavoured-makhana",
      showPrimaryCta: true,
      showCheckoutCta: true,
      unlocked: false
    };
  }

  const nextTarget = singleQty < 3 ? 3 : 6;
  return {
    title: "Unlock savings 🔥",
    message:
      nextTarget === 3
        ? `Add ${Math.max(1, 3 - singleQty)} more to unlock 25% OFF + FREE Delivery.`
        : `Add ${Math.max(1, 6 - singleQty)} more to unlock 30% OFF + FREE Delivery.`,
    progressCurrent: Math.max(0, Math.min(singleQty, nextTarget)),
    progressTarget: nextTarget as 3 | 6,
    fomoLine: "Most customers add more to unlock the offer 😉",
    primaryCtaLabel: "Add More & Save",
    addMoreHref: "/collections/flavoured-makhana",
    showPrimaryCta: true,
    showCheckoutCta: true,
    unlocked: false
  };
}

function normalizeCouponCode(rawCode: string | null | undefined): DiscountCode | null {
  if (!rawCode) return null;
  const code = rawCode.trim().toUpperCase();
  if (code === "COMBO03" || code === "YUVA200" || code === "PARTY06" || code === "YUVA400" || code === "NAVA001") {
    return code;
  }
  return null;
}

export function getEligibleCouponCodes(cart: CartItem[]): DiscountCode[] {
  const lines = getDetailedCartItems(cart);
  const singlePackQty = lines
    .filter((line) => isEligibleSinglePack(line.product))
    .reduce((sum, line) => sum + line.item.quantity, 0);
  const comboBundle3Qty = lines
    .filter((line) => isComboBundle3Product(line.product))
    .reduce((sum, line) => sum + line.item.quantity, 0);
  const comboBundle6Qty = lines
    .filter((line) => isComboBundle6Product(line.product))
    .reduce((sum, line) => sum + line.item.quantity, 0);

  const eligible = new Set<DiscountCode>();

  if (singlePackQty >= 6 || comboBundle3Qty >= 2 || comboBundle6Qty >= 1) {
    eligible.add("PARTY06");
    eligible.add("YUVA400");
  } else if (singlePackQty >= 3 || comboBundle3Qty >= 1) {
    eligible.add("COMBO03");
    eligible.add("YUVA200");
  }

  if (lines.length > 0) {
    eligible.add("NAVA001");
  }

  return Array.from(eligible);
}

export function getAutoCouponCode(cart: CartItem[]): DiscountCode | null {
  const eligibleCoupons = new Set(getEligibleCouponCodes(cart));
  if (eligibleCoupons.has("PARTY06")) {
    return "PARTY06";
  }
  if (eligibleCoupons.has("COMBO03")) {
    return "COMBO03";
  }
  return null;
}

export function getCartPricing(cart: CartItem[], couponCodeInput?: string | null): CartPricing {
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

  const eligibleCoupons = new Set(getEligibleCouponCodes(cart));
  const normalizedCoupon = normalizeCouponCode(couponCodeInput);
  const manualCouponCode: DiscountCode | null = normalizedCoupon && eligibleCoupons.has(normalizedCoupon) ? normalizedCoupon : null;
  const discountCode: DiscountCode | null = manualCouponCode ?? getAutoCouponCode(cart);

  let discountAmount = 0;
  if (discountCode === "COMBO03") {
    discountAmount = subtotal * 0.25;
  } else if (discountCode === "PARTY06") {
    discountAmount = subtotal * 0.3;
  } else if (discountCode === "YUVA200") {
    discountAmount = 200;
  } else if (discountCode === "YUVA400") {
    discountAmount = 400;
  } else if (discountCode === "NAVA001") {
    discountAmount = Math.max(0, subtotal - 1);
  }

  discountAmount = Math.min(subtotal, Math.round(discountAmount));

  const shipping = discountCode ? 0 : SHIPPING_FEE_DEFAULT;
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
    comboBundle3Qty,
    comboBundle6Qty,
    nudge: getCartNudge(nudgeEligibleQty)
  };
}

export function getCouponIneligibilityReason(codeInput: string): string {
  const code = normalizeCouponCode(codeInput);
  if (!code) {
    return "Invalid coupon code.";
  }

  if (code === "NAVA001") {
    return "";
  }

  if (code === "COMBO03" || code === "YUVA200") {
    return "Need 3+ single packs or 1+ Combo of 3 pack.";
  }

  if (code === "PARTY06" || code === "YUVA400") {
    return "Need 6+ single packs, or 2+ Combo of 3 packs, or 1+ Combo of 6 pack.";
  }

  return "Coupon not valid for current cart.";
}
