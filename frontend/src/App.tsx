import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import HomePage from "@/app/page";
import AboutPage from "@/app/about/page";
import BlogPage from "@/app/blog/page";
import CartPage from "@/app/cart/page";
import CheckoutPage from "@/app/checkout/page";
import ContactPage from "@/app/contact/page";
import OrdersPage from "@/app/orders/page";
import SearchPage from "@/app/search/page";
import AccountPage from "@/app/account/page";
import AdminLoginPage from "@/app/admin/login/page";
import AdminOrdersPage from "@/app/admin/orders/page";
import PrivacyPolicyPage from "@/app/policies/privacy/page";
import ReturnsPolicyPage from "@/app/policies/returns/page";
import ShippingPolicyPage from "@/app/policies/shipping/page";
import TermsPolicyPage from "@/app/policies/terms/page";
import NotFound from "@/app/not-found";
import { TopPromoBar } from "@/components/layout/top-promo-bar";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { MobileNavDrawer } from "@/components/layout/mobile-nav-drawer";
import { ToastViewport } from "@/components/common/toast-viewport";
import { StoreHydrator } from "@/components/common/store-hydrator";
import { ProtectedRoute } from "@/components/common/protected-route";
import { CollectionPage } from "./pages/collection-page";
import { ProductPage } from "./pages/product-page";

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, search]);

  return null;
}

export default function App() {
  return (
    <>
      <StoreHydrator />
      <ScrollToTop />
      <TopPromoBar />
      <SiteHeader />
      <main style={{ paddingTop: "calc(var(--top-promo-height, 0px) + var(--site-header-height, 0px))" }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute requireAdmin redirectTo="/admin/login">
                <AdminOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/collections" element={<Navigate to="/collections/flavoured-makhana" replace />} />
          <Route path="/collections/:handle" element={<CollectionPage />} />
          <Route path="/products/:slug" element={<ProductPage />} />
          <Route path="/policies/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/policies/returns" element={<ReturnsPolicyPage />} />
          <Route path="/policies/shipping" element={<ShippingPolicyPage />} />
          <Route path="/policies/terms" element={<TermsPolicyPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <SiteFooter />
      <MobileNavDrawer />
      <CartDrawer />
      <ToastViewport />
    </>
  );
}
