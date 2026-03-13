"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { X } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";

export function ToastViewport() {
  const toasts = useUIStore((state) => state.toasts);
  const removeToast = useUIStore((state) => state.removeToast);

  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((toast) =>
      setTimeout(() => {
        removeToast(toast.id);
      }, 3000)
    );
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [toasts, removeToast]);

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-[80] space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.18 } }}
            exit={{ opacity: 0, y: 10, transition: { duration: 0.18 } }}
            className="pointer-events-auto relative w-[300px] rounded-xl border border-stone bg-white px-4 py-3 pr-10 text-sm text-ink shadow-card"
            role="status"
          >
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="focus-ring absolute right-2 top-2 rounded-full p-1 text-gray-500"
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
