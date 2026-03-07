"use client";

import Image from "@/components/common/app-image";
import Link from "@/components/common/app-link";
import Script from "@/components/common/external-script";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Minus, Plus, ShieldCheck, Sparkles, Timer, Trash2 } from "lucide-react";
import { products } from "@/data/products";
import { useShopStore } from "@/stores/shop-store";
import { useUIStore } from "@/stores/ui-store";
import { getDetailedCartItems } from "@/lib/cart";
import {
  COUPON_OFFERS,
  getCartNudge,
  getCartPricing,
  getCouponIneligibilityReason,
  getEligibleCouponCodes,
  isEligibleSinglePack
} from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";
import { ConfettiBurst } from "@/components/common/confetti-burst";
import { useAuthStore, type AuthUser } from "@/stores/auth-store";
import { apiFetch } from "@/lib/api";

type RazorpayPaymentResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type CreateOrderResponse = {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
};

type AuthResponse = {
  token: string;
  user: AuthUser;
};

const INDIA_STATE_OPTIONS = {
  states: [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal"
  ],
  unionTerritories: [
    "Andaman & Nicobar Islands",
    "Chandigarh",
    "Dadra & Nagar Haveli and Daman & Diu",
    "Delhi (NCT)",
    "Jammu & Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry"
  ]
} as const;

type DeliveryDetails = {
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pinCode: string;
};

const INITIAL_DELIVERY: DeliveryDetails = {
  name: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pinCode: ""
};


