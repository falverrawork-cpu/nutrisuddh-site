"use client";

import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { FormSubmission, Order } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";

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

type ReplyDraft = {
  subject: string;
  message: string;
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

const formatCustomerPhone = (value?: string) => {
  const digits = (value ?? "").replace(/\D/g, "");
  if (!digits) return "-";
  const local = digits.slice(-10);
  if (local.length !== 10) return value ?? "-";
  return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
};

const SELLER_NAME = "NS AGRO OVERSEAS";
const SELLER_ADDRESS = "Krishna Heights Building, Shop No 4, Pranami Mandir Road, Ward 40, Dist Darjeeling, Siliguri 734001.";
const SELLER_CONTACT = "+91 7001988499";
const SELLER_EMAIL = "contact@nutrisuddh.com";
const SELLER_GSTIN = "19AKHPJ3048G1Z5";
const SELLER_FSSAI = "12825999000593";
const HSN_CODE = "20081930";
const GST_RATE_PERCENT = 5;
const CGST_RATE_PERCENT = GST_RATE_PERCENT / 2;
const SGST_RATE_PERCENT = GST_RATE_PERCENT / 2;

const roundCurrency = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

function getInclusiveTaxBreakup(amount: number) {
  if (amount <= 0) {
    return { taxableValue: 0, cgst: 0, sgst: 0 };
  }

  const taxableValue = roundCurrency((amount * 100) / (100 + GST_RATE_PERCENT));
  const totalGst = roundCurrency(amount - taxableValue);
  const cgst = roundCurrency(totalGst / 2);
  const sgst = roundCurrency(totalGst - cgst);

  return { taxableValue, cgst, sgst };
}

function buildInvoiceHtml(order: Order) {
  const invoiceTax = getInclusiveTaxBreakup(order.total);
  const rows = order.items
    .map(
      (item) => {
        const lineTax = getInclusiveTaxBreakup(item.lineTotal);
        return `<tr>
          <td>${escapeHtml(item.productTitle)}</td>
          <td>${escapeHtml(item.variantLabel)}</td>
          <td>${HSN_CODE}</td>
          <td>${item.quantity}</td>
          <td>${GST_RATE_PERCENT}%</td>
          <td>${formatCurrency(lineTax.taxableValue)}</td>
          <td>${formatCurrency(item.lineTotal)}</td>
        </tr>`;
      }
    )
    .join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Tax Invoice ${escapeHtml(order.id)}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #1f2937; background: #fffdf8; }
    h1 { margin: 0 0 12px; color: #184b39; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; font-size: 13px; }
    th { background: #184b39; color: #ffffff; }
    .meta { margin: 4px 0; font-size: 13px; }
    .totals { margin-top: 16px; width: 360px; margin-left: auto; }
    .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
    .bold { font-weight: 700; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
    .card { border: 1px solid #d1d5db; border-radius: 12px; padding: 14px; background: #ffffff; }
    .signature { margin-top: 36px; padding-top: 8px; border-top: 1px solid #9ca3af; text-align: right; }
  </style>
</head>
<body>
  <h1>Tax Invoice</h1>
  <div class="grid">
    <div class="card">
      <p class="meta"><strong>${SELLER_NAME}</strong></p>
      <p class="meta"><strong>Address:</strong> ${SELLER_ADDRESS}</p>
      <p class="meta"><strong>Contact:</strong> ${SELLER_CONTACT}</p>
      <p class="meta"><strong>Email:</strong> ${SELLER_EMAIL}</p>
      <p class="meta"><strong>GSTIN:</strong> ${SELLER_GSTIN}</p>
      <p class="meta"><strong>FSSAI License:</strong> ${SELLER_FSSAI}</p>
    </div>
    <div class="card">
      <p class="meta"><strong>Order ID:</strong> ${escapeHtml(order.id)}</p>
      <p class="meta"><strong>Invoice Date:</strong> ${formatDate(order.createdAt)}</p>
      <p class="meta"><strong>Payment ID:</strong> ${escapeHtml(order.paymentId)}</p>
      <p class="meta"><strong>Payment Mode:</strong> Online</p>
      <p class="meta"><strong>Order Source:</strong> Website</p>
    </div>
  </div>
  <p class="meta"><strong>Order ID:</strong> ${escapeHtml(order.id)}</p>
  <p class="meta"><strong>Payment ID:</strong> ${escapeHtml(order.paymentId)}</p>
  <p class="meta"><strong>Payment Status:</strong> ${escapeHtml(order.paymentStatus ?? (order.paymentId ? "Paid" : "Pending"))}</p>
  <p class="meta"><strong>Placed:</strong> ${formatDate(order.createdAt)}</p>
  <div class="card" style="margin-top: 16px;">
    <p class="meta"><strong>Bill To</strong></p>
    <p class="meta"><strong>Name:</strong> ${escapeHtml(order.customerName ?? "-")}</p>
    <p class="meta"><strong>Address:</strong> ${escapeHtml(order.addressLine1 ?? "-")}, ${escapeHtml(order.addressLine2 ?? "-")}, ${escapeHtml(order.shippingCity ?? "-")} ${escapeHtml(order.shippingState ?? "")} - ${escapeHtml(order.pinCode ?? "-")}</p>
    <p class="meta"><strong>GST:</strong> ${escapeHtml(order.customerGstn || "Nil")}</p>
    <p class="meta"><strong>Phone:</strong> ${escapeHtml(formatCustomerPhone(order.customerPhone))}</p>
    <p class="meta"><strong>Email:</strong> ${escapeHtml(order.customerEmail ?? "-")}</p>
  </div>
  <table>
    <thead>
      <tr><th>Product</th><th>Variant</th><th>HSN</th><th>Qty</th><th>GST Rate</th><th>Taxable Value</th><th>Amount</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="totals">
    <div><span>Subtotal</span><span>${formatCurrency(order.subtotal)}</span></div>
    <div><span>${escapeHtml(order.discountCode ?? "Discount")}</span><span>-${formatCurrency(order.discountAmount)}</span></div>
    <div><span>Shipping</span><span>${order.shipping === 0 ? "Free" : formatCurrency(order.shipping)}</span></div>
    <div><span>Taxable Value</span><span>${formatCurrency(invoiceTax.taxableValue)}</span></div>
    <div><span>CGST @ ${CGST_RATE_PERCENT}%</span><span>${formatCurrency(invoiceTax.cgst)}</span></div>
    <div><span>SGST @ ${SGST_RATE_PERCENT}%</span><span>${formatCurrency(invoiceTax.sgst)}</span></div>
    <div class="bold"><span>Total</span><span>${formatCurrency(order.total)}</span></div>
  </div>
  <div class="card" style="margin-top: 16px;">
    <p class="meta"><strong>Terms & Conditions</strong></p>
    <p class="meta">Goods once sold will not be taken back.</p>
    <p class="meta">Subject to Siliguri Jurisdiction.</p>
  </div>
  <div class="signature">
    <p><strong>Authorized Signature</strong></p>
    <p>For ${SELLER_NAME}</p>
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
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  window.setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 1000);
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
  const [forms, setForms] = useState<FormSubmission[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [activeTab, setActiveTab] = useState<"users" | "orders" | "forms" | "bulk">("orders");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [orderStatusDrafts, setOrderStatusDrafts] = useState<Record<string, AdminOrderStatus>>({});
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [mailingInvoiceOrderId, setMailingInvoiceOrderId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [userDraft, setUserDraft] = useState<{ name: string; phone: string; email: string; role: "user" | "admin" } | null>(null);
  const [savingUserId, setSavingUserId] = useState<number | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [replyingFormId, setReplyingFormId] = useState<number | null>(null);
  const [deletingFormId, setDeletingFormId] = useState<number | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<number, ReplyDraft>>({});
  const [loading, setLoading] = useState(true);
  const addToast = useUIStore((state) => state.addToast);

  const bulkForms = useMemo(
    () => forms.filter((form) => form.formType === "bulk"),
    [forms]
  );

  const contactForms = useMemo(
    () => forms.filter((form) => form.formType !== "bulk"),
    [forms]
  );

  const formsCountLabel = useMemo(() => {
    const newCount = contactForms.filter((form) => form.status !== "replied").length;
    return newCount > 0 ? `Forms (${newCount})` : "Forms";
  }, [contactForms]);

  const bulkCountLabel = useMemo(() => {
    const newCount = bulkForms.filter((form) => form.status !== "replied").length;
    return newCount > 0 ? `Bulk Queries (${newCount})` : "Bulk Queries";
  }, [bulkForms]);

  useEffect(() => {
    const run = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const [ordersResult, usersResult, formsResult] = await Promise.all([
          apiFetch<{ orders: Order[] }>("/api/admin/orders", {}, token),
          apiFetch<{ users: AdminUser[] }>("/api/admin/users", {}, token),
          apiFetch<{ forms: FormSubmission[] }>("/api/admin/forms", {}, token)
        ]);
        setOrders(ordersResult.orders);
        setSummary(summarizeOrders(ordersResult.orders));
        setUsers(usersResult.users);
        setForms(formsResult.forms);
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
      setOrderStatusDrafts((current) => {
        const next = { ...current };
        delete next[orderId];
        return next;
      });
      addToast(`Order ${orderId} marked as ${status}`);
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Unable to update status.", "info");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getDraftStatus = (order: Order) => orderStatusDrafts[order.id] ?? order.status;

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

  const sendInvoiceTestMail = async (orderId: string) => {
    if (!token) return;
    setMailingInvoiceOrderId(orderId);
    try {
      await apiFetch<{ ok: true; orderId: string }>(`/api/admin/orders/${orderId}/test-invoice-email`, {
        method: "POST"
      }, token);
      addToast(`Invoice test email sent for ${orderId}.`);
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Unable to send invoice test email.", "info");
    } finally {
      setMailingInvoiceOrderId(null);
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

  const updateReplyDraft = (formId: number, nextDraft: ReplyDraft) => {
    setReplyDrafts((current) => ({
      ...current,
      [formId]: nextDraft
    }));
  };

  const getReplyDraft = (form: FormSubmission): ReplyDraft => {
    const existing = replyDrafts[form.id];
    if (existing) return existing;
    return {
      subject: form.replySubject || (form.subject ? `Re: ${form.subject}` : "Regarding your enquiry with Nutri Suddh"),
      message: form.replyMessage || ""
    };
  };

  const sendFormReply = async (form: FormSubmission) => {
    if (!token) return;
    const draft = getReplyDraft(form);
    if (!draft.subject.trim()) {
      addToast("Reply subject is required.", "info");
      return;
    }
    if (!draft.message.trim()) {
      addToast("Reply message is required.", "info");
      return;
    }

    setReplyingFormId(form.id);
    try {
      const result = await apiFetch<{ ok: true; form: FormSubmission }>(`/api/admin/forms/${form.id}/reply`, {
        method: "POST",
        body: JSON.stringify(draft)
      }, token);

      setForms((current) => current.map((item) => (item.id === form.id ? result.form : item)));
      updateReplyDraft(form.id, {
        subject: result.form.replySubject || draft.subject,
        message: result.form.replyMessage || draft.message
      });
      addToast(`Reply sent to ${form.email}`);
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Unable to send reply.", "info");
    } finally {
      setReplyingFormId(null);
    }
  };

  const deleteFormQuery = async (form: FormSubmission) => {
    if (!token) return;
    if (form.status !== "replied") {
      addToast("Only resolved queries can be deleted.", "info");
      return;
    }
    if (!window.confirm("Delete this resolved query? This cannot be undone.")) return;

    setDeletingFormId(form.id);
    try {
      await apiFetch<{ ok: true; formId: number }>(`/api/admin/forms/${form.id}`, {
        method: "DELETE"
      }, token);
      setForms((current) => current.filter((item) => item.id !== form.id));
      addToast("Query deleted successfully.");
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Unable to delete query.", "info");
    } finally {
      setDeletingFormId(null);
    }
  };

  const renderFormsPanel = (targetForms: FormSubmission[], emptyMessage: string) => (
    <article className="space-y-3">
      {targetForms.length === 0 ? (
        <div className="card-surface p-4 text-sm text-gray-600">{emptyMessage}</div>
      ) : targetForms.map((form) => {
        const draft = getReplyDraft(form);
        return (
          <div key={form.id} className="card-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-ink">{form.name} ({form.email})</p>
                <p className="text-xs text-gray-500">{form.formType.toUpperCase()} form • {new Date(form.createdAt).toLocaleString("en-IN")}</p>
              </div>
              <span className={`rounded-full border px-2 py-1 text-xs font-medium ${form.status === "replied" ? "border-pine/30 bg-pine/10 text-pine" : "border-amber-300 bg-amber-50 text-amber-700"}`}>
                {form.status === "replied" ? "Replied" : "New"}
              </span>
            </div>

            <div className="mt-3 grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
              <p><span className="font-medium text-ink">Phone:</span> {form.phone || "-"}</p>
              <p><span className="font-medium text-ink">Subject:</span> {form.subject || "-"}</p>
              <p><span className="font-medium text-ink">Company:</span> {form.company || "-"}</p>
              <p><span className="font-medium text-ink">Country:</span> {form.country || "-"}</p>
              <p className="sm:col-span-2"><span className="font-medium text-ink">Quantity:</span> {form.quantity || "-"}</p>
              <p className="sm:col-span-2"><span className="font-medium text-ink">Message:</span> {form.message}</p>
            </div>

            <div className="mt-4 rounded-xl border border-stone/70 bg-stone/20 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">Reply to Customer</p>
              <input
                className="focus-ring mt-2 w-full rounded-md border border-stone px-3 py-2 text-sm"
                placeholder="Reply subject"
                value={draft.subject}
                onChange={(event) => updateReplyDraft(form.id, { ...draft, subject: event.target.value })}
              />
              <textarea
                className="focus-ring mt-2 min-h-24 w-full rounded-md border border-stone px-3 py-2 text-sm"
                placeholder="Reply message"
                value={draft.message}
                onChange={(event) => updateReplyDraft(form.id, { ...draft, message: event.target.value })}
              />
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => sendFormReply(form)}
                  disabled={replyingFormId === form.id}
                  className="focus-ring rounded-full border border-pine px-4 py-2 text-xs font-semibold text-pine disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {replyingFormId === form.id ? "Sending..." : "Send Reply"}
                </button>
                <button
                  type="button"
                  onClick={() => deleteFormQuery(form)}
                  disabled={form.status !== "replied" || deletingFormId === form.id}
                  className="focus-ring rounded-full border border-red-300 px-4 py-2 text-xs font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingFormId === form.id ? "Deleting..." : "Delete Query"}
                </button>
                {form.repliedAt ? (
                  <p className="text-xs text-gray-500">Last replied: {new Date(form.repliedAt).toLocaleString("en-IN")}</p>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </article>
  );

  if (!token || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <h1 className="font-display text-4xl">Admin Dashboard</h1>
      <p className="mt-2 text-sm text-gray-600">Track orders, users, forms, and bulk queries in one place.</p>

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
            onClick={() => setActiveTab("forms")}
            className={`focus-ring rounded-full border px-4 py-2 text-sm font-medium ${
              activeTab === "forms" ? "border-pine bg-pine text-white" : "border-stone text-ink"
            }`}
          >
            {formsCountLabel}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("bulk")}
            className={`focus-ring rounded-full border px-4 py-2 text-sm font-medium ${
              activeTab === "bulk" ? "border-pine bg-pine text-white" : "border-stone text-ink"
            }`}
          >
            {bulkCountLabel}
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
          <p className="text-sm text-gray-600">Loading admin data...</p>
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
        ) : activeTab === "forms" ? (
          renderFormsPanel(contactForms, "No contact form submissions yet.")
        ) : activeTab === "bulk" ? (
          renderFormsPanel(bulkForms, "No bulk queries yet.")
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
                              onClick={() =>
                                setOrderStatusDrafts((current) => ({ ...current, [order.id]: status }))
                              }
                              disabled={updatingOrderId === order.id}
                              className={`focus-ring rounded-full border px-3 py-1 text-xs ${
                                getDraftStatus(order) === status
                                  ? "border-pine bg-pine/10 text-pine"
                                  : "border-stone text-ink"
                              } disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                              {status}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => updateStatus(order.id, getDraftStatus(order) as AdminOrderStatus)}
                            disabled={updatingOrderId === order.id || getDraftStatus(order) === order.status}
                            className="focus-ring rounded-full bg-pine px-3 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {updatingOrderId === order.id ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => downloadInvoice(order)}
                            className="focus-ring rounded-full border border-pine px-3 py-1 text-xs text-pine"
                          >
                            Download
                          </button>
                          <button
                            type="button"
                            onClick={() => sendInvoiceTestMail(order.id)}
                            disabled={mailingInvoiceOrderId === order.id}
                            className="focus-ring rounded-full border border-pine px-3 py-1 text-xs text-pine disabled:opacity-50"
                          >
                            {mailingInvoiceOrderId === order.id ? "Mailing..." : "Mail Invoice"}
                          </button>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <button
                          type="button"
                          onClick={() => deleteOrder(order.id)}
                          disabled={deletingOrderId === order.id}
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
