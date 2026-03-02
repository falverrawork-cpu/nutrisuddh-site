"use client";

import Image from "@/components/common/app-image";
import Link from "@/components/common/app-link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { heroSlides } from "@/data/homepage";

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((value) => (value + 1) % heroSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const slide = heroSlides[index];

  return (
    <section className="container-base pt-4 sm:pt-8">
      <div className="relative">
        <div className="relative overflow-hidden rounded-3xl border border-stone bg-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? {} : { opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="relative min-h-[360px] sm:min-h-[420px] lg:min-h-[450px]"
            >
              <Image src={slide.image} alt={slide.title} fill priority className="object-cover" sizes="100vw" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/35 to-black/25" />
              <div className="relative z-10 flex min-h-[360px] max-w-2xl flex-col justify-center p-5 text-white sm:min-h-[420px] sm:p-8 lg:min-h-[450px] lg:p-10">
                <p className="text-xs uppercase tracking-[0.2em] text-white/90">NS Agro Overseas</p>
                <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl lg:text-5xl">{slide.title}</h1>
                <p className="hidden max-w-xl text-sm text-white/90 sm:mt-4 sm:block sm:text-base">{slide.subtitle}</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href={slide.ctaHref}
                    className="focus-ring inline-flex w-fit rounded-full bg-pine px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    {slide.ctaLabel}
                  </Link>
                  {slide.secondaryCtaLabel && slide.secondaryCtaHref && (
                    <Link
                      href={slide.secondaryCtaHref}
                      className="focus-ring inline-flex w-fit rounded-full border border-white bg-transparent px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-lg"
                    >
                      {slide.secondaryCtaLabel}
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {heroSlides.map((item, itemIndex) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setIndex(itemIndex)}
                className={`h-2.5 rounded-full transition-all ${itemIndex === index ? "w-8 bg-pine" : "w-2.5 bg-white/80"}`}
                aria-label={`Go to slide ${itemIndex + 1}`}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIndex((value) => (value - 1 + heroSlides.length) % heroSlides.length)}
          className="focus-ring hero-arrow-static absolute top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/95 p-1.5 sm:-left-4 sm:block sm:p-2 lg:-left-5"
          aria-label="Previous slide"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => setIndex((value) => (value + 1) % heroSlides.length)}
          className="focus-ring hero-arrow-static absolute top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/95 p-1.5 sm:-right-4 sm:block sm:p-2 lg:-right-5"
          aria-label="Next slide"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </section>
  );
}
