import { collections } from "@/data/collections";
import { products } from "@/data/products";
import { Collection, Product } from "@/lib/types";

export function getCollectionProducts(handle: string): Product[] {
  const collection = collections.find((item) => item.handle === handle);
  if (!collection) {
    return [];
  }
  const set = new Set(collection.productSlugs);
  return products.filter((product) => set.has(product.slug));
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getCollectionByHandle(handle: string): Collection | undefined {
  return collections.find((collection) => collection.handle === handle);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  const handles = new Set(product.collectionHandles);
  return products
    .filter((candidate) => candidate.id !== product.id)
    .filter((candidate) => candidate.collectionHandles.some((handle) => handles.has(handle)))
    .slice(0, limit);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase().trim();
  if (!q) {
    return [];
  }
  return products.filter((product) => {
    const haystack = [product.title, product.subtitle, product.tags.join(" "), product.slug]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
