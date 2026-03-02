 "use client";

import { BadgeCheck, Leaf, ShieldCheck, Sparkles, Star, Truck } from "lucide-react";
import { useEffect, useRef } from "react";
import { Product } from "@/lib/types";

const featureCards = [
  {
    title: "Naturally Gluten Free",
    description: "Makhana is naturally gluten free and suitable for mindful, clean snacking.",
    icon: Leaf
  },
  {
    title: "No Preservatives",
    description: "Prepared without artificial preservatives for a cleaner ingredient profile.",
    icon: ShieldCheck
  },
  {
    title: "Roasted, Not Fried",
    description: "Carefully roasted to preserve crunch while keeping the snack light.",
    icon: Sparkles
  },
  {
    title: "Quality Assured",
    description: "Every batch is graded and packed under hygienic quality checks.",
    icon: BadgeCheck
  },
  {
    title: "Reliable Shipping",
    description: "PAN India dispatch and global shipping support for bulk requirements.",
    icon: Truck
  }
];

const testimonials = [
  {
    name: "Ananya Roy",
    rating: 5,
    quote: "The flavour stays consistent across repeat orders and packaging quality is excellent."
  },
  {
    name: "Ritwik Saha",
    rating: 5,
    quote: "Great crunch, clean ingredients, and quick delivery. Became my regular healthy snack."
  },
  {
    name: "Sourav Dutta",
    rating: 5,
    quote: "Presentation and taste both feel premium. Works very well for gifting too."
  },
  {
    name: "Neha Kapoor",
    rating: 4,
    quote: "Super fresh and light. The jars are easy to carry and perfect for travel snacking."
  },
  {
    name: "Arjun Mehta",
    rating: 5,
    quote: "Loved the combo options. Every flavour had its own character and crunch stayed perfect."
  },
  {
    name: "Priya Sharma",
    rating: 4,
    quote: "I switched from fried snacks to this and honestly do not miss the old options anymore."
  },
  {
    name: "Kabir Sen",
    rating: 5,
    quote: "Peri Peri and Cheese are now regulars in my pantry. Great quality and clean taste."
  },
  {
    name: "Mitali Das",
    rating: 5,
    quote: "Packaging feels premium and the product quality matches it. Excellent for gifting."
  },
  {
    name: "Rohan Malhotra",
    rating: 4,
    quote: "Balanced seasoning and no heaviness after snacking. Works really well during office hours."
  }
];

