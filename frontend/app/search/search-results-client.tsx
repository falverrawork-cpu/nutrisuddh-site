"use client";

import { useSearchParams } from "react-router-dom";
import { ProductCard } from "@/components/product/product-card";
import { searchProducts } from "@/lib/catalog";

export function SearchResultsClient() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const results = searchProducts(q);

  return (
    <>
      <p className="mt-2 text-sm text-gray-600">
        Results for: <span className="font-semibold">{q || "(empty query)"}</span>
      </p>
      {results.length === 0 ? (
        <div className="card-surface mt-8 p-8 text-sm text-gray-600">No products found for this query.</div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}
