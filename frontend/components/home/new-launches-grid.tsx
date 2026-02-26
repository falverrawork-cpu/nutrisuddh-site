import { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/product-card";
import { Reveal } from "@/components/common/reveal";
import { SectionHeading } from "@/components/common/section-heading";

export function NewLaunchesGrid({ products }: { products: Product[] }) {
  return (
    <section className="container-base mt-14">
      <Reveal>
        <SectionHeading
          title="New Launches"
          subtitle="Fresh additions built for evolving healthy-snacking habits."
        />
      </Reveal>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.slice(0, 8).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
