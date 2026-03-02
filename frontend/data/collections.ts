import { Collection } from "@/lib/types";

const categoryBanner = {
  flavoured: "/category-banners/tangy-spicy.png",
  roasted: "/category-banners/fresh-fun.png",
  periPeri: "/category-banners/spicy.png",
  tomatoChilli: "/category-banners/tangy-spicy.png",
  creamOnion: "/category-banners/creamy-tangy.png",
  pudina: "/category-banners/fresh-fun.png",
  saltPepper: "/category-banners/plain.png",
  cheese: "/category-banners/cheese-fun.png",
  bulk: "/combo-banners/combo-hot.png",
  combos: "/combo-banners/combo-light.png"
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
    title: "Indivisual Flavours",
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
    heroImage: "/combo-banners/combo-light.png",
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
