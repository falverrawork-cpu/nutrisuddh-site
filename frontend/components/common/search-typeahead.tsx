"use client";

import Link from "@/components/common/app-link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { products } from "@/data/products";
import { cn } from "@/lib/utils";

export function SearchTypeahead({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products
      .filter((product) =>
        [product.title, product.subtitle, product.tags.join(" ")].join(" ").toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [query]);

  return (
    <div className={cn("relative", compact ? "w-full" : "w-full max-w-md")}>
      <label htmlFor="search-input" className="sr-only">
        Search products
      </label>
      <div className="flex items-center gap-2 rounded-full border border-stone bg-white px-3 py-2">
        <Search size={16} className="text-gray-400" />
        <input
          id="search-input"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search Keywords, Flavours and more."
          className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
          aria-label="Search products"
        />
      </div>

      {open && query && (
        <div className="absolute mt-2 w-full overflow-hidden rounded-2xl border border-stone bg-white shadow-card">
          {results.length > 0 ? (
            <ul>
              {results.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/products/${product.slug}`}
                    className="focus-ring block border-b border-stone px-4 py-3 text-sm last:border-b-0 hover:bg-sand"
                  >
                    <span className="font-medium">{product.title}</span>
                    <span className="block text-xs text-gray-500">{product.subtitle}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  className="focus-ring block bg-sand px-4 py-3 text-sm font-medium text-pine"
                >
                  View all results for “{query}”
                </Link>
              </li>
            </ul>
          ) : (
            <p className="px-4 py-4 text-sm text-gray-500">No matching products yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
