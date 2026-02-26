"use client";

import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore, type AuthUser } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";

type AuthResponse = {
  token: string;
  user: AuthUser;
};

export function AccountView() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "+91", email: "", password: "" });
  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const addToast = useUIStore((state) => state.addToast);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const nextPath = params.get("next") || "/";

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      name: user.name ?? "",
      phone: user.phone ?? ""
    });
  }, [user]);

  useEffect(() => {
    if (mode !== "signup") return;
    setForm((current) => ({
      ...current,
      phone: current.phone.trim() ? current.phone : "+91"
    }));
  }, [mode]);

  const onUpdateProfile = async (event: FormEvent) => {
    event.preventDefault();
    if (!token || !user || profileLoading) return;

    setProfileLoading(true);
    try {
      const result = await apiFetch<{ user: AuthUser }>(
        "/api/auth/profile",
        {
          method: "PATCH",
          body: JSON.stringify({
            name: profileForm.name,
            phone: profileForm.phone
          })
        },
        token
      );
      setSession(token, result.user);
      addToast("Profile updated successfully");
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Unable to update profile.", "info");
    } finally {
      setProfileLoading(false);
    }
  };

  const onResetPassword = async (event: FormEvent) => {
    event.preventDefault();
    if (!token || passwordLoading) return;

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast("New password and confirm password do not match.", "info");
      return;
    }

    setPasswordLoading(true);
    try {
      await apiFetch(
        "/api/auth/reset-password",
        {
          method: "POST",
          body: JSON.stringify({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword
          })
        },
        token
      );
      setSession(token, { ...user!, hasPassword: true });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      addToast("Password reset successfully");
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Unable to reset password.", "info");
    } finally {
      setPasswordLoading(false);
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (loading) return;
    if (mode === "signup") {
      if (!form.name.trim()) {
        addToast("Name is required.", "info");
        return;
      }
      if (!form.email.trim()) {
        addToast("Email is required.", "info");
        return;
      }
      if (!form.phone.trim()) {
        addToast("Phone number is required.", "info");
        return;
      }
      if (!form.password.trim()) {
        addToast("Password is required.", "info");
        return;
      }
    }

    setLoading(true);
    try {
      const path = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const payload = mode === "login"
        ? { email: form.email, password: form.password }
        : { name: form.name, phone: form.phone, email: form.email, password: form.password };

      const result = await apiFetch<AuthResponse>(path, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      setSession(result.token, result.user);
      addToast(mode === "login" ? "Logged in successfully" : "Account created successfully");
      navigate(nextPath);
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Authentication failed.", "info");
    } finally {
      setLoading(false);
    }
  };

  if (token && user) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="card-surface p-6">
        <h1 className="font-display text-3xl">My Account</h1>
        <p className="mt-3 text-sm text-gray-600">Logged in as <span className="font-semibold text-ink">{user.email}</span></p>
          <form onSubmit={onUpdateProfile} className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              value={profileForm.name}
              onChange={(e) => setProfileForm((state) => ({ ...state, name: e.target.value }))}
              placeholder="Name"
              className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm"
            />
            <input
              value={profileForm.phone}
              onChange={(e) => setProfileForm((state) => ({ ...state, phone: e.target.value }))}
              placeholder="Phone number"
              className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={profileLoading}
              className={`focus-ring sm:col-span-2 rounded-full py-2.5 text-sm font-semibold ${profileLoading ? "bg-gray-300 text-gray-600" : "bg-pine text-white"}`}
            >
              {profileLoading ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>

        <div className="card-surface p-6">
          <h2 className="text-lg font-semibold">Reset Password</h2>
          {!user.hasPassword && (
            <p className="mt-1 text-xs text-gray-600">
              No password set yet. Create a new password below.
            </p>
          )}
          <form onSubmit={onResetPassword} className="mt-3 grid gap-3">
            {user.hasPassword && (
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((state) => ({ ...state, currentPassword: e.target.value }))}
                placeholder="Current password"
                className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm"
              />
            )}
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm((state) => ({ ...state, newPassword: e.target.value }))}
              placeholder="New password"
              className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm"
            />
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm((state) => ({ ...state, confirmPassword: e.target.value }))}
              placeholder="Confirm new password"
              className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={passwordLoading}
              className={`focus-ring rounded-full py-2.5 text-sm font-semibold ${passwordLoading ? "bg-gray-300 text-gray-600" : "bg-pine text-white"}`}
            >
              {passwordLoading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        </div>

        <div className="card-surface p-6">
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={() => navigate("/orders")} className="focus-ring rounded-full bg-pine px-5 py-2 text-sm font-semibold text-white">
            View My Orders
          </button>
          {user.role === "admin" && (
            <button type="button" onClick={() => navigate("/admin/orders")} className="focus-ring rounded-full border border-pine px-5 py-2 text-sm font-semibold text-pine">
              Admin Dashboard
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              clearSession();
              addToast("Logged out", "info");
            }}
            className="focus-ring rounded-full border border-stone px-5 py-2 text-sm"
          >
            Logout
          </button>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-surface mx-auto max-w-xl p-6">
      <h1 className="font-display text-3xl">{mode === "login" ? "Login" : "Create Account"}</h1>
      <p className="mt-2 text-sm text-gray-600">Sign in to store and track all your orders in one place.</p>

      <div className="mt-4 inline-flex rounded-full border border-stone bg-white p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`focus-ring rounded-full px-4 py-1.5 text-sm ${mode === "login" ? "bg-pine text-white" : "text-gray-600"}`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`focus-ring rounded-full px-4 py-1.5 text-sm ${mode === "signup" ? "bg-pine text-white" : "text-gray-600"}`}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-4 grid gap-3">
        {mode === "signup" && (
          <>
            <input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} placeholder="Full name" className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm" />
            <input value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} placeholder="Phone (+91XXXXXXXXXX)" className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm" />
          </>
        )}
        <input value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} placeholder="Email" className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm" />
        <div className="relative">
          <input
            type={showAuthPassword ? "text" : "password"}
            value={form.password}
            onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
            placeholder="Password"
            className="focus-ring w-full rounded-lg border border-stone px-3 py-2 pr-10 text-sm"
          />
          <button
            type="button"
            onClick={() => setShowAuthPassword((value) => !value)}
            className="focus-ring absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-500"
            aria-label={showAuthPassword ? "Hide password" : "Show password"}
          >
            {showAuthPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <button type="submit" disabled={loading} className={`focus-ring rounded-full py-2.5 text-sm font-semibold ${loading ? "bg-gray-300 text-gray-600" : "bg-pine text-white"}`}>
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
        </button>
      </form>
    </div>
  );
}
