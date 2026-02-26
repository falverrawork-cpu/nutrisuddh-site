"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter, SlidersHorizontal, X } from "lucide-react";
import { Product } from "@/lib/types";
import { discountPercent } from "@/lib/utils";
import { ProductCard } from "@/components/product/product-card";

const SORTS = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Newest", value: "newest" }
] as const;

type SortValue = (typeof SORTS)[number]["value"];

export function CollectionListing({ products }: { products: Product[] }) {
  const priceCeiling = useMemo(
    () => Math.max(...products.map((product) => product.price), 1000),
    [products]
  );
  const [sort, setSort] = useState<SortValue>("featured");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(priceCeiling);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [rating, setRating] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [category, setCategory] = useState("all");
  const [productType, setProductType] = useState("all");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    setMinPrice(0);
    setMaxPrice(priceCeiling);
  }, [priceCeiling]);

  const categories = useMemo(() => ["all", ...new Set(products.flatMap((product) => product.collectionHandles))], [products]);
  const types = useMemo(() => ["all", ...new Set(products.flatMap((product) => product.tags.slice(0, 1)))], [products]);

  const filtered = useMemo(() => {
    return products
      .filter((product) => product.price >= minPrice && product.price <= maxPrice)
      .filter((product) => (inStockOnly ? product.stock > 0 : true))
      .filter((product) => product.rating >= rating)
      .filter((product) => discountPercent(product.price, product.compareAtPrice) >= discount)
      .filter((product) => (category === "all" ? true : product.collectionHandles.includes(category)))
      .filter((product) => (productType === "all" ? true : product.tags.includes(productType)))
      .sort((a, b) => {
        if (sort === "price-asc") return a.price - b.price;
        if (sort === "price-desc") return b.price - a.price;
        if (sort === "newest") return Number(b.badges.includes("New")) - Number(a.badges.includes("New"));
        return 0;
      });
  }, [products, minPrice, maxPrice, inStockOnly, rating, discount, category, productType, sort]);

  const visibleProducts = filtered.slice(0, visibleCount);

  return (
    <div className="container-base mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="focus-ring flex items-center gap-2 rounded-full border border-stone px-4 py-2 text-sm lg:hidden"
      >
        <Filter size={15} /> Filters
      </button>

      <aside className="hidden lg:block">
        <FilterPanel
          minPrice={minPrice}
          maxPrice={maxPrice}
          setMinPrice={setMinPrice}
          setMaxPrice={setMaxPrice}
          inStockOnly={inStockOnly}
          setInStockOnly={setInStockOnly}
          rating={rating}
          setRating={setRating}
          discount={discount}
          setDiscount={setDiscount}
          priceCeiling={priceCeiling}
          category={category}
          setCategory={setCategory}
          categories={categories}
          productType={productType}
          setProductType={setProductType}
          types={types}
        />
      </aside>

      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-gray-600">Showing {visibleProducts.length} of {filtered.length} products</p>
          <label className="flex items-center gap-2 text-sm">
            <SlidersHorizontal size={15} />
            <select
              aria-label="Sort products"
              value={sort}
              onChange={(event) => setSort(event.target.value as SortValue)}
              className="focus-ring rounded-full border border-stone px-3 py-2"
            >
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {visibleCount < filtered.length && (
          <button
            type="button"
            onClick={() => setVisibleCount((value) => value + 9)}
            className="focus-ring mt-8 rounded-full border border-pine px-6 py-2 text-sm font-semibold text-pine"
          >
            Load more
          </button>
        )}
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button type="button" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-black/35" aria-label="Close filters" />
          <div className="absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-2xl">Filter products</h3>
              <button type="button" onClick={() => setMobileOpen(false)} className="focus-ring rounded-full border border-stone p-2">
                <X size={17} />
              </button>
            </div>
            <FilterPanel
              minPrice={minPrice}
              maxPrice={maxPrice}
              setMinPrice={setMinPrice}
              setMaxPrice={setMaxPrice}
              inStockOnly={inStockOnly}
              setInStockOnly={setInStockOnly}
              rating={rating}
              setRating={setRating}
              discount={discount}
              setDiscount={setDiscount}
              priceCeiling={priceCeiling}
              category={category}
              setCategory={setCategory}
              categories={categories}
              productType={productType}
              setProductType={setProductType}
              types={types}
            />
            <button type="button" onClick={() => setMobileOpen(false)} className="focus-ring mt-4 w-full rounded-full bg-pine py-2 text-sm font-medium text-white">
              Apply filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

type FilterPanelProps = {
  minPrice: number;
  maxPrice: number;
  setMinPrice: (value: number) => void;
  setMaxPrice: (value: number) => void;
  inStockOnly: boolean;
  setInStockOnly: (value: boolean) => void;
  rating: number;
  setRating: (value: number) => void;
  discount: number;
  setDiscount: (value: number) => void;
  priceCeiling: number;
  category: string;
  setCategory: (value: string) => void;
  categories: string[];
  productType: string;
  setProductType: (value: string) => void;
  types: string[];
};

function FilterPanel(props: FilterPanelProps) {
  return (
    <div className="card-surface p-4">
      <div className="space-y-5 text-sm">
        <section>
          <p className="mb-2 font-semibold">Price range</p>
          <div className="space-y-3">
            <input type="range" min={0} max={props.priceCeiling} value={props.minPrice} onChange={(event) => props.setMinPrice(Number(event.target.value))} className="w-full" aria-label="Minimum price" />
            <input type="range" min={0} max={props.priceCeiling} value={props.maxPrice} onChange={(event) => props.setMaxPrice(Number(event.target.value))} className="w-full" aria-label="Maximum price" />
            <p className="text-xs text-gray-500">{`₹${props.minPrice} - ₹${props.maxPrice}`}</p>
          </div>
        </section>

        <section>
          <p className="mb-2 font-semibold">Category</p>
          <select value={props.category} onChange={(event) => props.setCategory(event.target.value)} className="focus-ring w-full rounded-lg border border-stone px-3 py-2">
            {props.categories.map((value) => (
              <option key={value} value={value}>{value === "all" ? "All" : value}</option>
            ))}
          </select>
        </section>

        <section>
          <p className="mb-2 font-semibold">Product type</p>
          <select value={props.productType} onChange={(event) => props.setProductType(event.target.value)} className="focus-ring w-full rounded-lg border border-stone px-3 py-2">
            {props.types.map((value) => (
              <option key={value} value={value}>{value === "all" ? "All" : value}</option>
            ))}
          </select>
        </section>

        <section className="flex items-center justify-between">
          <p className="font-semibold">In stock only</p>
          <input type="checkbox" checked={props.inStockOnly} onChange={(event) => props.setInStockOnly(event.target.checked)} aria-label="In stock only" />
        </section>

        <section>
          <p className="mb-2 font-semibold">Minimum rating</p>
          <input type="range" min={0} max={5} step={0.5} value={props.rating} onChange={(event) => props.setRating(Number(event.target.value))} className="w-full" aria-label="Minimum rating" />
          <p className="text-xs text-gray-500">{props.rating} stars and up</p>
        </section>

        <section>
          <p className="mb-2 font-semibold">Discount threshold</p>
          <input type="range" min={0} max={50} step={5} value={props.discount} onChange={(event) => props.setDiscount(Number(event.target.value))} className="w-full" aria-label="Minimum discount" />
          <p className="text-xs text-gray-500">{props.discount}% and above</p>
        </section>
      </div>
    </div>
  );
}
