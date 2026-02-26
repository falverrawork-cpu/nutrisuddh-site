"use client";

import { motion, useReducedMotion } from "framer-motion";

export function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) {
    return <>{children}</>;
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35, delay }}
    >
      {children}
    </motion.div>
  );
}
