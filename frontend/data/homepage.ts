import { HeroSlide, Testimonial } from "@/lib/types";

const flavorBanner = {
  pudina: "/banners/pudina.png",
  saltPepper: "/banners/salt-pepper.png",
  tomatoChilli: "/banners/tomato-chilli.png",
  periPeri: "/banners/peri-peri.png",
  cheese: "/banners/cheese.png",
  creamOnion: "/banners/cream-onion.png"
};

export const promoMessages = [
  "SIMPLE. HEALTHY. DELICIOUS.",
  "Individual flavour packs with minimum order of 3",
  "Combo of 3 packs available across signature flavours",
  "Wholesale & bulk enquiry support available"
];

export const heroSlides: HeroSlide[] = [
  {
    id: "h1",
    title: "Clean Makhana for Modern Snacking",
    subtitle:
      "Nutri Suddh delivers pure, nourishing, and genuinely satisfying makhana with no unnecessary additives.",
    ctaLabel: "Shop",
    ctaHref: "/collections/all-products",
    secondaryCtaLabel: "About Us",
    secondaryCtaHref: "/about",
    image: flavorBanner.pudina
  },
  {
    id: "h2",
    title: "Our Collection. Your Favourite Flavours.",
    subtitle:
      "Explore individual flavoured makhana packs and combo packs crafted for daily snacking and sharing.",
    ctaLabel: "Explore Our Range",
    ctaHref: "/collections/all-products",
    secondaryCtaLabel: "Contact",
    secondaryCtaHref: "/contact",
    image: flavorBanner.saltPepper
  },
  {
    id: "h3",
    title: "Wholesale & Bulk Enquiry",
    subtitle:
      "Backed by NS Agro Overseas expertise, we support large-volume and wholesale requirements with reliable quality.",
    ctaLabel: "Request Enquiry",
    ctaHref: "/#bulk-quote",
    secondaryCtaLabel: "Contact Us",
    secondaryCtaHref: "/contact",
    image: flavorBanner.tomatoChilli
  }
];

export const trustPoints = [
  "SUPERFOOD",
  "NATURALLY GLUTEN FREE",
  "NO ADDED PRESERVATIVES",
  "LIGHT & WHOLESOME"
];

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Ritwik Saha",
    location: "Siliguri, West Bengal",
    quote: "The quality and crunch are consistently excellent. It feels like a premium everyday upgrade."
  },
  {
    id: "t2",
    name: "Ananya Roy",
    location: "Siliguri, West Bengal",
    quote: "I keep the office packs at my desk now. Great taste, clean ingredients, and convenient portions."
  },
  {
    id: "t3",
    name: "Sourav Dutta",
    location: "Siliguri, West Bengal",
    quote: "Gift boxes looked polished and the products were genuinely fresh. Perfect for client gifting."
  }
];

export const comboPromo = {
  title: "Combo of 3 Packs",
  subtitle: "Choose flavour-ready combo packs curated for everyday snacking and gifting.",
  ctaLabel: "Explore Combos",
  ctaHref: "/collections/combos",
  image: "/banners/MOQ.png"
};

export const bulkSection = {
  title: "Wholesale & Bulk Enquiry",
  copy:
    "For wholesale, resale, and bulk requirements, share your quantity and business needs with us. Our team will help you with product options, supply timelines, and pricing support.",
  ctaLabel: "Send Bulk Enquiry"
};
