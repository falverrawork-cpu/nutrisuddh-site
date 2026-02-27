import Image from "@/components/common/app-image";
import { products } from "@/data/products";
import { BulkSection } from "@/components/home/bulk-section";

export default function AboutPage() {
  const individualPacks = products.filter((product) => product.tags.includes("makhana-single"));
  const comboOfThree = products.filter(
    (product) => product.tags.includes("combo-pack") && product.tags.includes("bundle-3")
  );
  const comboOfSix = products.filter(
    (product) => product.tags.includes("combo-pack") && product.tags.includes("bundle-6")
  );

  const diyIdeas = [
    {
      title: "Tangy Makhana Chaat",
      copy: "Mix makhana with chopped onion, tomato, coriander, lemon juice, and a pinch of chaat masala."
    },
    {
      title: "Curd Crunch Bowl",
      copy: "Add makhana over chilled curd with roasted cumin and mint for a light, filling snack."
    },
    {
      title: "Evening Trail Mix",
      copy: "Blend makhana with roasted peanuts, curry leaves, and mild masala for tea-time munching."
    }
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
          Backed by the expertise of NS Agro Overseas, we source superior-grade makhana from trusted growers and
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

      <div className="mt-8 rounded-2xl border border-pine/25 bg-pine/5 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-pine">Content Card</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <p className="rounded-xl border border-pine/25 bg-white px-3 py-2 text-sm font-semibold text-pine">SUPERFOOD</p>
          <p className="rounded-xl border border-pine/25 bg-white px-3 py-2 text-sm font-semibold text-pine">NATURALLY GLUTEN FREE</p>
          <p className="rounded-xl border border-pine/25 bg-white px-3 py-2 text-sm font-semibold text-pine">NO ADDED PRESERVATIVES</p>
          <p className="rounded-xl border border-pine/25 bg-white px-3 py-2 text-sm font-semibold text-pine">LIGHT & WHOLESOME</p>
        </div>
      </div>

      <section className="mt-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">Our Collection</p>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl">Explore Our Range</h2>
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

      <section className="mt-12 rounded-3xl border border-stone bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pine">DIY Delights</p>
        <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">Snack the Makhana Way</h2>
        <p className="mt-3 max-w-3xl text-sm text-gray-700 sm:text-base">
          Easy recipe-style snacking ideas inspired by our 250g pack serving suggestions.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {diyIdeas.map((idea) => (
            <div key={idea.title} className="rounded-2xl border border-stone/80 bg-sand/40 p-4">
              <p className="text-sm font-semibold text-ink">{idea.title}</p>
              <p className="mt-2 text-sm leading-6 text-gray-700">{idea.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <BulkSection />
    </div>
  );
}
