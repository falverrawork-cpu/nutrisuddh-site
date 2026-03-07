import Image from "@/components/common/app-image";
import { Reveal } from "@/components/common/reveal";

const ideas = [
  {
    image: "/DIY/Chikki.png",
    title: "Makhana Chikki",
    copy: "Golden jaggery meets crunchy roasted makhana — a sweet, nutty indulgence you can’t stop at one."
  },
  {
    image: "/DIY/energyBalls.png",
    title: "Makhana Energy Balls",
    copy: "Bite-sized power packed with makhana, nuts, and natural sweetness for clean energy anytime."
  },
  {
    image: "/DIY/chocolateIcecream.png",
    title: "Chocolate Coated Makhana Ice Cream",
    copy: "Creamy ice cream layered with crispy chocolate-coated makhana — indulgence with a delightful crunch."
  },
  {
    image: "/DIY/Bhel.png",
    title: "Makhana Bhel",
    copy: "Light, crunchy makhana tossed with tangy spices and chutneys for a street-style flavor explosion."
  },
  {
    image: "/DIY/proteinPowder.png",
    title: "Makhana Protein Powder",
    copy: "Pure makhana goodness finely crafted into a clean, plant-powered protein boost."
  },
  {
    image: "/DIY/Keer.png",
    title: "Makhana Kheer",
    copy: "Silky slow-cooked milk, tender makhana, and aromatic cardamom — tradition in every spoon."
  },
  {
    image: "/DIY/trialMix.png",
    title: "Makhana Trail Mix",
    copy: "A wholesome crunch of roasted makhana, nuts, and dried fruits for the perfect anytime snack."
  },
  {
    image: "/DIY/makhanaDip.png",
    title: "Makhana with Dip",
    copy: "Crispy roasted makhana paired with a creamy dip for the ultimate crunchy-creamy experience."
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

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {ideas.map((idea) => (
              <div key={idea.title} className="flex min-h-[220px] flex-col rounded-2xl border border-stone/80 bg-sand/40 p-5 text-center">
                <div className="relative mx-auto h-24 w-full max-w-[150px] overflow-hidden rounded-2xl">
                  {idea.image ? (
                    <Image
                      src={idea.image}
                      alt={idea.title}
                      fill
                      className="object-contain p-2"
                      sizes="150px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-4 text-sm font-medium text-gray-500">
                      Image coming soon
                    </div>
                  )}
                </div>
                <p className="mt-3 text-sm font-semibold text-ink">{idea.title}</p>
                <p className="mt-2 text-sm leading-6 text-gray-700">{idea.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
