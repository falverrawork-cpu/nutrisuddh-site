export type ProductBadge = "Bestseller" | "New" | "Best Value" | `${number}% OFF`;

export type ProductVariant = {
  id: string;
  label: string;
  size: string;
  price: number;
};

export type NutritionRow = {
  name: string;
  value: string;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  price: number;
  compareAtPrice: number;
  images: string[];
  badges: ProductBadge[];
  rating: number;
  reviewCount: number;
  tags: string[];
  collectionHandles: string[];
  variants: ProductVariant[];
  stock: number;
  description?: string;
  ingredients?: string;
  nutrition?: NutritionRow[];
  storage?: string;
  shipping?: string;
  returns?: string;
};

export type Collection = {
  handle: string;
  title: string;
  description: string;
  heroImage: string;
  productSlugs: string[];
};

export type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  image: string;
};

export type Testimonial = {
  id: string;
  name: string;
  location: string;
  quote: string;
};

export type CartItem = {
  productId: string;
  variantId: string;
  quantity: number;
  isFreeItem?: boolean;
  sourceCouponCode?: string;
};

export type OrderItem = {
  productId: string;
  productTitle: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  image: string;
};

export type Order = {
  id: string;
  userId?: number;
  createdAt: string;
  expectedDeliveryDate: string;
  status: "Order Confirmed" | "Dispatched" | "Delivered" | "Confirmed" | "Pending" | "Completed";
  paymentId: string;
  paymentStatus?: "Paid" | "Pending";
  subtotal: number;
  discountCode?: string;
  discountAmount: number;
  shipping: number;
  total: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  pinCode?: string;
  items: OrderItem[];
};

export type FormSubmission = {
  id: number;
  formType: "contact" | "bulk";
  name: string;
  email: string;
  phone: string;
  subject: string;
  company: string;
  country: string;
  quantity: string;
  message: string;
  status: "new" | "replied" | string;
  replySubject: string;
  replyMessage: string;
  repliedAt: string | null;
  createdAt: string;
};
