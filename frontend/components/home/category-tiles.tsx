import Image from "@/components/common/app-image";
import Link from "@/components/common/app-link";
import { collections } from "@/data/collections";
import { Reveal } from "@/components/common/reveal";
import { SectionHeading } from "@/components/common/section-heading";

const categoryImageByHandle: Record<string, string> = {
  "flavoured-makhana": "https://ik.imagekit.io/Falverra/peri-peri.png?updatedAt=1772868771884",
  "roasted-makhana": "https://ik.imagekit.io/Falverra/peri-peri.png?updatedAt=1772868771884",
  "peri-peri": "https://ik.imagekit.io/Falverra/peri-peri.png?updatedAt=1772868771884",
  "cream-onion": "https://ik.imagekit.io/Falverra/cream-onion.png?updatedAt=1772868771847",
  pudina: "https://ik.imagekit.io/Falverra/pudina(1).png?updatedAt=1772868772073",
  "salt-pepper": "https://ik.imagekit.io/Falverra/salt-pepper(1).png?updatedAt=1772868771857",
  cheese: "https://ik.imagekit.io/Falverra/cheese.png?updatedAt=1772868771842",
  "bulk-makhana": "https://ik.imagekit.io/Falverra/pudina-cheese-periperi.png?updatedAt=1772868772810",
  combos: "https://ik.imagekit.io/Falverra/pudina-salt-tomato.png?updatedAt=1772868772699"
};

export function CategoryTiles() {
  return (
    <section className="container-base mt-14">
      <Reveal>
        <SectionHeading
          title="Our Products"
          subtitle="Discover flavoured, roasted, combo, and bulk makhana categories."
        />
      </Reveal>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {collections.map((collection, index) => (
          <Reveal key={collection.handle} delay={index * 0.04}>
            <Link
              href={`/collections/${collection.handle}`}
              className="group block overflow-hidden rounded-2xl border border-stone bg-white"
            >
              <div className="relative aspect-[5/4]">
                <Image
                  src={categoryImageByHandle[collection.handle] ?? collection.heroImage}
                  alt={collection.title}
                  fill
                  className={`object-cover transition duration-500 group-hover:scale-105 ${
                    collection.handle === "combos" || collection.handle === "bulk-makhana" ? "scale-110" : ""
                  }`}
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
              </div>
              <div className="p-3">
                <p className="font-semibold text-ink">{collection.title}</p>
                <p className="line-clamp-1 text-xs text-gray-600">{collection.description}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