export function CheckoutView() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [showCouponList, setShowCouponList] = useState(false);
  const [activeRecommendation, setActiveRecommendation] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [delivery, setDelivery] = useState<DeliveryDetails>(INITIAL_DELIVERY);

  const cart = useShopStore((state) => state.cart);
  const appliedCouponCode = useShopStore((state) => state.appliedCouponCode);
  const addToCart = useShopStore((state) => state.addToCart);
  const setCartQuantity = useShopStore((state) => state.setCartQuantity);
  const removeFromCart = useShopStore((state) => state.removeFromCart);
  const setAppliedCouponCode = useShopStore((state) => state.setAppliedCouponCode);
  const clearCart = useShopStore((state) => state.clearCart);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const addToast = useUIStore((state) => state.addToast);
  const openAuthModal = useUIStore((state) => state.openAuthModal);

  const lines = getDetailedCartItems(cart);
  const eligibleCouponCodes = useMemo(() => getEligibleCouponCodes(cart), [cart]);
  const pricing = getCartPricing(cart, appliedCouponCode);

  const singleRecommendations = useMemo(() => {
    const inCartIds = new Set(lines.map((line) => line.product.id));
    return products
      .filter((product) => product.tags.includes("makhana-single"))
      .filter((product) => !inCartIds.has(product.id))
      .slice(0, 3);
  }, [lines]);

  const comboRecommendations = useMemo(() => {
    const inCartIds = new Set(lines.map((line) => line.product.id));
    return products
      .filter((product) => product.tags.includes("combo-pack"))
      .filter((product) => !inCartIds.has(product.id))
      .slice(0, 3);
  }, [lines]);

  const recommendedProducts = [...singleRecommendations, ...comboRecommendations];
  const hasComboOf3InCart = lines.some(
    (line) => line.product.tags.includes("combo-pack") && line.product.tags.includes("bundle-3") && line.item.quantity > 0
  );
  const hasComboOf6InCart = lines.some(
    (line) => line.product.tags.includes("combo-pack") && line.product.tags.includes("bundle-6") && line.item.quantity > 0
  );

  useEffect(() => {
    if (recommendedProducts.length <= 1) return;
    const timer = setInterval(() => {
      setActiveRecommendation((value) => (value + 1) % recommendedProducts.length);
    }, 1000);
    return () => clearInterval(timer);
  }, [recommendedProducts.length]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.Razorpay) {
      setScriptLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    setDelivery((current) => ({
      ...current,
      name: current.name || user.name || "",
      email: current.email || user.email || "",
      phone: current.phone || user.phone || ""
    }));
  }, [user]);

  useEffect(() => {
    if (!appliedCouponCode) return;
    if (!eligibleCouponCodes.includes(appliedCouponCode)) {
      setAppliedCouponCode(null);
      addToast("Applied coupon removed because cart no longer meets its conditions.", "info");
    }
  }, [addToast, appliedCouponCode, eligibleCouponCodes]);

  const payableAmount = pricing.finalPayable;
  const totalVisibleSavings = useMemo(() => {
    const productLevelSavings = lines.reduce((total, line) => {
      const originalLinePrice = line.product.compareAtPrice * line.item.quantity;
      return total + Math.max(0, originalLinePrice - line.linePrice);
    }, 0);
    return productLevelSavings + pricing.discountAmount;
  }, [lines, pricing.discountAmount]);

  const appliedCouponLabels = [
    pricing.discountCode
      ? (appliedCouponCode && pricing.discountCode === appliedCouponCode ? pricing.discountCode : `${pricing.discountCode} (Auto)`)
      : null
  ].filter(Boolean) as string[];

  const isGatewayReady = scriptLoaded || (typeof window !== "undefined" && Boolean(window.Razorpay));
  const disabledReason = useMemo(() => {
    if (!isGatewayReady) return "Payment gateway is loading... Refresh if this persists.";
    return "";
  }, [isGatewayReady]);

  if (!cart.length) {
    return (
      <div className="card-surface mx-auto max-w-2xl p-6 text-center sm:p-10">
        <h1 className="font-display text-3xl sm:text-4xl">Checkout</h1>
        <p className="mt-3 text-sm text-gray-600">Your cart is empty. Add products to continue.</p>
        <Link href="/collections/flavoured-makhana" className="focus-ring mt-5 inline-block rounded-full bg-pine px-5 py-2 text-sm text-white">
          Explore products
        </Link>
      </div>
    );
  }

  const handleQtyChange = (productId: string, variantId: string, currentQty: number, nextQty: number, isSingle: boolean) => {
    const nextEligibleQty = isSingle ? Math.max(0, pricing.eligibleQty - currentQty + nextQty) : pricing.eligibleQty;

    if (nextQty <= 0) {
      removeFromCart(productId, variantId);
    } else {
      setCartQuantity(productId, variantId, nextQty);
    }
    addToast(getCartNudge(nextEligibleQty).message, "info");

    if ((pricing.eligibleQty < 3 && nextEligibleQty >= 3) || (pricing.eligibleQty < 6 && nextEligibleQty >= 6)) {
      setShowConfetti(true);
    }
  };

  const handleRemove = (productId: string, variantId: string, currentQty: number, isSingle: boolean) => {
    const nextEligibleQty = isSingle ? Math.max(0, pricing.eligibleQty - currentQty) : pricing.eligibleQty;

    removeFromCart(productId, variantId);
    addToast(getCartNudge(nextEligibleQty).message, "info");
  };

  const applyCouponCode = (rawCode: string) => {
    const code = rawCode.trim().toUpperCase();
    if (!code) {
      addToast("Enter a coupon code", "info");
      return;
    }

    const offer = COUPON_OFFERS.find((value) => value.code === code);
    if (!offer) {
      addToast("Invalid coupon code.", "info");
      return;
    }

    if (!eligibleCouponCodes.includes(offer.code)) {
      addToast(getCouponIneligibilityReason(code), "info");
      return;
    }

    setAppliedCouponCode(offer.code);
    setCouponInput(offer.code);
    addToast(`${offer.code} applied successfully`);
  };

  const validateDeliveryDetails = () => {
    if (!delivery.name.trim()) return "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(delivery.email.trim())) return "Please enter a valid email address.";
    if (!/^\d{10}$/.test(delivery.phone.replace(/\D/g, ""))) return "Please enter a valid 10-digit phone number.";
    if (!delivery.addressLine1.trim()) return "Please enter House No./Flat Number.";
    if (!delivery.addressLine2.trim()) return "Please enter your complete address.";
    if (!delivery.city.trim()) return "Please enter your city.";
    if (!delivery.state.trim()) return "Please select your state or union territory.";
    if (!/^\d{6}$/.test(delivery.pinCode.trim())) return "Please enter a valid 6-digit pin code.";
    return "";
  };

  const createOrder = async () => {
    const response = await fetch("/api/razorpay/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: Math.round(payableAmount * 100),
        currency: "INR",
        receipt: `rcpt_${Date.now()}`
      })
    });

    if (!response.ok) {
      throw new Error("Unable to create payment order.");
    }

    return (await response.json()) as CreateOrderResponse;
  };

  const verifyPayment = async (payload: RazorpayPaymentResponse) => {
    const response = await fetch("/api/razorpay/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const result = (await response.json()) as { error?: string };
      throw new Error(result.error ?? "Payment verification failed.");
    }

    return (await response.json()) as { verified: boolean; paymentId: string };
  };

  const onPayNow = async () => {
    if (isProcessing) return;

    const validationError = validateDeliveryDetails();
    if (validationError) {
      addToast(validationError, "info");
      return;
    }

    if (!window.Razorpay) {
      addToast("Razorpay SDK failed to load. Refresh and try again.", "info");
      return;
    }

    setIsProcessing(true);

    try {
      const checkoutIdentity = {
        name: delivery.name.trim(),
        email: delivery.email.trim(),
        phone: delivery.phone.replace(/\D/g, "")
      };

      const order = await createOrder();

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "NS Agro Overseas",
        description: "Premium Makhana Order",
        image: "/logo/brand-logo.png",
        prefill: {
          name: checkoutIdentity.name,
          email: checkoutIdentity.email,
          contact: checkoutIdentity.phone || undefined
        },
        handler: async (response: RazorpayPaymentResponse) => {
          try {
            const verification = await verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });

            if (!verification.verified) throw new Error("Payment verification failed.");

            const createdAt = new Date();
            const expectedDeliveryDate = new Date(createdAt);
            expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 7);

            const orderId = `ORD-${createdAt.getTime()}`;
            let sessionToken = token;
            if (!sessionToken) {
              const accountResult = await apiFetch<AuthResponse>("/api/auth/checkout-account", {
                method: "POST",
                body: JSON.stringify({
                  name: checkoutIdentity.name,
                  email: checkoutIdentity.email,
                  phone: checkoutIdentity.phone
                })
              });
              sessionToken = accountResult.token;
              setSession(accountResult.token, accountResult.user);
              addToast("Account created from checkout details.");
            }

            const orderPayload = {
              id: orderId,
              createdAt: createdAt.toISOString(),
              expectedDeliveryDate: expectedDeliveryDate.toISOString(),
              status: "Order Confirmed",
              paymentId: response.razorpay_payment_id,
              subtotal: pricing.subtotal,
              discountCode: pricing.discountCode || undefined,
              discountAmount: pricing.discountAmount,
              shipping: pricing.shipping,
              total: payableAmount,
              customerName: checkoutIdentity.name,
              customerEmail: checkoutIdentity.email,
              customerPhone: checkoutIdentity.phone || undefined,
              addressLine1: delivery.addressLine1,
              addressLine2: delivery.addressLine2,
              shippingCity: delivery.city,
              shippingState: delivery.state,
              pinCode: delivery.pinCode,
              items: lines.map((line) => ({
                productId: line.product.id,
                productTitle: line.product.title,
                variantLabel: line.variant.label,
                quantity: line.item.quantity,
                unitPrice: line.unitPrice,
                lineTotal: line.linePrice,
                image: line.product.images[0]
              }))
            };

            await apiFetch<{ ok: boolean; orderId: string }>(
              "/api/orders",
              {
                method: "POST",
                body: JSON.stringify(orderPayload)
              },
              sessionToken
            );

            clearCart();
            addToast("Order confirmed. Payment successful.");
            navigate(`/orders?placed=${orderId}`);
          } catch (error) {
            addToast(error instanceof Error ? error.message : "Payment verification failed.", "info");
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => setIsProcessing(false)
        },
        theme: {
          color: "#0B6E4F"
        }
      };

      new window.Razorpay(options).open();
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Unable to start payment. Please try again.", "info");
      setIsProcessing(false);
    }
  };

  const renderPaymentSummary = (className: string) => (
    <aside className={className}>
      <h2 className="text-lg font-semibold">Payment Summary</h2>
      <p className="mt-1 text-xs text-gray-500">Fast checkout with secure order verification.</p>
      {totalVisibleSavings > 0 && (
        <p className="mt-3 inline-flex rounded-full border border-pine/30 bg-pine/10 px-3 py-1 text-xs font-semibold text-pine">
          You save {formatCurrency(totalVisibleSavings)} on this order
        </p>
      )}

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(pricing.subtotal)}</span>
        </div>
        {pricing.discountCode && pricing.discountAmount > 0 && (
          <div className="flex items-center justify-between text-pine">
            <span>{pricing.discountCode}</span>
            <span>-{formatCurrency(pricing.discountAmount)}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span>Shipping</span>
          <span>{pricing.shipping === 0 ? "Free" : formatCurrency(pricing.shipping)}</span>
        </div>
        <div className="border-t border-stone pt-3">
          <p className="text-xs text-gray-500">Total Payable</p>
          <p className="text-2xl font-semibold text-ink">{formatCurrency(payableAmount)}</p>
        </div>
      </div>

      {(isProcessing || disabledReason) && (
        <p className="mt-3 text-xs text-gray-500">{isProcessing ? "Opening payment window..." : disabledReason}</p>
      )}

      <button
        type="button"
        onClick={onPayNow}
        disabled={isProcessing}
        className={`focus-ring mt-4 w-full rounded-full py-3 text-sm font-semibold ${
          isProcessing ? "bg-gray-300 text-gray-600" : "bg-pine text-white"
        }`}
      >
        {isProcessing
          ? "Processing..."
          : `Pay ${formatCurrency(payableAmount)}`}
      </button>

      <div className="mt-3 space-y-1.5 rounded-xl border border-stone bg-sand/40 px-3 py-3 text-xs text-gray-600">
        <p className="inline-flex items-center gap-1"><ShieldCheck size={13} className="text-pine" /> 100% secure payment and verification</p>
        <p className="inline-flex items-center gap-1"><Timer size={13} className="text-pine" /> Delivery ETA: 7 Days</p>
      </div>
    </aside>
  );

  return (
    <div>
      <ConfettiBurst show={showConfetti} onDone={() => setShowConfetti(false)} />

      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
        onError={() => addToast("Failed to load payment gateway. Please refresh and try again.", "info")}
      />

      <div className="mb-5 rounded-2xl border border-stone bg-white p-4 sm:mb-6 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl">Secure Checkout</h1>
            <p className="mt-2 text-sm text-gray-600">Complete your order in 2 steps.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-pine/25 bg-pine/10 px-3 py-1.5 text-xs font-semibold text-pine">
            <Lock size={14} /> Razorpay Protected Payment
          </div>
        </div>
        <div className="mt-4 grid gap-2 text-xs sm:grid-cols-3">
          <p className="rounded-lg border border-stone bg-sand/60 px-3 py-2 text-gray-700"><span className="font-semibold">Step 1:</span> Delivery Details</p>
          <p className="rounded-lg border border-stone bg-sand/60 px-3 py-2 text-gray-700"><span className="font-semibold">Step 2:</span> Review & Apply Coupon</p>
          <p className="rounded-lg border border-stone bg-sand/60 px-3 py-2 text-gray-700"><span className="font-semibold">Final:</span> Secure Payment</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-6">
        <div className="space-y-5">
          <section className="card-surface p-5">
            <h2 className="text-lg font-semibold">Delivery Address</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input value={delivery.name} onChange={(e) => setDelivery((d) => ({ ...d, name: e.target.value }))} placeholder="Name" className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm" />
              <input value={delivery.email} onChange={(e) => setDelivery((d) => ({ ...d, email: e.target.value }))} placeholder="Email" type="email" className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm" />
              <input value={delivery.phone} onChange={(e) => setDelivery((d) => ({ ...d, phone: e.target.value }))} placeholder="Number" inputMode="numeric" className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm" />
              <input value={delivery.addressLine1} onChange={(e) => setDelivery((d) => ({ ...d, addressLine1: e.target.value }))} placeholder="House No./Flat Number" className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm" />
              <input value={delivery.addressLine2} onChange={(e) => setDelivery((d) => ({ ...d, addressLine2: e.target.value }))} placeholder="Enter Complete Address" className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm sm:col-span-2" />
              <input value={delivery.city} onChange={(e) => setDelivery((d) => ({ ...d, city: e.target.value }))} placeholder="City" className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm" />
              <select
                value={delivery.state}
                onChange={(e) => setDelivery((d) => ({ ...d, state: e.target.value }))}
                className="focus-ring rounded-lg border border-stone bg-white px-3 py-2 text-sm"
              >
                <option value="">Select State / Union Territory</option>
                <optgroup label="States of India (28)">
                  {INDIA_STATE_OPTIONS.states.map((stateName) => (
                    <option key={stateName} value={stateName}>
                      {stateName}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Union Territories (8)">
                  {INDIA_STATE_OPTIONS.unionTerritories.map((territory) => (
                    <option key={territory} value={territory}>
                      {territory}
                    </option>
                  ))}
                </optgroup>
              </select>
              <input value={delivery.pinCode} onChange={(e) => setDelivery((d) => ({ ...d, pinCode: e.target.value }))} placeholder="Pin Code" inputMode="numeric" className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm" />
            </div>
          </section>

          <section className="card-surface p-5">
            <h2 className="text-lg font-semibold">Coupons</h2>
            <p className="mt-1 text-xs text-gray-500">Only one coupon can be applied at a time.</p>
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowCouponList(true)}
                className="focus-ring rounded-full border border-pine/50 bg-pine/10 px-4 py-2 text-xs font-semibold text-pine"
              >
                Show Available Coupon Codes
              </button>
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={couponInput}
                onChange={(event) => setCouponInput(event.target.value)}
                placeholder="Enter coupon code"
                className="focus-ring w-full rounded-full border border-stone px-4 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => applyCouponCode(couponInput)}
                className="focus-ring rounded-full bg-pine px-4 py-2 text-sm font-medium text-white"
              >
                Apply
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {appliedCouponLabels.length === 0 ? (
                <span className="text-xs text-gray-500">No coupon applied</span>
              ) : (
                appliedCouponLabels.map((label) => (
                  <span key={label} className="rounded-full border border-pine/50 bg-pine/10 px-3 py-1 text-[11px] font-medium text-pine">
                    {label}
                  </span>
                ))
              )}
            </div>
            {appliedCouponCode && (
              <button
                type="button"
                onClick={() => {
                  setAppliedCouponCode(null);
                  addToast("Coupon removed", "info");
                }}
                className="focus-ring mt-2 rounded-full border border-stone px-3 py-1 text-[11px] text-gray-600"
              >
                Remove coupon
              </button>
            )}
          </section>

          {renderPaymentSummary("card-surface p-5 lg:hidden")}

          <section className="card-surface p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">Order Items</h2>
              <span className="rounded-full border border-stone bg-sand px-2.5 py-1 text-xs text-gray-600">{lines.length} item(s)</span>
            </div>
            <div className="mt-4 space-y-3">
              {lines.map((line) => {
                const isSingle = isEligibleSinglePack(line.product);
                const originalLinePrice = line.product.compareAtPrice * line.item.quantity;
                const hasLineDiscount = originalLinePrice > line.linePrice;
                const isCouponItem = Boolean(line.item.sourceCouponCode);
                return (
                  <div key={`${line.item.productId}-${line.item.variantId}`} className="flex items-center gap-3 rounded-xl border border-stone p-3">
                    <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-sand">
                      <Image src={line.product.images[0]} alt={line.product.title} fill className="object-contain p-1" sizes="56px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-semibold">{line.product.title}</p>
                      <p className="text-xs text-gray-500">{line.variant.label}</p>
                      {isCouponItem ? (
                        <p className="mt-2 text-[11px] font-medium text-pine">Free with {line.item.sourceCouponCode}</p>
                      ) : (
                        <div className="mt-2 flex w-fit items-center rounded-full border border-stone">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(line.item.productId, line.item.variantId, line.item.quantity, Math.max(0, line.item.quantity - 1), isSingle)}
                            className="focus-ring px-2 py-1"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="px-2 text-xs">{line.item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(line.item.productId, line.item.variantId, line.item.quantity, line.item.quantity + 1, isSingle)}
                            className="focus-ring px-2 py-1"
                            aria-label="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      {hasLineDiscount && (
                        <p className="text-xs text-gray-400 line-through">{formatCurrency(originalLinePrice)}</p>
                      )}
                      <p className="text-sm font-semibold text-pine">{isCouponItem ? "FREE" : formatCurrency(line.linePrice)}</p>
                      {!isCouponItem && (
                        <button
                          type="button"
                          onClick={() => handleRemove(line.item.productId, line.item.variantId, line.item.quantity, isSingle)}
                          className="focus-ring mt-1 inline-flex items-center gap-1 text-xs text-gray-500"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {pricing.eligibleQty < 3 && !hasComboOf3InCart && !hasComboOf6InCart && (
            <section className="card-surface nudge-pop-glow border border-pine/30 bg-gradient-to-r from-green-50 to-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-pine">Unlock 3-Item Offer</p>
              <h3 className="mt-1 text-base font-semibold text-ink">
                Add {3 - pricing.eligibleQty} more item{3 - pricing.eligibleQty === 1 ? "" : "s"} to unlock checkout discount.
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Unlock <span className="font-semibold text-pine">COMBO03</span> with free delivery and extra savings at 3 items.
              </p>
              <Link href="/collections/flavoured-makhana" className="focus-ring nudge-pop-glow mt-3 inline-flex items-center gap-1 rounded-full bg-pine px-4 py-2 text-sm font-semibold text-white">
                Add More Items <ArrowRight size={14} />
              </Link>
            </section>
          )}

          {pricing.eligibleQty >= 3 && pricing.eligibleQty < 6 && !hasComboOf6InCart && (
            <section className="card-surface nudge-pop-glow border border-pine/30 bg-gradient-to-r from-green-50 to-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-pine">Discount Upgrade Available</p>
              <h3 className="mt-1 text-base font-semibold text-ink">You unlocked 3-item discount. Add 3 more items for 6-item deal.</h3>
              <p className="mt-1 text-sm text-gray-600">
                Current: <span className="font-semibold text-pine">COMBO03</span> | Next at 6 items:
                {" "}
                <span className="font-semibold text-pine">PARTY06 (bigger discount)</span>
              </p>
              <Link href="/collections/flavoured-makhana" className="focus-ring nudge-pop-glow mt-3 inline-flex items-center gap-1 rounded-full bg-pine px-4 py-2 text-sm font-semibold text-white">
                Add More Items <ArrowRight size={14} />
              </Link>
            </section>
          )}

          <section className="card-surface p-5">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-pine" />
              <h2 className="text-lg font-semibold">Add More & Save More</h2>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {recommendedProducts.map((product, index) => {
                const highlighted = index === activeRecommendation;
                return (
                  <motion.div
                    key={product.id}
                    animate={{ scale: highlighted ? 1.02 : 1, y: highlighted ? -2 : 0 }}
                    transition={{ duration: 0.2 }}
                    className={`rounded-lg border p-2 ${highlighted ? "border-pine bg-green-50" : "border-stone bg-white"}`}
                  >
                    <div className="relative mb-1 aspect-square overflow-hidden rounded-md bg-sand">
                      <Image src={product.images[0]} alt={product.title} fill className="object-contain p-1" sizes="160px" />
                    </div>
                    <p className="line-clamp-1 text-xs font-semibold">{product.title}</p>
                    <p className="text-[11px] text-gray-500">{formatCurrency(product.price)}</p>
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

                        const isSingle = isEligibleSinglePack(product);
                        const nextEligibleQty = isSingle ? pricing.eligibleQty + 1 : pricing.eligibleQty;
                        if ((pricing.eligibleQty < 3 && nextEligibleQty >= 3) || (pricing.eligibleQty < 6 && nextEligibleQty >= 6)) {
                          setShowConfetti(true);
                        }
                      }}
                      className="focus-ring mt-1 w-full rounded-full border border-pine py-1 text-[11px] font-medium text-pine"
                    >
                      Add
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </section>
        </div>

        {renderPaymentSummary("card-surface hidden h-fit p-5 lg:sticky lg:top-24 lg:block")}
      </div>

      {showCouponList && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 p-3 sm:items-center sm:p-6"
          onClick={() => setShowCouponList(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl border border-stone bg-white p-4 shadow-2xl sm:p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-ink">Available Coupon Codes</h3>
              <button
                type="button"
                onClick={() => setShowCouponList(false)}
                className="focus-ring rounded-full border border-stone px-3 py-1 text-xs text-gray-600"
              >
                Close
              </button>
            </div>
            <div className="mt-3 max-h-[60vh] space-y-2 overflow-y-auto pr-1">
              {COUPON_OFFERS.filter((coupon) => !["NAVA001", "YUVA200", "YUVA400", "YUVA03"].includes(coupon.code)).map((coupon) => (
                <button
                  key={coupon.code}
                  type="button"
                  onClick={() => {
                    setCouponInput(coupon.code);
                    applyCouponCode(coupon.code);
                    setShowCouponList(false);
                  }}
                  className="focus-ring block w-full rounded-md border border-pine/25 bg-pine/5 px-3 py-2 text-left text-ink hover:border-pine/40"
                >
                  <p className="font-semibold">{coupon.code} - {coupon.description}</p>
                  <p className="text-[11px] text-gray-600">
                    {eligibleCouponCodes.includes(coupon.code) ? "Eligible for current cart" : getCouponIneligibilityReason(coupon.code)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
