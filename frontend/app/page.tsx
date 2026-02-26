import { HeroCarousel } from "@/components/home/hero-carousel";
import { ProductCarousel } from "@/components/home/product-carousel";
import { ComboPromo } from "@/components/home/combo-promo";
import { TrustStrip } from "@/components/home/trust-strip";
import { TestimonialsSlider } from "@/components/home/testimonials-slider";
import { NewsletterBlock } from "@/components/home/newsletter-block";
import { BulkSection } from "@/components/home/bulk-section";
import { DIYDelights } from "@/components/home/diy-delights";
import { products } from "@/data/products";

export const revalidate = 3600;

export default function HomePage() {
  const singleProducts = products.filter((product) => !product.tags.includes("combo-pack"));
  const comboProducts = products.filter((product) => product.tags.includes("combo-pack"));

  return (
    <>
      <HeroCarousel />
      <ProductCarousel
        products={singleProducts}
        title="Our Collection"
        subtitle="All flavoured makhana options in individual packs. Minimum order: 3 packs."
      />
      <ProductCarousel
        products={comboProducts}
        title="Explore Our Range"
        subtitle="Combo of 3 and curated flavour bundles for variety snacking."
      />
      <ComboPromo />
      <TrustStrip />
      <BulkSection />
      <DIYDelights />
      <TestimonialsSlider />
      <NewsletterBlock />
    </>
  );
}
