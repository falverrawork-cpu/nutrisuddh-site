# Replace Content Guide

## Update products

Edit `/Users/varunagarwal/Desktop/farmley copy/data/products.ts`.

Schema per product:

- `id`
- `slug`
- `title`
- `subtitle`
- `price`
- `compareAtPrice`
- `images[]`
- `badges[]`
- `rating`
- `reviewCount`
- `tags[]`
- `collectionHandles[]`
- `variants[]`
- `stock`

## Update collections

Edit `/Users/varunagarwal/Desktop/farmley copy/data/collections.ts`.

Schema per collection:

- `handle`
- `title`
- `description`
- `heroImage`
- `productSlugs[]`

## Update homepage banners and messaging

Edit `/Users/varunagarwal/Desktop/farmley copy/data/homepage.ts`:

- `promoMessages`
- `heroSlides`
- `trustPoints`
- `testimonials`
- `comboPromo`

## Update brand colors and typography

Edit `/Users/varunagarwal/Desktop/farmley copy/tailwind.config.ts`:

- `theme.extend.colors`
- `theme.extend.fontFamily`

## Replace policy/about/contact content

Edit route files in `/Users/varunagarwal/Desktop/farmley copy/app/about/page.tsx`, `/Users/varunagarwal/Desktop/farmley copy/app/contact/page.tsx`, and `/Users/varunagarwal/Desktop/farmley copy/app/policies/*/page.tsx`.

## Future backend swap path

Current data access is isolated and can be replaced with Shopify/Medusa/Strapi fetch layers in:

- `/Users/varunagarwal/Desktop/farmley copy/lib/catalog.ts`
- `/Users/varunagarwal/Desktop/farmley copy/lib/cart.ts`
