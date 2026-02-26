import Image from "@/components/common/app-image";
import Link from "@/components/common/app-link";
import { comboPromo } from "@/data/homepage";
import { Reveal } from "@/components/common/reveal";

export function ComboPromo() {
  return (
    <section className="container-base mt-14">
      <Reveal>
        <div className="group relative overflow-hidden rounded-3xl border border-stone transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-24px_rgba(11,110,79,0.55)]">
          <Image
            src={comboPromo.image}
            alt={comboPromo.title}
            fill
            className="object-cover transition duration-700 group-hover:scale-110"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30 transition duration-500 group-hover:from-black/60 group-hover:via-black/40" />
          <div className="relative p-5 text-white transition duration-500 group-hover:translate-x-1 sm:p-8 lg:max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/90">Combos & Mixes</p>
            <h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">{comboPromo.title}</h2>
            <p className="mt-3 text-sm text-white/90 sm:text-base">{comboPromo.subtitle}</p>
            <Link href={comboPromo.ctaHref} className="focus-ring mt-6 inline-block rounded-full bg-pine px-5 py-2.5 text-sm font-semibold text-white transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lg">
              {comboPromo.ctaLabel}
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
