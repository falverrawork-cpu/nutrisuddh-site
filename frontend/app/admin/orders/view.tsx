"use client";

import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";
import { Order } from "@/lib/types";

type Summary = {
  totalOrders: number;
  totalRevenue: number;
  confirmedOrders: number;
  dispatchedOrders: number;
  deliveredOrders: number;
};

type AdminUser = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin";
  createdAt: string;
};

const ORDER_STATUSES = ["Order Confirmed", "Dispatched", "Delivered"] as const;
type AdminOrderStatus = (typeof ORDER_STATUSES)[number];

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

function buildInvoiceHtml(order: Order) {
  const rows = order.items
    .map(
      (item) =>
        `<tr><td>${escapeHtml(item.productTitle)}</td><td>${escapeHtml(item.variantLabel)}</td><td>${item.quantity}</td><td>${formatCurrency(item.lineTotal)}</td></tr>`
    )
    .join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice ${escapeHtml(order.id)}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #1f2937; }
    h1 { margin: 0 0 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; font-size: 13px; }
    th { background: #f9fafb; }
    .meta { margin: 4px 0; font-size: 13px; }
    .totals { margin-top: 16px; width: 320px; margin-left: auto; }
    .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
    .bold { font-weight: 700; }
  </style>
</head>
<body>
  <h1>Invoice</h1>
  <p class="meta"><strong>Order ID:</strong> ${escapeHtml(order.id)}</p>
  <p class="meta"><strong>Payment ID:</strong> ${escapeHtml(order.paymentId)}</p>
  <p class="meta"><strong>Payment Status:</strong> ${escapeHtml(order.paymentStatus ?? (order.paymentId ? "Paid" : "Pending"))}</p>
  <p class="meta"><strong>Placed:</strong> ${formatDate(order.createdAt)}</p>
  <p class="meta"><strong>Customer:</strong> ${escapeHtml(order.customerName ?? "-")}</p>
  <p class="meta"><strong>Email:</strong> ${escapeHtml(order.customerEmail ?? "-")}</p>
  <p class="meta"><strong>Phone:</strong> ${escapeHtml(order.customerPhone ?? "-")}</p>
  <p class="meta"><strong>Address:</strong> ${escapeHtml(order.addressLine1 ?? "-")}, ${escapeHtml(order.addressLine2 ?? "-")} - ${escapeHtml(order.pinCode ?? "-")}</p>
  <table>
    <thead>
      <tr><th>Product</th><th>Variant</th><th>Qty</th><th>Amount</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="totals">
    <div><span>Subtotal</span><span>${formatCurrency(order.subtotal)}</span></div>
    <div><span>${escapeHtml(order.discountCode ?? "Discount")}</span><span>-${formatCurrency(order.discountAmount)}</span></div>
    <div><span>Shipping</span><span>${order.shipping === 0 ? "Free" : formatCurrency(order.shipping)}</span></div>
    <div class="bold"><span>Total</span><span>${formatCurrency(order.total)}</span></div>
  </div>
</body>
</html>`;
}

function downloadInvoice(order: Order) {
  const html = buildInvoiceHtml(order);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `invoice-${order.id}.html`;
  link.click();
  URL.revokeObjectURL(url);
}

function summarizeOrders(orders: Order[]): Summary {
  return orders.reduce(
    (acc, order) => {
      acc.totalOrders += 1;
      acc.totalRevenue += order.total;
      if (order.status === "Dispatched") {
        acc.dispatchedOrders += 1;
      } else if (order.status === "Delivered" || order.status === "Completed") {
        acc.deliveredOrders += 1;
      } else {
        acc.confirmedOrders += 1;
      }
      return acc;
    },
    {
      totalOrders: 0,
      totalRevenue: 0,
      confirmedOrders: 0,
      dispatchedOrders: 0,
      deliveredOrders: 0
    }
  );
}

export function AdminOrdersView() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [activeTab, setActiveTab] = useState<"users" | "orders">("orders");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [userDraft, setUserDraft] = useState<{ name: string; phone: string; email: string; role: "user" | "admin" } | null>(null);
  const [savingUserId, setSavingUserId] = useState<number | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [loading, setLoading] = useState(true);
  const addToast = useUIStore((state) => state.addToast);

  useEffect(() => {
    const run = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const [ordersResult, usersResult] = await Promise.all([
          apiFetch<{ orders: Order[] }>("/api/admin/orders", {}, token),
          apiFetch<{ users: AdminUser[] }>("/api/admin/users", {}, token)
        ]);
        setOrders(ordersResult.orders);
        setSummary(summarizeOrders(ordersResult.orders));
        setUsers(usersResult.users);
      } catch (error) {
        addToast(error instanceof Error ? error.message : "Unable to fetch admin dashboard.", "info");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [addToast, token]);

  const updateStatus = async (orderId: string, status: AdminOrderStatus) => {
    if (!token) return;
    setUpdatingOrderId(orderId);
    try {
      await apiFetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      }, token);
      setOrders((current) => {
        const nextOrders = current.map((order) => (order.id === orderId ? { ...order, status } : order));
        setSummary(summarizeOrders(nextOrders));
        return nextOrders;
      });
      addToast(`Order ${orderId} marked as ${status}`);
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Unable to update status.", "info");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const beginEditUser = (targetUser: AdminUser) => {
    setEditingUserId(targetUser.id);
    setUserDraft({
      name: targetUser.name,
      phone: targetUser.phone ?? "",
      email: targetUser.email,
      role: targetUser.role
    });
  };

  const saveUser = async (userId: number) => {
    if (!token || !userDraft) return;
    setSavingUserId(userId);
    try {
      const result = await apiFetch<{ user: AdminUser }>("/api/admin/users/" + userId, {
        method: "PATCH",
        body: JSON.stringify(userDraft)
      }, token);
      setUsers((current) => current.map((item) => (item.id === userId ? { ...item, ...result.user } : item)));
      setEditingUserId(null);
      setUserDraft(null);
      addToast("User updated successfully.");
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Unable to update user.", "info");
    } finally {
      setSavingUserId(null);
    }
  };

  const deleteUser = async (userId: number) => {
    if (!token) return;
    if (!window.confirm("Delete this user and all related orders? This cannot be undone.")) return;
    setDeletingUserId(userId);
    try {
      await apiFetch<{ ok: boolean; userId: number }>("/api/admin/users/" + userId, {
        method: "DELETE"
      }, token);
      setUsers((current) => current.filter((item) => item.id !== userId));
      setOrders((current) => {
        const nextOrders = current.filter((order) => order.userId !== userId);
        setSummary(summarizeOrders(nextOrders));
        return nextOrders;
      });
      addToast("User deleted successfully.");
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Unable to delete user.", "info");
    } finally {
      setDeletingUserId(null);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!token) return;
    if (!window.confirm("Delete this completed order? This action cannot be undone.")) return;
    setDeletingOrderId(orderId);
    try {
      await apiFetch<{ ok: true; orderId: string }>("/api/admin/orders/" + orderId, {
        method: "DELETE"
      }, token);
      setOrders((current) => {
        const nextOrders = current.filter((item) => item.id !== orderId);
        setSummary(summarizeOrders(nextOrders));
        return nextOrders;
      });
      addToast(`Order ${orderId} deleted.`);
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Unable to delete order.", "info");
    } finally {
      setDeletingOrderId(null);
    }
  };

  const sendTestEmail = async () => {
    if (!token) return;
    setSendingTestEmail(true);
    try {
      await apiFetch<{ ok: true }>("/api/admin/test-email", { method: "POST" }, token);
      addToast("Test email sent. Please check admin inbox.");
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Unable to send test email.", "info");
    } finally {
      setSendingTestEmail(false);
    }
  };

  if (!token || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <h1 className="font-display text-4xl">Admin Order Dashboard</h1>
      <p className="mt-2 text-sm text-gray-600">Track all customer orders and summary in one place.</p>

      {summary && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <article className="card-surface p-4"><p className="text-xs text-gray-500">Total Orders</p><p className="mt-1 text-2xl font-semibold">{summary.totalOrders}</p></article>
          <article className="card-surface p-4"><p className="text-xs text-gray-500">Revenue</p><p className="mt-1 text-2xl font-semibold">{formatCurrency(summary.totalRevenue)}</p></article>
          <article className="card-surface p-4"><p className="text-xs text-gray-500">Order Confirmed</p><p className="mt-1 text-2xl font-semibold">{summary.confirmedOrders}</p></article>
          <article className="card-surface p-4"><p className="text-xs text-gray-500">Dispatched</p><p className="mt-1 text-2xl font-semibold">{summary.dispatchedOrders}</p></article>
          <article className="card-surface p-4"><p className="text-xs text-gray-500">Delivered</p><p className="mt-1 text-2xl font-semibold">{summary.deliveredOrders}</p></article>
        </div>
      )}

      <div className="mt-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`focus-ring rounded-full border px-4 py-2 text-sm font-medium ${
              activeTab === "orders" ? "border-pine bg-pine text-white" : "border-stone text-ink"
            }`}
          >
            Orders
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`focus-ring rounded-full border px-4 py-2 text-sm font-medium ${
              activeTab === "users" ? "border-pine bg-pine text-white" : "border-stone text-ink"
            }`}
          >
            Users
          </button>
          <button
            type="button"
            onClick={sendTestEmail}
            disabled={sendingTestEmail}
            className="focus-ring rounded-full border border-pine px-4 py-2 text-sm font-medium text-pine disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sendingTestEmail ? "Sending..." : "Test Email"}
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-gray-600">Loading orders...</p>
        ) : activeTab === "users" ? (
          <article className="card-surface p-4">
            <h2 className="text-lg font-semibold">Registered Users</h2>
            {users.length === 0 ? (
              <p className="mt-2 text-sm text-gray-600">No users found.</p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-stone text-xs uppercase tracking-[0.08em] text-gray-500">
                      <th className="px-2 py-2">ID</th>
                      <th className="px-2 py-2">Name</th>
                      <th className="px-2 py-2">Phone</th>
                      <th className="px-2 py-2">Email</th>
                      <th className="px-2 py-2">Role</th>
                      <th className="px-2 py-2">Created</th>
                      <th className="px-2 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((registeredUser) => (
                      <tr key={registeredUser.id} className="border-b border-stone/70 last:border-b-0">
                        <td className="px-2 py-2 text-gray-700">{registeredUser.id}</td>
                        <td className="px-2 py-2 font-medium text-ink">
                          {editingUserId === registeredUser.id ? (
                            <input
                              value={userDraft?.name ?? ""}
                              onChange={(event) => setUserDraft((current) => current ? { ...current, name: event.target.value } : current)}
                              className="focus-ring w-full rounded-md border border-stone px-2 py-1 text-sm"
                            />
                          ) : registeredUser.name}
                        </td>
                        <td className="px-2 py-2 text-gray-700">
                          {editingUserId === registeredUser.id ? (
                            <input
                              value={userDraft?.phone ?? ""}
                              onChange={(event) => setUserDraft((current) => current ? { ...current, phone: event.target.value } : current)}
                              className="focus-ring w-full rounded-md border border-stone px-2 py-1 text-sm"
                            />
                          ) : (registeredUser.phone || "-")}
                        </td>
                        <td className="px-2 py-2 text-gray-700">
                          {editingUserId === registeredUser.id ? (
                            <input
                              value={userDraft?.email ?? ""}
                              onChange={(event) => setUserDraft((current) => current ? { ...current, email: event.target.value } : current)}
                              className="focus-ring w-full rounded-md border border-stone px-2 py-1 text-sm"
                            />
                          ) : registeredUser.email}
                        </td>
                        <td className="px-2 py-2 text-gray-700">
                          {editingUserId === registeredUser.id ? (
                            <select
                              value={userDraft?.role ?? "user"}
                              disabled={registeredUser.id === user.id}
                              onChange={(event) => setUserDraft((current) => current ? { ...current, role: event.target.value as "user" | "admin" } : current)}
                              className="focus-ring rounded-md border border-stone px-2 py-1 text-sm"
                            >
                              <option value="user">user</option>
                              <option value="admin">admin</option>
                            </select>
                          ) : registeredUser.role}
                        </td>
                        <td className="px-2 py-2 text-gray-700">{new Date(registeredUser.createdAt).toLocaleDateString("en-IN")}</td>
                        <td className="px-2 py-2">
                          <div className="flex flex-wrap gap-2">
                            {editingUserId === registeredUser.id ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => saveUser(registeredUser.id)}
                                  disabled={savingUserId === registeredUser.id}
                                  className="focus-ring rounded-full border border-pine px-3 py-1 text-xs text-pine disabled:opacity-50"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingUserId(null);
                                    setUserDraft(null);
                                  }}
                                  className="focus-ring rounded-full border border-stone px-3 py-1 text-xs"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => beginEditUser(registeredUser)}
                                className="focus-ring rounded-full border border-stone px-3 py-1 text-xs"
                              >
                                Edit
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => deleteUser(registeredUser.id)}
                              disabled={registeredUser.id === user.id || deletingUserId === registeredUser.id}
                              className="focus-ring rounded-full border border-red-300 px-3 py-1 text-xs text-red-700 disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        ) : orders.length === 0 ? (
          <p className="text-sm text-gray-600">No orders yet.</p>
        ) : (
          <article className="card-surface p-4">
            <h2 className="text-lg font-semibold">All Orders</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead>
                  <tr className="border-b border-stone text-xs uppercase tracking-[0.08em] text-gray-500">
                    <th className="px-2 py-2">Order</th>
                    <th className="px-2 py-2">User ID</th>
                    <th className="px-2 py-2">Customer</th>
                    <th className="px-2 py-2">Address</th>
                    <th className="px-2 py-2">Payment</th>
                    <th className="px-2 py-2">Amount</th>
                    <th className="px-2 py-2">Order Status</th>
                    <th className="px-2 py-2">Update Status</th>
                    <th className="px-2 py-2">Invoice</th>
                    <th className="px-2 py-2">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-stone/70 align-top last:border-b-0">
                      <td className="px-2 py-3">
                        <p className="font-semibold text-ink">{order.id}</p>
                        <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString("en-IN")}</p>
                      </td>
                      <td className="px-2 py-3 text-gray-700">{order.userId ?? "-"}</td>
                      <td className="px-2 py-3 text-gray-700">
                        <p className="font-medium text-ink">{order.customerName ?? "-"}</p>
                        <p>{order.customerPhone ?? "-"}</p>
                        <p>{order.customerEmail ?? "-"}</p>
                      </td>
                      <td className="px-2 py-3 text-gray-700">
                        <p>{order.addressLine1 ?? "-"}</p>
                        {order.addressLine2 ? <p>{order.addressLine2}</p> : null}
                        <p>{order.pinCode ?? "-"}</p>
                      </td>
                      <td className="px-2 py-3 text-gray-700">
                        <p className={order.paymentStatus === "Paid" ? "font-semibold text-pine" : "font-semibold text-amber-700"}>
                          {order.paymentStatus ?? (order.paymentId ? "Paid" : "Pending")}
                        </p>
                        <p className="text-xs text-gray-500">Payment ID: {order.paymentId || "-"}</p>
                      </td>
                      <td className="px-2 py-3 font-semibold text-ink">{formatCurrency(order.total)}</td>
                      <td className="px-2 py-3">
                        <span className="rounded-full border border-pine/30 bg-pine/10 px-2 py-1 text-xs font-medium text-pine">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex flex-wrap gap-2">
                          {ORDER_STATUSES.map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => updateStatus(order.id, status)}
                              disabled={updatingOrderId === order.id || order.status === status}
                              className={`focus-ring rounded-full border px-3 py-1 text-xs ${
                                order.status === status
                                  ? "border-pine bg-pine/10 text-pine"
                                  : "border-stone text-ink"
                              } disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <button
                          type="button"
                          onClick={() => downloadInvoice(order)}
                          className="focus-ring rounded-full border border-pine px-3 py-1 text-xs text-pine"
                        >
                          Download
                        </button>
                      </td>
                      <td className="px-2 py-3">
                        <button
                          type="button"
                          onClick={() => deleteOrder(order.id)}
                          disabled={deletingOrderId === order.id || !(order.status === "Delivered" || order.status === "Completed")}
                          className="focus-ring rounded-full border border-red-300 px-3 py-1 text-xs text-red-700 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
