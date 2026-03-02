"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/product-card";
import { Reveal } from "@/components/common/reveal";
import { SectionHeading } from "@/components/common/section-heading";

type Props = {
  products: Product[];
  title: string;
  subtitle: string;
};

export function ProductCarousel({ products, title, subtitle }: Props) {
  const [page, setPage] = useState(0);
  const perPage = 4;
  const maxPage = Math.max(0, Math.ceil(products.length / perPage) - 1);

  const visible = useMemo(() => {
    const start = page * perPage;
    return products.slice(start, start + perPage);
  }, [page, products]);

  return (
    <section className="container-base mt-14">
      <Reveal>
        <div className="flex items-end justify-between gap-4">
          <SectionHeading title={title} subtitle={subtitle} />
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(0, value - 1))}
              disabled={page === 0}
              className="focus-ring hero-arrow-static rounded-full bg-white/95 p-2 disabled:opacity-40"
              aria-label="Previous products"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => setPage((value) => Math.min(maxPage, value + 1))}
              disabled={page === maxPage}
              className="focus-ring hero-arrow-static rounded-full bg-white/95 p-2 disabled:opacity-40"
              aria-label="Next products"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </Reveal>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
