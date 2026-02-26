import Image from "@/components/common/app-image";
import Link from "@/components/common/app-link";
import { Product } from "@/lib/types";

export function ComboFlavoursGrid({ flavours }: { flavours: Product[] }) {
  if (!flavours.length) {
    return null;
  }

  return (
    <section className="mt-6 rounded-2xl border border-stone bg-white p-4 sm:p-5">
      <h2 className="font-display text-2xl">Included Flavours</h2>
      <p className="mt-1 text-sm text-gray-600">This combo contains the following single-pack flavours.</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {flavours.map((flavour) => (
          <Link
            key={flavour.id}
            href={`/products/${flavour.slug}`}
            className="group overflow-hidden rounded-xl border border-stone bg-vanilla transition hover:border-pine/40"
          >
            <div className="relative aspect-square">
              <Image
                src={flavour.images[0]}
                alt={flavour.title}
                fill
                className="object-contain p-2 transition duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 180px"
              />
            </div>
            <p className="px-3 pb-3 text-xs font-medium text-ink sm:text-sm">{flavour.title}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
