"use client";

import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { useAuthStore, type AuthUser } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";

type AuthResponse = {
  token: string;
  user: AuthUser;
};

export function AdminLoginView() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const setSession = useAuthStore((state) => state.setSession);
  const addToast = useUIStore((state) => state.addToast);
  const navigate = useNavigate();

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      const result = await apiFetch<AuthResponse>("/api/auth/admin/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      setSession(result.token, result.user);
      addToast("Admin login successful");
      navigate("/admin/orders");
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Admin login failed.", "info");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-surface mx-auto max-w-lg p-6">
      <h1 className="font-display text-3xl">Admin Login</h1>
      <p className="mt-2 text-sm text-gray-600">Track all orders and update status.</p>
      <form onSubmit={onSubmit} className="mt-4 grid gap-3">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin email" className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm" />
        <button type="submit" disabled={loading} className={`focus-ring rounded-full py-2.5 text-sm font-semibold ${loading ? "bg-gray-300 text-gray-600" : "bg-pine text-white"}`}>
          {loading ? "Please wait..." : "Login as Admin"}
        </button>
      </form>
    </div>
  );
}
