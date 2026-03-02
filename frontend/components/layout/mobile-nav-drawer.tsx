"use client";

import Link from "@/components/common/app-link";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { BrandLogo } from "@/components/common/brand-logo";
import { useUIStore } from "@/stores/ui-store";
import { useAuthStore } from "@/stores/auth-store";

const shopCategories = [
  {
    title: "Our Collection",
    description: "All flavoured makhana and combo options.",
    href: "/collections/all-products"
  },
  {
    title: "Indivisual Flavours",
    description: "Explore our range of Individual flavour packs",
    href: "/collections/flavoured-makhana"
  },
  {
    title: "Hot Combos",
    description: "Eplore our range of Hot combos curated to your preferences.",
    href: "/collections/combos"
  }
];

export function MobileNavDrawer() {
  const open = useUIStore((state) => state.isMobileNavOpen);
  const close = useUIStore((state) => state.closeMobileNav);
  const token = useAuthStore((state) => state.token);
  const clearSession = useAuthStore((state) => state.clearSession);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/35 lg:hidden"
            onClick={close}
            aria-label="Close mobile menu overlay"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.24 }}
            className="fixed left-0 top-0 z-[60] h-full w-full max-w-sm overflow-y-auto bg-white p-5 lg:hidden"
            aria-label="Mobile navigation"
          >
            <div className="mb-4 flex items-center justify-between">
              <BrandLogo className="inline-flex items-center" imageClassName="h-8 w-auto object-contain" />
              <button type="button" onClick={close} className="focus-ring rounded-full border border-stone p-2">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              {shopCategories.map((category) => (
                <Link
                  key={category.title}
                  href={category.href}
                  className="focus-ring block rounded-xl border border-stone px-4 py-3"
                  onClick={close}
                >
                  <p className="text-sm font-semibold text-ink">{category.title}</p>
                  <p className="mt-1 text-xs text-gray-600">{category.description}</p>
                </Link>
              ))}
            </div>

            <div className="mt-6 space-y-3 border-t border-stone pt-4 text-sm">
              <Link href="/" className="block" onClick={close}>HOME</Link>
              <Link href="/account" className="block" onClick={close}>ACCOUNT</Link>
              <Link href="/orders" className="block" onClick={close}>ORDERS</Link>
              <Link href="/about" className="block" onClick={close}>ABOUT US</Link>
              <Link href="/blog" className="block" onClick={close}>BLOG</Link>
              <Link href="/contact" className="block" onClick={close}>CONTACT</Link>
              {token && (
                <button
                  type="button"
                  onClick={() => {
                    clearSession();
                    close();
                  }}
                  className="focus-ring block text-left text-sm"
                >
                  LOG OUT
                </button>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