export function ProductDetailContent({ product }: { product: Product }) {
  const testimonialsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = testimonialsRef.current;
    if (!container) {
      return;
    }

    const interval = window.setInterval(() => {
      const firstCard = container.firstElementChild as HTMLElement | null;
      if (!firstCard) {
        return;
      }

      const styles = window.getComputedStyle(container);
      const gap = Number.parseInt(styles.columnGap || styles.gap || "0", 10) || 0;
      const step = firstCard.offsetWidth + gap;
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      const nextScrollLeft = container.scrollLeft + step;

      if (nextScrollLeft >= maxScrollLeft - 2) {
        container.scrollTo({ left: 0, behavior: "smooth" });
        return;
      }

      container.scrollTo({ left: nextScrollLeft, behavior: "smooth" });
    }, 3000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const standardDescription =
    "Our makhana products are sourced from premium lotus farms and processed in hygienic facilities. Each batch undergoes grading, roasting, and seasoning using controlled techniques to ensure quality, crunch, and flavour consistency.";
  const standardIngredients =
    "We use high-quality makhana along with food-grade seasonings and Olive Oil. No harmful additives or preservatives are used.";
  const standardStorage =
    "Store in a cool & dry place. Avoid direct sunlight. Keep airtight after opening.";
  const standardShipping =
    "Dispatch: 2-4 working days. Bulk/export logistics timelines apply. PAN India & international shipping available.";
  const standardReturns =
    "Damaged product claims within 48 hrs. Replacement / refund after verification. No returns on opened consumables.";

  const detailParagraphs = [
    { title: "Description", body: product.description ?? standardDescription },
    { title: "Ingredients", body: product.ingredients ?? standardIngredients },
    { title: "Storage", body: product.storage ?? standardStorage },
    { title: "Shipping", body: product.shipping ?? standardShipping },
    { title: "Returns", body: product.returns ?? standardReturns }
  ];

  const faqs = [
    {
      question: "What ingredients are used?",
      answer:
        product.ingredients ??
        "Makhana with food-grade seasonings and Olive Oil, crafted for balanced flavour and quality."
    },
    {
      question: "How should I store this product?",
      answer: product.storage ?? "Store in a cool and dry place, and keep airtight after opening."
    },
    {
      question: "What are the shipping timelines?",
      answer:
        product.shipping ??
        "Dispatch is usually within 2-4 working days. Bulk and export orders can have separate timelines."
    },
    {
      question: "What is your return policy?",
      answer:
        product.returns ??
        "Damaged product claims are accepted within 48 hours after delivery, subject to verification."
    }
  ];

  return (
    <section className="mt-14">
      <h2 className="font-display text-3xl">Product Information in Detail</h2>
      <p className="mt-2 max-w-3xl text-sm text-gray-600">
        Find complete product details below, including ingredients, storage guidance, shipping timelines, and return terms.
      </p>
      <div className="mt-4 space-y-4 rounded-xl border border-stone bg-white p-4 sm:p-5">
        {detailParagraphs.map((item) => (
          <div key={item.title}>
            <h3 className="text-sm font-semibold text-ink">{item.title}</h3>
            <p className="mt-1 text-sm text-gray-600">{item.body}</p>
            {item.title === "Ingredients" && product.nutrition && product.nutrition.length > 0 && (
              <div className="mt-3 overflow-hidden rounded-lg border border-stone">
                <p className="border-b border-stone bg-sand px-3 py-2 text-xs font-semibold uppercase tracking-[0.06em] text-ink">
                  Nutritional Information (Per 100g)
                </p>
                <table className="w-full border-collapse text-sm">
                  <tbody>
                    {product.nutrition.map((row) => (
                      <tr key={row.name} className="border-b border-stone last:border-b-0">
                        <th className="bg-white px-3 py-2 text-left font-medium text-ink">{row.name}</th>
                        <td className="bg-white px-3 py-2 text-right text-gray-700">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {featureCards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.title}
              className="group relative overflow-hidden rounded-2xl border border-[#3d6853] bg-[#325341] p-4 shadow-[0_12px_28px_-18px_rgba(10,25,18,0.8)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-20px_rgba(10,25,18,0.9)]"
            >
              <div className="relative">
                <span className="inline-flex rounded-full border border-white/30 bg-white/15 p-2 text-white shadow-sm">
                  <Icon size={16} />
                </span>
                <h3 className="mt-3 text-sm font-semibold tracking-[0.01em] text-white">{card.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-white/85">{card.description}</p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-10">
        <h3 className="font-display text-2xl">Testimonials</h3>
        <div
          ref={testimonialsRef}
          className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {testimonials.map((item) => (
            <article key={item.name} className="min-w-[280px] snap-start rounded-xl border border-stone bg-white p-4 sm:min-w-[320px]">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-0.5 text-gold">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={`${item.name}-star-${index}`} size={14} className={index < item.rating ? "fill-gold text-gold" : "text-stone"} />
                  ))}
                </div>
                <p className="text-xs font-semibold text-gray-500">{item.rating}/5</p>
              </div>
              <p className="text-sm text-gray-700">&ldquo;{item.quote}&rdquo;</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.08em] text-pine">{item.name}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <h3 className="font-display text-2xl">FAQs</h3>
        <div className="mt-4 divide-y divide-stone rounded-xl border border-stone bg-white">
          {faqs.map((faq) => (
            <details key={faq.question} className="group">
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-ink">
                <span className="inline-flex items-center justify-between w-full">
                  {faq.question}
                  <span className="text-pine transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="px-4 pb-4 text-sm text-gray-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
