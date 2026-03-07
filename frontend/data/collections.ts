import { Collection } from "@/lib/types";

const categoryBanner = {
  flavoured: "https://ik.imagekit.io/Falverra/peri-peri.png?updatedAt=1772868771884",
  roasted: "https://ik.imagekit.io/Falverra/peri-peri.png?updatedAt=1772868771884",
  periPeri: "https://ik.imagekit.io/Falverra/peri-peri.png?updatedAt=1772868771884",
  tomatoChilli: "https://ik.imagekit.io/Falverra/pudina-cheese-periperi.png?updatedAt=1772868772810",
  creamOnion: "https://ik.imagekit.io/Falverra/cream-onion.png?updatedAt=1772868771847",
  pudina: "https://ik.imagekit.io/Falverra/pudina(1).png?updatedAt=1772868772073",
  saltPepper: "https://ik.imagekit.io/Falverra/salt-pepper(1).png?updatedAt=1772868771857",
  cheese: "https://ik.imagekit.io/Falverra/cheese.png?updatedAt=1772868771842",
  bulk: "https://ik.imagekit.io/Falverra/pudina-cheese-periperi.png?updatedAt=1772868772810",
  combos: "https://ik.imagekit.io/Falverra/pudina-salt-tomato.png?updatedAt=1772868772699"
};

export const collections: Collection[] = [
  {
    handle: "all-products",
    title: "Our Collection",
    description: "All flavoured makhana options, individual packs, and combo selections.",
    heroImage: categoryBanner.flavoured,
    productSlugs: [
      "peri-peri-roasted-makhana",
      "cream-onion-makhana",
      "salt-and-pepper-makhana",
      "cheese-flavoured-makhana",
      "pudina-makhana",
      "tomato-chilli-makhana",
      "combo-3-salt-pepper-pudina-tomato-chilli",
      "combo-3-tomato-chilli-cream-onion-pudina",
      "combo-3-cream-onion-peri-peri-cheese",
      "combo-3-pudina-cream-onion-peri-peri",
      "combo-pack-of-6"
    ]
  },
  {
    handle: "flavoured-makhana",
    title: "Individual Flavours",
    description: "Individual flavoured makhana packs. Minimum order: 3 packs.",
    heroImage: categoryBanner.flavoured,
    productSlugs: [
      "peri-peri-roasted-makhana",
      "tomato-chilli-makhana",
      "cream-onion-makhana",
      "salt-and-pepper-makhana",
      "cheese-flavoured-makhana",
      "pudina-makhana"
    ]
  },
  {
    handle: "roasted-makhana",
    title: "Roasted Makhana",
    description: "Expertly roasted kernels for consistent crunch and freshness.",
    heroImage: categoryBanner.roasted,
    productSlugs: [
      "peri-peri-roasted-makhana",
      "tomato-chilli-makhana",
      "cream-onion-makhana",
      "salt-and-pepper-makhana",
      "cheese-flavoured-makhana",
      "pudina-makhana"
    ]
  },
  {
    handle: "tomato-chilli",
    title: "Tomato & Chilli Range",
    description: "Tangy and spicy flavour profile for bold snack cravings.",
    heroImage: categoryBanner.tomatoChilli,
    productSlugs: ["tomato-chilli-makhana"]
  },
  {
    handle: "peri-peri",
    title: "Peri Peri Range",
    description: "Spicy and tangy range for bold flavour lovers.",
    heroImage: categoryBanner.periPeri,
    productSlugs: ["peri-peri-roasted-makhana"]
  },
  {
    handle: "cream-onion",
    title: "Cream & Onion Range",
    description: "Creamy onion blend with savoury depth.",
    heroImage: categoryBanner.creamOnion,
    productSlugs: ["cream-onion-makhana"]
  },
  {
    handle: "pudina",
    title: "Pudina Range",
    description: "Cool mint-inspired roasted makhana line.",
    heroImage: categoryBanner.pudina,
    productSlugs: ["pudina-makhana"]
  },
  {
    handle: "salt-pepper",
    title: "Salt and Pepper Range",
    description: "Classic seasoning with balanced savoury profile.",
    heroImage: categoryBanner.saltPepper,
    productSlugs: ["salt-and-pepper-makhana"]
  },
  {
    handle: "cheese",
    title: "Cheese Range",
    description: "Rich cheese-coated roasted makhana options.",
    heroImage: categoryBanner.cheese,
    productSlugs: ["cheese-flavoured-makhana"]
  },
  {
    handle: "bulk-makhana",
    title: "Export Bulk Packs",
    description: "Bulk supply packs tailored for wholesale and export buyers.",
    heroImage: categoryBanner.bulk,
    productSlugs: [
      "peri-peri-roasted-makhana",
      "tomato-chilli-makhana",
      "cream-onion-makhana",
      "salt-and-pepper-makhana",
      "cheese-flavoured-makhana",
      "pudina-makhana"
    ]
  },
  {
    handle: "combos",
    title: "Hot Combos",
    description: "Eplore our range of Hot combos curated to your preferences.",
    heroImage: "https://ik.imagekit.io/Falverra/pudina-salt-tomato.png?updatedAt=1772868772699",
    productSlugs: [
      "combo-3-salt-pepper-pudina-tomato-chilli",
      "combo-3-tomato-chilli-cream-onion-pudina",
      "combo-3-cream-onion-peri-peri-cheese",
      "combo-3-pudina-cream-onion-peri-peri",
      "combo-pack-of-6"
    ]
  }
];

export const collectionMap = new Map(collections.map((collection) => [collection.handle, collection]));
