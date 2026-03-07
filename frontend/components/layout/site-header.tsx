"use client";

import Link from "@/components/common/app-link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { Eye, EyeOff, Menu, Moon, Package, ShoppingBag, Sun, User, X } from "lucide-react";
import { SearchTypeahead } from "@/components/common/search-typeahead";
import { BrandLogo } from "@/components/common/brand-logo";
import { useShopStore } from "@/stores/shop-store";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import { useAuthStore, type AuthUser } from "@/stores/auth-store";
import { apiFetch } from "@/lib/api";
import { useThemeStore } from "@/stores/theme-store";

const shopCategories = [
  {
    title: "Our Collection",
    description: "All flavoured makhana and combo options.",
    href: "/collections/all-products"
  },
  {
    title: "Individual Flavours",
    description: "Explore our range of Individual flavour packs",
    href: "/collections/flavoured-makhana"
  },
  {
    title: "Hot Combos",
    description: "Eplore our range of Hot combos curated to your preferences.",
    href: "/collections/combos"
  }
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const cart = useShopStore((state) => state.cart);
  const openCart = useUIStore((state) => state.openCart);
  const openMobileNav = useUIStore((state) => state.openMobileNav);
  const isAuthModalOpen = useUIStore((state) => state.isAuthModalOpen);
  const openAuthModal = useUIStore((state) => state.openAuthModal);
  const closeAuthModal = useUIStore((state) => state.closeAuthModal);
  const addToast = useUIStore((state) => state.addToast);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  useEffect(() => {
    setMenuOpen(false);
    setAccountMenuOpen(false);
    closeAuthModal();
  }, [closeAuthModal, location.pathname]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (!menuRef.current) return;
      const target = event.target as Node | null;
      if (target && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }

      if (accountMenuRef.current && target && !accountMenuRef.current.contains(target)) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, []);

  useEffect(() => {
    const setHeaderOffset = () => {
      if (!headerRef.current) return;
      document.documentElement.style.setProperty("--site-header-height", `${headerRef.current.offsetHeight}px`);
    };

    setHeaderOffset();
    window.addEventListener("resize", setHeaderOffset);
    return () => {
      window.removeEventListener("resize", setHeaderOffset);
    };
  }, []);

  return (
    <header
      ref={headerRef}
      style={{ top: "var(--top-promo-height, 0px)" }}
      className="fixed inset-x-0 z-40 border-b border-stone bg-white/95 backdrop-blur"
    >
      <div className="container-base py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={openMobileNav}
              className="focus-ring rounded-full border border-stone p-2 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <BrandLogo className="inline-flex items-center" imageClassName="h-12 w-auto object-contain sm:h-16 lg:h-20" />
          </div>

          <div className="hidden flex-1 px-8 lg:block">
            <SearchTypeahead />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="group focus-ring relative rounded-full border border-stone p-2 transition-colors hover:border-pine hover:bg-pine hover:text-white"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
              <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-2.5 py-1 text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </span>
            </button>
            <div className="relative" ref={accountMenuRef}>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
                    navigate("/account");
                    return;
                  }
                  if (token && user) {
                    setAccountMenuOpen((value) => !value);
                    return;
                  }
                  openAuthModal();
                }}
                className="group focus-ring relative rounded-full border border-stone p-2 transition-colors hover:border-pine hover:bg-pine hover:text-white"
                aria-label="Account"
              >
                <User size={17} />
                <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-2.5 py-1 text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                  Account
                </span>
              </button>
              {token && user && accountMenuOpen && (
                <div className="absolute right-0 top-full mt-2 hidden w-44 rounded-xl border border-stone bg-white p-2 shadow-card lg:block">
                  <Link href="/account" className="focus-ring block rounded-lg px-3 py-2 text-sm text-ink hover:bg-sand">
                    My Account
                  </Link>
                  {user.role === "admin" && (
                    <Link href="/admin/orders" className="focus-ring mt-1 block rounded-lg px-3 py-2 text-sm text-ink hover:bg-sand">
                      Dashboard
                    </Link>
                  )}
                  <Link href="/orders" className="focus-ring mt-1 block rounded-lg px-3 py-2 text-sm text-ink hover:bg-sand">
                    Previous Orders
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      clearSession();
                      addToast("Logged out", "info");
                      setAccountMenuOpen(false);
                    }}
                    className="focus-ring mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm text-ink hover:bg-sand"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
            <div className="hidden sm:block">
              <IconButtonWithTooltip href="/orders" icon={<Package size={17} />} label="My orders" />
            </div>
            <button
              type="button"
              onClick={openCart}
              className="group focus-ring relative rounded-full border border-stone p-2 transition-colors hover:border-pine hover:bg-pine hover:text-white"
              aria-label="Open cart"
            >
              <ShoppingBag size={17} />
              <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-2.5 py-1 text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                Cart
              </span>
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 rounded-full bg-pine px-1.5 py-0.5 text-[10px] text-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="mt-3 lg:hidden">
          <SearchTypeahead compact />
        </div>

        <nav className="mt-4 hidden items-center gap-6 text-sm font-medium text-gray-700 lg:flex">
          <Link href="/" className="link-hover">HOME</Link>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className={cn("focus-ring rounded-md px-1 py-1", menuOpen && "text-pine")}
              aria-expanded={menuOpen}
              aria-haspopup="true"
            >
              SHOP
            </button>
            {menuOpen && (
              <div className="absolute left-0 top-full mt-3 w-[720px] rounded-2xl border border-stone bg-white p-6 shadow-card">
                <div className="grid grid-cols-3 gap-4">
                  {shopCategories.map((category) => (
                    <Link
                      key={category.title}
                      href={category.href}
                      onClick={() => setMenuOpen(false)}
                      className="focus-ring rounded-xl border border-stone p-4 transition-colors hover:border-pine hover:bg-sand hover:text-black"
                    >
                      <p className="font-semibold text-ink">{category.title}</p>
                      <p className="mt-1 text-xs text-gray-500">{category.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Link href="/about" className="link-hover">ABOUT US</Link>
          <Link href="/blog" className="link-hover">BLOG</Link>
          <Link href="/contact" className="link-hover">CONTACT</Link>
        </nav>
      </div>
      {isAuthModalOpen && (
        <AccountAuthModal
          onClose={closeAuthModal}
          token={token}
          user={user}
          onLogin={(nextToken, nextUser) => setSession(nextToken, nextUser)}
          onLogout={() => clearSession()}
          addToast={addToast}
        />
      )}
    </header>
  );
}

type AuthResponse = {
  token: string;
  user: AuthUser;
};

function AccountAuthModal({
  onClose,
  token,
  user,
  onLogin,
  onLogout,
  addToast
}: {
  onClose: () => void;
  token: string | null;
  user: AuthUser | null;
  onLogin: (token: string, user: AuthUser) => void;
  onLogout: () => void;
  addToast: (message: string, type?: "success" | "info") => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("signup");
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "+91", email: "", password: "" });
  const [forgotStep, setForgotStep] = useState<"request" | "confirm">("request");
  const [forgotForm, setForgotForm] = useState({ email: "", code: "", newPassword: "", confirmPassword: "" });
  const [otpStep, setOtpStep] = useState<"request" | "confirm">("request");
  const [otpForm, setOtpForm] = useState({ email: "", code: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  useEffect(() => {
    if (mode !== "signup") return;
    setForm((current) => ({
      ...current,
      phone: current.phone.trim() ? current.phone : "+91"
    }));
  }, [mode]);

  useEffect(() => {
    if (mode !== "forgot") return;
    setForgotForm((current) => ({
      ...current,
      email: current.email.trim() ? current.email : form.email
    }));
  }, [form.email, mode]);

  useEffect(() => {
    if (mode !== "login" || loginMethod !== "otp") return;
    setOtpForm((current) => ({
      ...current,
      email: current.email.trim() ? current.email : form.email
    }));
  }, [form.email, loginMethod, mode]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const submit = async () => {
    if (loading) return;
    if (mode === "forgot") {
      setLoading(true);
      try {
        if (forgotStep === "request") {
          if (!forgotForm.email.trim()) {
            addToast("Email is required.", "info");
            return;
          }
          await apiFetch<{ ok: boolean; message: string }>("/api/auth/forgot-password/request", {
            method: "POST",
            body: JSON.stringify({ email: forgotForm.email })
          });
          addToast("If the email exists, reset code has been sent.");
          setForgotStep("confirm");
          return;
        }

        if (!forgotForm.code.trim()) {
          addToast("Reset code is required.", "info");
          return;
        }
        if (!forgotForm.newPassword.trim()) {
          addToast("New password is required.", "info");
          return;
        }
        if (forgotForm.newPassword !== forgotForm.confirmPassword) {
          addToast("New password and confirm password do not match.", "info");
          return;
        }

        await apiFetch<{ ok: boolean }>("/api/auth/forgot-password/confirm", {
          method: "POST",
          body: JSON.stringify({
            email: forgotForm.email,
            code: forgotForm.code,
            newPassword: forgotForm.newPassword
          })
        });
        addToast("Password reset successful. Please login.");
        setMode("login");
        setForgotStep("request");
        setForm((current) => ({ ...current, email: forgotForm.email, password: "" }));
        setForgotForm({ email: forgotForm.email, code: "", newPassword: "", confirmPassword: "" });
      } catch (error) {
        addToast(error instanceof Error ? error.message : "Unable to reset password.", "info");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (mode === "login" && loginMethod === "otp") {
      setLoading(true);
      try {
        if (otpStep === "request") {
          if (!otpForm.email.trim()) {
            addToast("Email is required.", "info");
            return;
          }
          await apiFetch<{ ok: boolean; message: string }>("/api/auth/email-login/request", {
            method: "POST",
            body: JSON.stringify({ email: otpForm.email })
          });
          addToast("Login code sent to your email.");
          setOtpStep("confirm");
          return;
        }

        if (!otpForm.code.trim()) {
          addToast("Login code is required.", "info");
          return;
        }

        const result = await apiFetch<AuthResponse>("/api/auth/email-login/confirm", {
          method: "POST",
          body: JSON.stringify({ email: otpForm.email, code: otpForm.code })
        });
        onLogin(result.token, result.user);
        addToast("Logged in successfully");
        onClose();
      } catch (error) {
        addToast(error instanceof Error ? error.message : "OTP login failed.", "info");
      } finally {
        setLoading(false);
      }
      return;
    }

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
      if (mode === "signup") {
        const result = await apiFetch<AuthResponse>("/api/auth/signup", {
          method: "POST",
          body: JSON.stringify(form)
        });
        onLogin(result.token, result.user);
        addToast("Account created successfully");
      } else {
        const result = await apiFetch<AuthResponse>("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email: form.email, password: form.password })
        });
        onLogin(result.token, result.user);
        addToast("Logged in successfully");
      }
      onClose();
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Authentication failed.", "info");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div className="auth-popup-no-hover fixed inset-0 z-[90] p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="relative flex min-h-full items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-stone bg-white p-5 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">{token && user ? "My Account" : "Account"}</h2>
          <button type="button" onClick={onClose} className="focus-ring rounded-full border border-stone p-2" aria-label="Close account popup">
            <X size={16} />
          </button>
        </div>

        {token && user ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-gray-600">
              Logged in as <span className="font-semibold text-ink">{user.email}</span>
            </p>
            <button
              type="button"
              onClick={() => {
                onLogout();
                addToast("Logged out", "info");
                onClose();
              }}
              className="focus-ring rounded-full border border-stone px-4 py-2 text-sm"
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <div className="mt-4 inline-flex rounded-full border border-stone bg-white p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setForgotStep("request");
                  setOtpStep("request");
                  setLoginMethod("password");
                }}
                className={`focus-ring rounded-full px-4 py-1.5 text-sm ${mode === "signup" ? "bg-pine text-white" : "text-gray-600"}`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setForgotStep("request");
                  setOtpStep("request");
                }}
                className={`focus-ring rounded-full px-4 py-1.5 text-sm ${mode === "login" ? "bg-pine text-white" : "text-gray-600"}`}
              >
                Login
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              {mode === "forgot" ? (
                <>
                  <input
                    value={forgotForm.email}
                    onChange={(e) => setForgotForm((state) => ({ ...state, email: e.target.value }))}
                    placeholder="Email"
                    className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm"
                  />
                  {forgotStep === "confirm" && (
                    <>
                      <input
                        value={forgotForm.code}
                        onChange={(e) => setForgotForm((state) => ({ ...state, code: e.target.value }))}
                        placeholder="Reset code"
                        className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm"
                      />
                      <div className="relative">
                        <input
                          type={showForgotPassword ? "text" : "password"}
                          value={forgotForm.newPassword}
                          onChange={(e) => setForgotForm((state) => ({ ...state, newPassword: e.target.value }))}
                          placeholder="New password"
                          className="focus-ring w-full rounded-lg border border-stone px-3 py-2 pr-10 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword((value) => !value)}
                          className="focus-ring no-hover-lift absolute right-2 inset-y-0 my-auto inline-flex h-7 w-7 items-center justify-center rounded-full text-gray-500"
                          aria-label={showForgotPassword ? "Hide password" : "Show password"}
                        >
                          {showForgotPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <input
                        type={showForgotPassword ? "text" : "password"}
                        value={forgotForm.confirmPassword}
                        onChange={(e) => setForgotForm((state) => ({ ...state, confirmPassword: e.target.value }))}
                        placeholder="Confirm new password"
                        className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm"
                      />
                    </>
                  )}
                </>
              ) : mode === "signup" ? (
                <>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((state) => ({ ...state, name: e.target.value }))}
                    placeholder="Name"
                    className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm"
                  />
                  <input
                    value={form.email}
                    onChange={(e) => setForm((state) => ({ ...state, email: e.target.value }))}
                    placeholder="Email"
                    className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm"
                  />
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((state) => ({ ...state, phone: e.target.value }))}
                    placeholder="Phone number"
                    className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm"
                  />
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm((state) => ({ ...state, password: e.target.value }))}
                      placeholder="Password"
                      className="focus-ring w-full rounded-lg border border-stone px-3 py-2 pr-10 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="focus-ring no-hover-lift absolute right-2 inset-y-0 my-auto inline-flex h-7 w-7 items-center justify-center rounded-full text-gray-500"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="inline-flex rounded-full border border-stone bg-white p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginMethod("password");
                        setOtpStep("request");
                      }}
                      className={`focus-ring rounded-full px-3 py-1.5 text-xs ${loginMethod === "password" ? "bg-pine text-white" : "text-gray-600"}`}
                    >
                      Password
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginMethod("otp");
                        setOtpStep("request");
                        setOtpForm((current) => ({ ...current, email: form.email }));
                      }}
                      className={`focus-ring rounded-full px-3 py-1.5 text-xs ${loginMethod === "otp" ? "bg-pine text-white" : "text-gray-600"}`}
                    >
                      Email OTP
                    </button>
                  </div>
                  {loginMethod === "otp" ? (
                    <>
                      <input
                        value={otpForm.email}
                        onChange={(e) => setOtpForm((state) => ({ ...state, email: e.target.value }))}
                        placeholder="Email"
                        className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm"
                      />
                      {otpStep === "confirm" && (
                        <input
                          value={otpForm.code}
                          onChange={(e) => setOtpForm((state) => ({ ...state, code: e.target.value }))}
                          placeholder="Login code"
                          className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm"
                        />
                      )}
                    </>
                  ) : (
                    <>
                      <input
                        value={form.email}
                        onChange={(e) => setForm((state) => ({ ...state, email: e.target.value }))}
                        placeholder="Email"
                        className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm"
                      />
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={form.password}
                          onChange={(e) => setForm((state) => ({ ...state, password: e.target.value }))}
                          placeholder="Password"
                          className="focus-ring w-full rounded-lg border border-stone px-3 py-2 pr-10 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((value) => !value)}
                          className="focus-ring no-hover-lift absolute right-2 inset-y-0 my-auto inline-flex h-7 w-7 items-center justify-center rounded-full text-gray-500"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setMode("forgot");
                          setForgotStep("request");
                          setForgotForm((current) => ({ ...current, email: form.email }));
                        }}
                        className="focus-ring -mt-1 w-fit rounded-full border border-stone px-3 py-1 text-xs text-gray-600"
                      >
                        Forgot Password?
                      </button>
                    </>
                  )}
                </>
              )}
              <button
                type="button"
                onClick={submit}
                disabled={loading}
                className={`focus-ring rounded-full py-2 text-sm font-semibold ${loading ? "bg-gray-300 text-gray-600" : "bg-pine text-white"}`}
              >
                {loading
                  ? "Please wait..."
                  : mode === "signup"
                    ? "Sign Up"
                    : mode === "forgot"
                      ? forgotStep === "request"
                        ? "Send Reset Code"
                        : "Reset Password"
                      : loginMethod === "otp"
                        ? otpStep === "request"
                          ? "Send Login Code"
                          : "Verify & Login"
                        : "Login"}
              </button>
              {mode === "forgot" && (
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setForgotStep("request");
                  }}
                  className="focus-ring rounded-full border border-stone py-2 text-sm font-semibold text-gray-700"
                >
                  Back to Login
                </button>
              )}
            </div>
          </>
        )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function IconWithCount({
  href,
  icon,
  count,
  label
}: {
  href: string;
  icon: React.ReactNode;
  count: number;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group focus-ring relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone bg-transparent transition-colors hover:border-pine hover:bg-pine hover:text-white"
      aria-label={label}
    >
      {icon}
      <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-2.5 py-1 text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
        {label}
      </span>
      {count > 0 && (
        <span className="absolute -right-1 -top-1 rounded-full bg-pine px-1.5 py-0.5 text-[10px] text-white">
          {count}
        </span>
      )}
    </Link>
  );
}

function IconButtonWithTooltip({
  href,
  icon,
  label
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group focus-ring relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone bg-transparent transition-colors hover:border-pine hover:bg-pine hover:text-white"
      aria-label={label}
    >
      {icon}
      <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-2.5 py-1 text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
        {label}
      </span>
    </Link>
  );
}
