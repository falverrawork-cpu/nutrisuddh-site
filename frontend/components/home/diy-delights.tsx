import { Reveal } from "@/components/common/reveal";

const ideas = [
  {
    title: "Masala Chaat Bowl",
    copy: "Toss makhana with chopped onion, tomato, coriander, lemon, and a pinch of chaat masala."
  },
  {
    title: "Yogurt Crunch Topper",
    copy: "Add roasted makhana over chilled curd with mint and roasted cumin for a quick savoury bowl."
  },
  {
    title: "Tea-Time Trail Mix",
    copy: "Mix makhana with roasted nuts, curry leaves, and mild spices for a light evening snack."
  }
];

export function DIYDelights() {
  return (
    <section className="container-base mt-14">
      <Reveal>
        <div className="rounded-3xl border border-stone bg-white p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pine">DIY Delights</p>
          <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">Snack the Makhana Way</h2>
          <p className="mt-3 max-w-3xl text-sm text-gray-700 sm:text-base">
            Easy snack ideas inspired by our makhana serving suggestions. Quick to prepare, light to eat, and full of
            flavour.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {ideas.map((idea) => (
              <div key={idea.title} className="rounded-2xl border border-stone/80 bg-sand/40 p-4">
                <p className="text-sm font-semibold text-ink">{idea.title}</p>
                <p className="mt-2 text-sm leading-6 text-gray-700">{idea.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
