"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { testimonials } from "@/data/homepage";
import { SectionHeading } from "@/components/common/section-heading";

export function TestimonialsSlider() {
  const [index, setIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((value) => (value + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const current = testimonials[index];

  return (
    <section className="container-base mt-14">
      <SectionHeading title="Loved by Everyday Snackers" subtitle="Placeholder testimonial content." align="center" />
      <div className="mx-auto mt-6 max-w-3xl rounded-3xl border border-stone bg-white p-8 text-center shadow-card">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? {} : { opacity: 0, y: -10 }}
            transition={{ duration: 0.28 }}
          >
            <p className="text-lg text-gray-700">“{current.quote}”</p>
            <p className="mt-4 text-sm font-semibold text-ink">{current.name}</p>
            <p className="text-xs text-gray-500">{current.location}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
