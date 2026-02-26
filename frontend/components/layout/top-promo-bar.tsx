"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { promoMessages } from "@/data/homepage";

export function TopPromoBar() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const message = useMemo(() => promoMessages[index % promoMessages.length], [index]);

  useEffect(() => {
    if (paused) {
      return;
    }
    const timer = setInterval(() => {
      setIndex((value) => (value + 1) % promoMessages.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [paused]);

  return (
    <div
      className="relative z-50 bg-pine py-2 text-center text-xs font-medium text-white sm:text-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        <motion.p
          key={message}
          initial={shouldReduceMotion ? false : { y: 10, opacity: 0 }}
          animate={shouldReduceMotion ? {} : { y: 0, opacity: 1 }}
          exit={shouldReduceMotion ? {} : { y: -10, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="px-3"
        >
          {message}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
