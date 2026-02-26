"use client";

import Image from "@/components/common/app-image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const imageCount = images.length;

  const goToPrevious = () => {
    setActive((current) => (current - 1 + imageCount) % imageCount);
  };

  const goToNext = () => {
    setActive((current) => (current + 1) % imageCount);
  };

  if (!imageCount) {
    return null;
  }

  return (
    <div className="mx-auto grid w-full max-w-[540px] gap-3 lg:mx-0">
      <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-stone bg-white">
        <Image
          src={images[active]}
          alt={`${title} image ${active + 1}`}
          fill
          className="object-contain p-2 transition duration-300 group-hover:scale-105"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />

        <button
          type="button"
          onClick={goToPrevious}
          className="focus-ring no-hover-lift absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-stone bg-white/90 p-2 text-ink"
          aria-label="Previous image"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={goToNext}
          className="focus-ring no-hover-lift absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-stone bg-white/90 p-2 text-ink"
          aria-label="Next image"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="flex justify-center gap-2">
        {images.map((_, index) => (
          <button
            key={`${title}-dot-${index}`}
            type="button"
            onClick={() => setActive(index)}
            className={`h-2.5 rounded-full transition-all ${active === index ? "w-6 bg-pine" : "w-2.5 bg-stone"}`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
