import Image from "@/components/common/app-image";
import { products } from "@/data/products";
import { BulkSection } from "@/components/home/bulk-section";
import { DIYDelights } from "@/components/home/diy-delights";

export default function AboutPage() {
  const individualPacks = products.filter((product) => product.tags.includes("makhana-single"));
  const comboOfThree = products.filter(
    (product) => product.tags.includes("combo-pack") && product.tags.includes("bundle-3")
  );
  const comboOfSix = products.filter(
    (product) => product.tags.includes("combo-pack") && product.tags.includes("bundle-6")
  );

  const contentHighlights = [
    "SUPERFOOD",
    "NATURALLY GLUTEN FREE",
    "NO ADDED PRESERVATIVES",
    "LIGHT & WHOLESOME"
  ];

  return (
    <div className="container-base py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pine">About</p>
      <h1 className="mt-2 font-display text-4xl">Nutri Suddh</h1>
      <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-ink">Simple. Healthy. Delicious.</p>

      <div className="mt-6 max-w-4xl space-y-5 text-sm leading-7 text-gray-700 sm:text-base">
        <p>
          Nutri Suddh was built on a clear belief - good snacking should be pure, nourishing, and genuinely
          satisfying.
        </p>
        <p>
          Backed by the expertise of NS Agro Overseas, we source superior-grade makhana from trusted Farmers and
          process it under strict quality standards to preserve its natural crunch and nutrition.
        </p>
        <p>
          Rooted in India&apos;s agricultural heritage and crafted for modern lifestyles, our range includes both classic
          plain and refined flavoured variants - offering indulgent taste without compromising on wellness.
        </p>
        <p>
          No shortcuts. No unnecessary additives. Just clean, premium makhana you can trust.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-stone bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink">Benefits</h2>
        <p className="mt-1 text-xs text-gray-600">Nutri Suddh promise at a glance.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {contentHighlights.map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-xl border border-stone px-3 py-2.5">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-pine/40 text-[11px] font-bold text-pine">✓</span>
              <p className="text-sm font-semibold text-ink">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <DIYDelights />

      <section className="mt-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">Our Collection</p>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl">Indivisual Flavours</h2>
        <p className="mt-2 text-sm text-gray-700 sm:text-base">
          <strong>The Nutri Suddh Range</strong> includes a variety of flavoured makhana options from tangy tomato, to
          fresh pudina, cheesy cheese to spicy peri peri, creamy cream and onion to classing salt and pepper. We Have
          it All!
        </p>
      </section>

      <section className="mt-8">
        <h3 className="text-lg font-semibold">Individual Pack (Min Order: 3 Pc)</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {individualPacks.map((product) => (
            <article key={product.id} className="card-surface overflow-hidden">
              <div className="relative aspect-square bg-sand">
                <Image src={product.images[0]} alt={product.title} fill className="object-contain p-3" sizes="(max-width: 1024px) 50vw, 33vw" />
              </div>
              <div className="p-4">
                <p className="text-sm font-semibold text-ink">{product.title}</p>
                <p className="mt-1 text-sm text-gray-600">{product.subtitle}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h3 className="text-lg font-semibold">Combo of 3</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {comboOfThree.map((product) => (
            <article key={product.id} className="card-surface overflow-hidden">
              <div className="relative aspect-square bg-sand">
                <Image src={product.images[0]} alt={product.title} fill className="object-contain p-3" sizes="(max-width: 1024px) 50vw, 33vw" />
              </div>
              <div className="p-4">
                <p className="text-sm font-semibold text-ink">{product.title}</p>
                <p className="mt-1 text-sm text-gray-600">{product.subtitle}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h3 className="text-lg font-semibold">Combo of 6</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {comboOfSix.map((product) => (
            <article key={product.id} className="card-surface overflow-hidden">
              <div className="relative aspect-square bg-sand">
                <Image src={product.images[0]} alt={product.title} fill className="object-contain p-3" sizes="(max-width: 1024px) 50vw, 33vw" />
              </div>
              <div className="p-4">
                <p className="text-sm font-semibold text-ink">{product.title}</p>
                <p className="mt-1 text-sm text-gray-600">{product.subtitle}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <BulkSection />
    </div>
  );
}
