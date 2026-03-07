import clsx from "clsx";

export function cn(...inputs: Array<string | boolean | undefined | null>) {
  return clsx(inputs);
}

export function getMediaUrl(src: string) {
  if (!src) return src;
  if (
    /^(https?:)?\/\//i.test(src) ||
    src.startsWith("data:") ||
    src.startsWith("blob:") ||
    src.startsWith("/")
  ) {
    return src;
  }

  return src;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

export function discountPercent(price: number, compareAtPrice: number) {
  return Math.max(0, Math.round(((compareAtPrice - price) / compareAtPrice) * 100));
}
