import { Product } from "@/lib/types";
import { SINGLE_PACK_MRP, SINGLE_PACK_SELLING_PRICE } from "@/lib/pricing";

const flavorSet = (name: string) => [
  `/products/flavors/${name}/front.png`,
  `/products/flavors/${name}/side.png`,
  `/products/flavors/${name}/back.png`,
  `/products/flavors/${name}/label.png`,
  `/products/flavors/${name}/label-2.png`,
  `/products/flavors/${name}/lifestyle.jpg`
];

const resolveFlavorImages = (name: string, overrides?: string[]) => {
  const fallback = flavorSet(name);

  if (!overrides?.length) {
    return fallback;
  }

  const findMatch = (pattern: RegExp) => overrides.find((url) => pattern.test(url));

  return [
    findMatch(/\/front(?:\(|\.)/) ?? fallback[0],
    findMatch(/\/side(?:\(|\.)/) ?? fallback[1],
    findMatch(/\/back(?:\(|\.)/) ?? fallback[2],
    findMatch(/\/label(?!-2)(?:\(|\.)/) ?? fallback[3],
    findMatch(/\/label-2(?:\(|\.)/) ?? fallback[4],
    findMatch(/\/lifestyle(?:\(|\.)/) ?? fallback[5]
  ];
};

const customFlavorImageSources: Record<string, string[] | undefined> = {
  cheese: [
    "https://ik.imagekit.io/Falverra/front.png?updatedAt=1772868771215",
    "https://ik.imagekit.io/Falverra/side.png?updatedAt=1772868770972",
    "https://ik.imagekit.io/Falverra/back.png?updatedAt=1772868770825",
    "https://ik.imagekit.io/Falverra/label.png?updatedAt=1772868770715",
    "https://ik.imagekit.io/Falverra/label-2.png?updatedAt=1772868770674",
    "https://ik.imagekit.io/Falverra/lifestyle.jpg?updatedAt=1772868770340"
  ],
  "cream-onion": [
    "https://ik.imagekit.io/Falverra/front(1).png?updatedAt=1772868770883",
    "https://ik.imagekit.io/Falverra/side(1).png?updatedAt=1772868770887",
    "https://ik.imagekit.io/Falverra/back(1).png?updatedAt=1772868770837",
    "https://ik.imagekit.io/Falverra/label(1).png?updatedAt=1772868770514",
    "https://ik.imagekit.io/Falverra/front(1).png?updatedAt=1772868770883",
    "https://ik.imagekit.io/Falverra/lifestyle(1).jpg?updatedAt=1772868770433"
  ],
  "peri-peri": [
    "https://ik.imagekit.io/Falverra/side(2).png?updatedAt=1772868770970",
    "https://ik.imagekit.io/Falverra/side(2).png?updatedAt=1772868770970",
    "https://ik.imagekit.io/Falverra/front(2).png?updatedAt=1772868771005",
    "https://ik.imagekit.io/Falverra/label(2).png?updatedAt=1772868770701",
    "https://ik.imagekit.io/Falverra/label(2).png?updatedAt=1772868770701",
    "https://ik.imagekit.io/Falverra/lifestyle(2).jpg?updatedAt=1772868770430"
  ],
  pudina: [
    "https://ik.imagekit.io/Falverra/front(3).png?updatedAt=1772868771196",
    "https://ik.imagekit.io/Falverra/side(3).png?updatedAt=1772868771219",
    "https://ik.imagekit.io/Falverra/back(3).png?updatedAt=1772868770928",
    "https://ik.imagekit.io/Falverra/label(3).png?updatedAt=1772868770615",
    "https://ik.imagekit.io/Falverra/label-2(3).png?updatedAt=1772868770685",
    "https://ik.imagekit.io/Falverra/label(3).png?updatedAt=1772868770615"
  ],
  "salt-pepper": [
    "https://ik.imagekit.io/Falverra/front(4).png?updatedAt=1772868770939",
    "https://ik.imagekit.io/Falverra/back(4).png?updatedAt=1772868770972",
    "https://ik.imagekit.io/Falverra/label-2(4).png?updatedAt=1772868770586",
    "https://ik.imagekit.io/Falverra/label(4).png?updatedAt=1772868770503",
    "https://ik.imagekit.io/Falverra/lifestyle(4).jpg?updatedAt=1772868770294",
    "https://ik.imagekit.io/Falverra/side(4).png?updatedAt=1772868770861"
  ],
  "tomato-chilli": [
    "https://ik.imagekit.io/Falverra/back(5).png?updatedAt=1772868770865",
    "https://ik.imagekit.io/Falverra/front(5).png?updatedAt=1772868771206",
    "https://ik.imagekit.io/Falverra/label-2(5).png?updatedAt=1772868770540",
    "https://ik.imagekit.io/Falverra/label(5).png?updatedAt=1772868770693",
    "https://ik.imagekit.io/Falverra/lifestyle(5).jpg?updatedAt=1772868770329",
    "https://ik.imagekit.io/Falverra/side(5).png?updatedAt=1772868771202"
  ]
};

type ProductSeed = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  price: number;
  compareAtPrice: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  collectionHandles: string[];
  stock: number;
  badges?: Product["badges"];
  images: string[];
  description?: string;
  ingredients?: string;
  nutrition?: Product["nutrition"];
  storage?: string;
  shipping?: string;
  returns?: string;
};

const standardShipping =
  "Dispatch: 2-4 working days. Bulk/export timelines depend on logistics. PAN India and international shipping available.";
const standardReturns =
  "Damaged product claims within 48 hours. Replacement/refund after verification. No returns on opened consumables.";

const seeds: ProductSeed[] = [
  {
    id: "p1",
    slug: "peri-peri-roasted-makhana",
    title: "Peri Peri Roasted Makhana",
    subtitle: "Fiery, smoky, and crunchy with a global peri peri twist.",
    price: SINGLE_PACK_SELLING_PRICE,
    compareAtPrice: SINGLE_PACK_MRP,
    rating: 4.8,
    reviewCount: 132,
    tags: ["makhana-single", "flavoured", "peri-peri", "roasted"],
    collectionHandles: ["flavoured-makhana", "roasted-makhana", "peri-peri", "makhana-singles"],
    stock: 180,
    badges: ["Bestseller", "27% OFF"],
    images: resolveFlavorImages("peri-peri", customFlavorImageSources["peri-peri"]),
    description:
      "A bold peri peri blend with subtle sweetness and controlled chilli warmth on a slow-roasted makhana base. Taste profile is smoky, lightly spicy, and balanced so it stays snackable without overpowering heat. Nutrition snapshot per 100g: 470.75 kcal, 6.64g protein, 7.08g fiber, 22.19g fat, and 161.96mg sodium. Best suited for spicy snack lovers, evening cravings, and sharing bowls.",
    ingredients:
      "Makhana (70%), olive oil, sugar, iodized salt, garlic powder, spice and condiments (chilli, aniseed, fenugreek, ajwain, kalonji), tomato powder, anti-caking agent, edible vegetable fat (palm), flavour enhancers (INS 627, INS 631).",
    nutrition: [
      { name: "Energy", value: "470.75 kcal" },
      { name: "Protein", value: "6.64 g" },
      { name: "Dietary Fiber", value: "7.08 g" },
      { name: "Total Fat", value: "22.19 g" },
      { name: "Sodium", value: "161.96 mg" }
    ],
    storage: "Airtight container. Avoid humidity exposure.",
    shipping: standardShipping,
    returns: standardReturns
  },
  {
    id: "p2",
    slug: "cream-onion-makhana",
    title: "Cream & Onion Makhana",
    subtitle: "A classic flavour blend with perfectly balanced savoury notes.",
    price: SINGLE_PACK_SELLING_PRICE,
    compareAtPrice: SINGLE_PACK_MRP,
    rating: 4.7,
    reviewCount: 121,
    tags: ["makhana-single", "flavoured", "cream-onion", "roasted"],
    collectionHandles: ["flavoured-makhana", "roasted-makhana", "cream-onion", "makhana-singles"],
    stock: 175,
    badges: ["New", "27% OFF"],
    images: resolveFlavorImages("cream-onion", customFlavorImageSources["cream-onion"]),
    description:
      "Makhana, also known as Foxnuts or Lotus Seeds, are light yet satisfying superfoods packed with protein, minerals, and antioxidants. A healthier alternative to fried snacks, they are slow-roasted and gently seasoned to deliver a delicious crunch in every bite. Ideal for tea-time, travel, or mindful snacking anytime, anywhere.",
    ingredients:
      "Makhana (Fox Nuts - 70%), Olive Oil 18%, Spices & Condiments 10% (Dried White Onion, Parsley, Chilli), Edible Salt, Sugar, Whey Powder, Milk Solid. Contains added flavour(s): natural and nature identical and artificial flavouring substances. Allergen information: contains milk products. Processed in a facility that also handles peanuts, tree nuts, soy and cereals.",
    nutrition: [
      { name: "Energy", value: "487.11 kcal" },
      { name: "Protein", value: "19.38 g" },
      { name: "Dietary Fiber", value: "6.93 g" },
      { name: "Total Fat", value: "24.79 g" },
      { name: "Sodium", value: "359.08 mg" },
    ],
    shipping: standardShipping,
    returns: standardReturns
  },
  {
    id: "p3",
    slug: "salt-and-pepper-makhana",
    title: "Salt and Pepper Makhana",
    subtitle: "Classic, clean, and reliable with everyday crunch.",
    price: SINGLE_PACK_SELLING_PRICE,
    compareAtPrice: SINGLE_PACK_MRP,
    rating: 4.8,
    reviewCount: 99,
    tags: ["makhana-single", "salt-pepper", "roasted", "flavoured"],
    collectionHandles: ["flavoured-makhana", "roasted-makhana", "salt-pepper", "makhana-singles"],
    stock: 190,
    badges: ["27% OFF"],
    images: resolveFlavorImages("salt-pepper", customFlavorImageSources["salt-pepper"]),
    description:
      "Minimal seasoning, maximum crunch. This everyday variant delivers clean saltiness with gentle pepper warmth and a neutral, addictive finish. Nutrition snapshot per 100g: 485.71 kcal, 7.16g protein, 6.88g fiber, 24.63g fat, and 206.36mg sodium. Ideal for daily snacking, kids, office desks, and simple flavour lovers.",
    ingredients:
      "Makhana, olive oil, black pepper, pink salt, milk solids, maltodextrin, hydrolyzed vegetable protein (peanuts). Contains milk and peanut derivatives.",
    nutrition: [
      { name: "Energy", value: "485.71 kcal" },
      { name: "Protein", value: "7.16 g" },
      { name: "Dietary Fiber", value: "6.88 g" },
      { name: "Total Fat", value: "24.63 g" },
      { name: "Sodium", value: "206.36 mg" }
    ],
    shipping: standardShipping,
    returns: standardReturns
  },
  {
    id: "p4",
    slug: "cheese-flavoured-makhana",
    title: "Cheese Flavoured Makhana",
    subtitle: "Bold, creamy comfort snacking with zero compromise on crunch.",
    price: SINGLE_PACK_SELLING_PRICE,
    compareAtPrice: SINGLE_PACK_MRP,
    rating: 4.7,
    reviewCount: 115,
    tags: ["makhana-single", "cheese", "flavoured", "roasted"],
    collectionHandles: ["flavoured-makhana", "roasted-makhana", "cheese", "makhana-singles"],
    stock: 168,
    badges: ["Bestseller", "27% OFF"],
    images: resolveFlavorImages("cheese", customFlavorImageSources.cheese),
    description:
      "Nutrisuddh Cheese Makhana combines slow-roasted fox nuts with a rich savoury cheese profile for instant craving satisfaction. Light in texture, big on flavour, and roasted not fried. Taste profile is smooth cheesy coating with mild spice undertones and balanced saltiness. Nutrition snapshot per 100g: 477.98 kcal, 7.04g protein, 6.84g dietary fiber, 21.66g fat, and 258.63mg sodium. Great for movie nights, office snacking, and evening cravings.",
    ingredients:
      "Makhana (fox nuts) 66%, olive oil, spices and condiments, wheat flour, yellow chilli, onion, garlic, oregano, milk solids, maltodextrin, hydrolyzed vegetable protein (peanut), acidity regulator (E-296), flavour enhancer (E-627, E-631), colour (E-160c). Contains milk and peanut derivatives.",
    nutrition: [
      { name: "Energy", value: "477.98 kcal" },
      { name: "Protein", value: "7.04 g" },
      { name: "Dietary Fiber", value: "6.84 g" },
      { name: "Total Fat", value: "21.66 g" },
      { name: "Sodium", value: "258.63 mg" }
    ],
    shipping: standardShipping,
    returns: standardReturns
  },
  {
    id: "p5",
    slug: "pudina-makhana",
    title: "Pudina Makhana",
    subtitle: "Fresh, zesty, and refreshingly addictive mint crunch.",
    price: SINGLE_PACK_SELLING_PRICE,
    compareAtPrice: SINGLE_PACK_MRP,
    rating: 4.6,
    reviewCount: 94,
    tags: ["makhana-single", "pudina", "flavoured", "roasted"],
    collectionHandles: ["flavoured-makhana", "roasted-makhana", "pudina", "makhana-singles"],
    stock: 172,
    badges: ["New", "27% OFF"],
    images: resolveFlavorImages("pudina", customFlavorImageSources.pudina),
    description:
      "Minty freshness meets roasted crunch for a cooling, herby flavour that feels light yet satisfying. Taste profile includes bright mint notes, mild spice warmth, and a clean finish that does not feel heavy. Nutrition snapshot per 100g: 487.11 kcal, 19.38g protein, 6.93g fiber, 24.79g fat, and 359.08mg sodium. Ideal for post-work snacking, gym bags, road trips, and mindful snacking.",
    ingredients:
      "Makhana 70%, olive oil 18%, dried white onion, parsley, chilli, edible salt, sugar, whey powder, milk solids. Contains milk products.",
    nutrition: [
      { name: "Energy", value: "487.11 kcal" },
      { name: "Protein", value: "19.38 g" },
      { name: "Dietary Fiber", value: "6.93 g" },
      { name: "Total Fat", value: "24.79 g" },
      { name: "Sodium", value: "359.08 mg" }
    ],
    shipping: standardShipping,
    returns: standardReturns
  },
  {
    id: "p11",
    slug: "tomato-chilli-makhana",
    title: "Tomato & Chilli Makhana",
    subtitle: "Tangy, spicy, and full-power flavour for bold snack cravings.",
    price: SINGLE_PACK_SELLING_PRICE,
    compareAtPrice: SINGLE_PACK_MRP,
    rating: 4.7,
    reviewCount: 108,
    tags: ["makhana-single", "tomato-chilli", "flavoured", "roasted"],
    collectionHandles: ["flavoured-makhana", "roasted-makhana", "tomato-chilli", "makhana-singles"],
    stock: 176,
    badges: ["27% OFF"],
    images: resolveFlavorImages("tomato-chilli", customFlavorImageSources["tomato-chilli"]),
    description:
      "Tomato tang hits first, followed by a controlled chilli warmth that builds with every bite. This desi-style flavour is punchy but balanced, with crunchy texture throughout. Nutrition snapshot per 100g: 489.40 kcal, 20.06g protein, 7.39g fiber, 26.72g fat, and 237.72mg sodium. Perfect for spice lovers, chai-time snacking, and party bowls.",
    ingredients:
      "Makhana 70%, olive oil, dehydrated onion and garlic, mixed spices (red chilli, carom seeds, cumin), roasted peanuts, paprika colour, acidity regulator (E330), flavour enhancer (E627, E631). Contains peanuts.",
    nutrition: [
      { name: "Energy", value: "489.40 kcal" },
      { name: "Protein", value: "20.06 g" },
      { name: "Dietary Fiber", value: "7.39 g" },
      { name: "Total Fat", value: "26.72 g" },
      { name: "Sodium", value: "237.72 mg" }
    ],
    shipping: standardShipping,
    returns: standardReturns
  },
  {
    id: "p6",
    slug: "combo-3-salt-pepper-pudina-tomato-chilli",
    title: "Combo of 3: Salt & Pepper + Cream & Onion + Tomato & Chilli",
    subtitle: "The Everyday Crunch Trio - classic, creamy, and spicy in one box.",
    price:  687,
    compareAtPrice:  897,
    rating: 4.8,
    reviewCount: 76,
    tags: ["combo-pack", "bundle-3", "salt-pepper", "cream-onion", "tomato-chilli"],
    collectionHandles: ["combos"],
    stock: 96,
    badges: ["Bestseller"],
    images: [
      "https://ik.imagekit.io/Falverra/pudina-salt-tomato.png?updatedAt=1772868772699",
      "https://ik.imagekit.io/Falverra/pudina-salt-tomato.png?updatedAt=1772868772699",
      "https://ik.imagekit.io/Falverra/pudina-salt-tomato.png?updatedAt=1772868772699"
    ],
    description:
      "Combo Name: The Everyday Crunch Trio. Hero Hook: Three moods, one jar at a time. This combo covers daily snacking cravings without getting boring. What's inside: Salt & Pepper (clean classic crunch), Cream & Onion (smooth savoury richness), Tomato & Chilli (tangy spice punch). Flavour experience: start light with salt-pepper, move into creamy onion savouriness, then finish with tomato chilli heat. Why this combo works: balanced flavour mix, classic + creamy + spicy, ideal first-time trial pack. Perfect for office desk snacks, family sharing, tea-time platters, and first-time Nutrisuddh buyers. Clean snacking note: all variants are slow-roasted, never fried."
  },
  {
    id: "p7",
    slug: "combo-3-tomato-chilli-cream-onion-pudina",
    title: "Combo of 3: Tomato & Chilli + Cream & Onion + Pudina",
    subtitle: "The Tangy Indulgence Trio - creamy, tangy, and minty in perfect balance.",
    price:  687,
    compareAtPrice:  897,
    rating: 4.8,
    reviewCount: 63,
    tags: ["combo-pack", "bundle-3", "tomato-chilli", "cream-onion", "pudina"],
    collectionHandles: ["combos"],
    stock: 92,
    badges: ["New"],
    images: [
      "https://ik.imagekit.io/Falverra/tomato-pudina-cream.png?updatedAt=1772868772737",
      "https://ik.imagekit.io/Falverra/tomato-pudina-cream.png?updatedAt=1772868772737",
      "https://ik.imagekit.io/Falverra/tomato-pudina-cream.png?updatedAt=1772868772737"
    ],
    description:
      "Combo Name: The Tangy Indulgence Trio. Hero Hook: Creamy, tangy, minty. Crafted for flavour lovers who enjoy bold taste with a smooth finish. What's inside: Tomato & Chilli (desi tang spice), Cream & Onion (smooth savoury richness), Pudina (cooling mint balance). Flavour experience: zesty tomato kick, creamy onion comfort, then mint freshness to reset the palate. Why this combo works: tangy + creamy + fresh mix, high-protein variants included, crowd-pleasing flavour profile. Perfect for Netflix nights, house parties, weekend cravings, and young snackers. Clean snacking note: foxnuts are naturally rich in antioxidants and fiber."
  },
  {
    id: "p8",
    slug: "combo-3-cream-onion-peri-peri-cheese",
    title: "Combo of 3: Pudina + Peri Peri + Cheese",
    subtitle: "The Cheesy Heat Fusion Box - fresh, fiery, and cheesy in one box.",
    price:  687,
    compareAtPrice:  897,
    rating: 4.9,
    reviewCount: 59,
    tags: ["combo-pack", "bundle-3", "pudina", "peri-peri", "cheese"],
    collectionHandles: ["combos"],
    stock: 90,
    badges: ["Bestseller"],
    images: [
      "https://ik.imagekit.io/Falverra/pudina-cheese-periperi.png?updatedAt=1772868772810",
      "https://ik.imagekit.io/Falverra/pudina-cheese-periperi.png?updatedAt=1772868772810",
      "https://ik.imagekit.io/Falverra/pudina-cheese-periperi.png?updatedAt=1772868772810"
    ],
    description:
      "Combo Name: The Cheesy Heat Fusion Box. Hero Hook: where freshness meets fire. This is a bold flavour lover's combo with minty lift, cheesy indulgence, and smoky peri peri heat. What's inside: Pudina (fresh minty crunch), Peri Peri (smoky global spice), Cheese (rich indulgent crunch). Flavour experience: refreshing pudina start, sharp cheesy bite, then a peri peri heat finish. Why this combo works: cheese-lover favourite, fresh plus spicy balance, perfect binge snacking box. Perfect for movie marathons, late-night cravings, cheese snack fans, and gifting boxes. Clean snacking note: all variants are roasted, not fried."
  },
  {
    id: "p9",
    slug: "combo-3-pudina-cream-onion-peri-peri",
    title: "Combo of 3: Pudina + Cream & Onion + Peri Peri",
    subtitle: "The Flavour Adventure Trio - cool, creamy, and fiery in one sampler.",
    price:  687,
    compareAtPrice:  897,
    rating: 4.8,
    reviewCount: 57,
    tags: ["combo-pack", "bundle-3", "pudina", "cream-onion", "peri-peri"],
    collectionHandles: ["combos"],
    stock: 89,
    badges: ["New"],
    images: [
      "https://ik.imagekit.io/Falverra/pudina-cream-periperi.png?updatedAt=1772868772756",
      "https://ik.imagekit.io/Falverra/pudina-cream-periperi.png?updatedAt=1772868772756",
      "https://ik.imagekit.io/Falverra/pudina-cream-periperi.png?updatedAt=1772868772756"
    ],
    description:
      "Combo Name: The Flavour Adventure Trio. Hero Hook: cool, creamy, fiery. A balanced combo for those who want variety in every handful. What's inside: Pudina (mint refresh), Cream & Onion (savoury comfort), Peri Peri (smoky spice). Flavour experience: cooling mint entry, creamy savoury mid-notes, and spicy peri peri finish. Why this combo works: light + creamy + spicy contrast, balanced heat profile, and great sampler value. Perfect for road trips, office sharing, couple snacking, and flavour experimentation. Clean snacking note: a wholesome alternative to fried namkeens and chips."
  },
  {
    id: "p10",
    slug: "combo-pack-of-6",
    title: "Combo Pack of 6",
    subtitle: "The Ultimate Makhana Experience Box - all flavours in one premium pack.",
    price:  1374,
    compareAtPrice:  1794,
    rating: 4.9,
    reviewCount: 61,
    tags: ["combo-pack", "bundle-6"],
    collectionHandles: ["combos"],
    stock: 88,
    badges: ["Best Value", "Bestseller"],
    images: [
      "https://ik.imagekit.io/Falverra/pack-6.png?updatedAt=1772868771870",
      "https://ik.imagekit.io/Falverra/pack-6.png?updatedAt=1772868771870",
      "https://ik.imagekit.io/Falverra/pack-6.png?updatedAt=1772868771870"
    ],
    description:
      "Combo Name: The Ultimate Makhana Experience Box. Alternate names: Nutrisuddh Complete Crunch Collection, All-Flavour Discovery Hamper, The Superfood Variety Vault. Hero Hook: why choose one when you can taste them all. What's inside: Salt & Pepper, Pudina, Tomato & Chilli, Cream & Onion, Peri Peri, and Cheese. Flavour journey: classic to fresh to tangy to creamy to smoky to cheesy. Why this combo works: best value pack, full flavour exploration, ideal gifting hamper, family sharing box, and party-ready assortment. Perfect for festive gifting, corporate hampers, bulk snacking, first-time buyers, and travel stock. Clean snacking note: all flavours are slow-roasted, high fiber, protein rich, and mindful snack alternatives."
  }
];

export const products: Product[] = seeds.map((seed) => ({
  ...seed,
  badges: seed.badges ?? [],
  variants: [
    {
      id: `${seed.id}-v1`,
      label: seed.tags.includes("combo-pack") ? "Bundle" : "Single Pack",
      size: seed.tags.includes("combo-pack") ? "Combo" : "Regular",
      price: seed.price
    }
  ]
}));

export const productMap = new Map(products.map((product) => [product.slug, product]));
