"use client";

import Image from "@/components/common/app-image";
import Link from "@/components/common/app-link";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Order } from "@/lib/types";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";
import { apiFetch } from "@/lib/api";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

const getEstimatedDeliveryDate = (createdAt: string) => {
  const date = new Date(createdAt);
  date.setDate(date.getDate() + 7);
  return date;
};

const canDownloadInvoice = (order: Order) =>
  ["Order Confirmed", "Confirmed", "Dispatched", "Delivered", "Completed"].includes(order.status);

const triggerBrowserDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  window.setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 1000);
};

export function OrdersView() {
  const token = useAuthStore((state) => state.token);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);
  const addToast = useUIStore((state) => state.addToast);
  const [params] = useSearchParams();
  const placedOrderId = params.get("placed");
  const [expandedOrderIds, setExpandedOrderIds] = useState<Set<string>>(
    () => new Set(placedOrderId ? [placedOrderId] : [])
  );

  const toggleExpanded = (orderId: string) => {
    setExpandedOrderIds((current) => {
      const next = new Set(current);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  useEffect(() => {
    let mounted = true;

    const fetchOrders = async (showLoading: boolean) => {
      if (!token) {
        if (mounted) {
          setOrders([]);
          setLoading(false);
        }
        return;
      }

      if (showLoading && mounted) {
        setLoading(true);
      }

      try {
        const result = await apiFetch<{ orders: Order[] }>("/api/orders/my", {}, token);
        if (mounted) {
          setOrders(result.orders);
        }
      } catch (error) {
        if (showLoading) {
          addToast(error instanceof Error ? error.message : "Unable to fetch orders.", "info");
        }
      } finally {
        if (showLoading && mounted) {
          setLoading(false);
        }
      }
    };

    fetchOrders(true);

    const interval = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      fetchOrders(false);
    }, 5000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [addToast, token]);

  const downloadInvoice = async (order: Order) => {
    if (!token) return;

    setDownloadingInvoiceId(order.id);
    try {
      const response = await fetch(`/api/orders/${order.id}/invoice?t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(result?.error ?? "Unable to download invoice.");
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("content-disposition") ?? "";
      const matchedFilename = contentDisposition.match(/filename="?([^"]+)"?/i)?.[1];
      const filename = matchedFilename || (order.invoiceNumber ? `${order.invoiceNumber}.pdf` : `invoice-${order.id}.pdf`);
      triggerBrowserDownload(blob, filename);

      if (!order.invoiceNumber) {
        setOrders((current) =>
          current.map((item) =>
            item.id === order.id
              ? {
                  ...item,
                  invoiceNumber: filename.replace(/\.pdf$/i, ""),
                  invoiceUrl: `/api/orders/${order.id}/invoice`
                }
              : item
          )
        );
      }
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Unable to download invoice.", "info");
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-4xl">My Orders</h1>
      <p className="mt-2 text-sm text-gray-600">Track previous orders and expected delivery timelines.</p>

      {!token ? (
        <div className="card-surface mt-8 max-w-2xl p-8 text-center">
          <h2 className="text-xl font-semibold">Login to view orders</h2>
          <p className="mt-2 text-sm text-gray-600">Your orders are now securely stored in your account.</p>
          <Link href="/account?next=/orders" className="focus-ring mt-4 inline-block rounded-full bg-pine px-5 py-2 text-sm text-white">
            Login / Sign Up
          </Link>
        </div>
      ) : loading ? (
        <div className="card-surface mt-8 max-w-2xl p-8 text-center">
          <p className="text-sm text-gray-600">Loading orders...</p>
        </div>
      ) : !orders.length ? (
        <div className="card-surface mt-8 max-w-2xl p-8 text-center">
          <h2 className="text-xl font-semibold">No orders yet</h2>
          <p className="mt-2 text-sm text-gray-600">Once you complete checkout, your orders will appear here.</p>
          <Link href="/collections/flavoured-makhana" className="focus-ring mt-4 inline-block rounded-full bg-pine px-5 py-2 text-sm text-white">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => {
            const estimatedDeliveryDate = getEstimatedDeliveryDate(order.createdAt);
            const isExpanded = expandedOrderIds.has(order.id);

            return (
              <article
                key={order.id}
                className={`rounded-2xl border p-5 ${order.id === placedOrderId ? "border-pine bg-green-50/40" : "border-stone bg-white"}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Order ID</p>
                    <p className="font-semibold text-ink">{order.id}</p>
                    <p className="mt-1 text-xs text-gray-500">Purchase Date: {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold text-pine">Order Confirmed</p>
                    <p className="text-gray-600">Order Status: {order.status}</p>
                    <p className="text-gray-600">Estimated Delivery Date: {formatDate(estimatedDeliveryDate.toISOString())}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Products</p>
                  <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-1">
                    {order.items.map((item) => (
                      <div
                        key={`${order.id}-${item.productId}-${item.variantLabel}`}
                        className="min-w-[230px] rounded-xl border border-stone bg-white p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-sand">
                            <Image src={item.image} alt={item.productTitle} fill className="object-contain p-1" sizes="56px" />
                          </div>
                          <div className="min-w-0">
                            <p className="line-clamp-1 text-sm font-medium">{item.productTitle}</p>
                            <p className="text-xs text-gray-500">{item.variantLabel}</p>
                            <p className="text-xs text-gray-500">Qty {item.quantity}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleExpanded(order.id)}
                  className="focus-ring mt-4 rounded-full border border-pine px-4 py-2 text-xs font-medium text-pine"
                >
                  {isExpanded ? "Hide Details" : "View More Details"}
                </button>

                {canDownloadInvoice(order) && (
                  <button
                    type="button"
                    onClick={() => downloadInvoice(order)}
                    disabled={downloadingInvoiceId === order.id}
                    className="focus-ring mt-4 ml-2 rounded-full bg-pine px-4 py-2 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {downloadingInvoiceId === order.id ? "Generating Invoice..." : "Download Invoice"}
                  </button>
                )}

                {isExpanded && (
                  <div className="mt-4 rounded-xl border border-stone bg-sand/40 p-4 text-sm">
                    <div className="space-y-1 text-gray-700">
                      <p><strong>Payment ID:</strong> {order.paymentId}</p>
                      <p><strong>Customer:</strong> {order.customerName ?? "-"}</p>
                      <p><strong>Email:</strong> {order.customerEmail ?? "-"}</p>
                      <p><strong>Phone:</strong> {order.customerPhone ?? "-"}</p>
                      <p><strong>Address:</strong> {order.addressLine1 ?? "-"}, {order.addressLine2 ?? "-"} - {order.pinCode ?? "-"}</p>
                    </div>

                    <div className="mt-4 border-t border-stone pt-3 text-sm">
                      <div className="flex items-center justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>{formatCurrency(order.subtotal)}</span>
                      </div>
                      {order.discountCode && order.discountAmount > 0 && (
                        <div className="mt-1 flex items-center justify-between text-pine">
                          <span>{order.discountCode}</span>
                          <span>-{formatCurrency(order.discountAmount)}</span>
                        </div>
                      )}
                      <div className="mt-1 flex items-center justify-between text-gray-600">
                        <span>Shipping</span>
                        <span>{order.shipping === 0 ? "Free" : formatCurrency(order.shipping)}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between font-semibold text-ink">
                        <span>Total</span>
                        <span>{formatCurrency(order.total)}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => downloadInvoice(order)}
                      className="focus-ring mt-4 rounded-full border border-pine px-4 py-2 text-xs font-medium text-pine"
                    >
                      Download Invoice
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
