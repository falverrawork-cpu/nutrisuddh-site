import Link from "@/components/common/app-link";
import { collections } from "@/data/collections";
import { BrandLogo } from "@/components/common/brand-logo";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-stone bg-white">
      <div className="container-base grid gap-8 py-10 sm:gap-10 sm:py-12 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <BrandLogo className="inline-flex items-center" imageClassName="h-20 w-auto object-contain sm:h-24" />
          <p className="mt-3 max-w-md text-sm text-gray-600">
            Simple. Healthy. Delicious.
            <br />
            Nutri Suddh brings you clean, premium makhana crafted for everyday mindful
            snacking.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">Collections</h3>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            {collections.slice(0, 3).map((collection) => (
              <li key={collection.handle}>
                <Link href={`/collections/${collection.handle}`} className="link-hover">
                  {collection.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">Company</h3>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li><Link href="/about" className="link-hover">About Us</Link></li>
            <li><Link href="/blog" className="link-hover">Blog</Link></li>
            <li><Link href="/contact" className="link-hover">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">Legal & Trust</h3>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li><Link href="/policies/privacy" className="link-hover">Privacy Policy</Link></li>
            <li><Link href="/policies/terms" className="link-hover">Terms & Conditions</Link></li>
            <li><Link href="/policies/shipping" className="link-hover">Shipping Policy</Link></li>
            <li><Link href="/policies/returns" className="link-hover">Refund & Return Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-stone py-4">
        <div className="container-base flex flex-col items-center justify-between gap-2 text-xs text-gray-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Nutri Suddh. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="https://www.instagram.com/nutrisuddh/" className="link-hover" target="_blank" rel="noreferrer noopener">Instagram</Link>
            <Link href="https://www.facebook.com/p/NUTRI-SUDDH-61577812042298/?_rdr" className="link-hover" target="_blank" rel="noreferrer noopener">Facebook</Link>
            <Link href="https://www.linkedin.com/company/nutrisuddh/" className="link-hover" target="_blank" rel="noreferrer noopener">LinkedIn</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
