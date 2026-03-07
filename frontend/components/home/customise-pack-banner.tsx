import Image from "@/components/common/app-image";
import Link from "@/components/common/app-link";
import { Reveal } from "@/components/common/reveal";

export function CustomisePackBanner() {
  return (
    <section className="container-base mt-14">
      <Reveal>
        <Link
          href="/collections/flavoured-makhana"
          className="focus-ring group block overflow-hidden rounded-3xl border border-stone bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-24px_rgba(11,110,79,0.55)]"
          aria-label="Customise your Pack - Go to products"
        >
          <div className="relative min-h-[280px] sm:min-h-[320px]">
            <Image
              src="https://ik.imagekit.io/Falverra/customise-products.jpg?updatedAt=1772868770834"
              alt="Customise your Pack"
              fill
              className="object-cover transition duration-700 group-hover:scale-110"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-transparent transition duration-500 group-hover:from-black/55 group-hover:via-black/25" />
            <div className="relative z-10 flex min-h-[280px] flex-col justify-center p-6 text-white transition duration-500 group-hover:translate-x-1 sm:min-h-[320px] sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/90">Custom Packs</p>
              <h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">Customise your Pack</h2>
              <p className="mt-3 max-w-xl text-sm text-white/90 sm:text-base">
                Mix your preferred makhana flavours and build your own bundle in minutes.
              </p>
              <span className="mt-6 inline-flex w-fit rounded-full bg-pine px-5 py-2.5 text-sm font-semibold text-white transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lg">
                Explore Products
              </span>
            </div>
          </div>
        </Link>
      </Reveal>
    </section>
  );
}
