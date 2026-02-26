import { useMemo } from "react";
import { useParams } from "react-router-dom";
import NotFound from "@/app/not-found";
import { ProductPurchase } from "@/components/product/product-purchase";
import { ProductDetailContent } from "@/components/product/product-detail-content";
import { ProductCard } from "@/components/product/product-card";
import { products } from "@/data/products";
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog";
import { Product } from "@/lib/types";

const flavourTagToSlug: Record<string, string> = {
  "peri-peri": "peri-peri-roasted-makhana",
  "tomato-chilli": "tomato-chilli-makhana",
  "cream-onion": "cream-onion-makhana",
  "salt-pepper": "salt-and-pepper-makhana",
  cheese: "cheese-flavoured-makhana",
  pudina: "pudina-makhana"
};

function getIncludedFlavourProducts(product: Product): Product[] {
  if (!product.tags.includes("combo-pack")) {
    return [];
  }

  const taggedFlavours = Object.keys(flavourTagToSlug).filter((tag) => product.tags.includes(tag));
  if (taggedFlavours.length > 0) {
    return taggedFlavours
      .map((tag) => getProductBySlug(flavourTagToSlug[tag]))
      .filter((item): item is Product => Boolean(item));
  }

  return products.filter((candidate) => candidate.tags.includes("makhana-single"));
}

export function ProductPage() {
  const { slug = "" } = useParams();
  const product = getProductBySlug(slug);

  const includedFlavours = useMemo(() => {
    if (!product) return [];
    return getIncludedFlavourProducts(product);
  }, [product]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    return Array.from(new Set([...product.images, ...includedFlavours.flatMap((flavour) => flavour.images.slice(0, 5))]));
  }, [includedFlavours, product]);

  if (!product) {
    return <NotFound />;
  }

  const related = getRelatedProducts(product, 4);

  return (
    <div className="container-base space-y-10 py-8 sm:space-y-12 sm:py-10">
      <section className="overflow-hidden rounded-3xl border border-stone/70 bg-white p-4 sm:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-[760px]">
          <div className="rounded-2xl border border-stone/70 bg-white p-1">
            <ProductPurchase product={product} images={galleryImages} />
          </div>
        </div>
      </section>

      <section className="grid gap-3 rounded-2xl border border-stone/70 bg-white p-4 sm:grid-cols-3 sm:p-5">
        <article className="rounded-xl border border-stone/80 bg-sand/50 p-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">Customer Rating</p>
          <p className="mt-1 text-xl font-semibold text-ink">{product.rating}/5</p>
          <p className="mt-1 text-xs text-gray-600">{product.reviewCount} verified reviews</p>
        </article>
        <article className="rounded-xl border border-stone/80 bg-sand/50 p-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">Category</p>
          <p className="mt-1 text-xl font-semibold text-ink">{product.subtitle}</p>
          <p className="mt-1 text-xs text-gray-600">Premium roasted makhana collection</p>
        </article>
        <article className="rounded-xl border border-stone/80 bg-sand/50 p-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">Delivery Window</p>
          <p className="mt-1 text-xl font-semibold text-ink">2-7 Days</p>
          <p className="mt-1 text-xs text-gray-600">Depending on pin code and order size</p>
        </article>
      </section>

      <section>
        <ProductDetailContent product={product} />
      </section>

      <section className="mt-16 sm:mt-20">
        <h2 className="font-display text-3xl">Related Products</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
