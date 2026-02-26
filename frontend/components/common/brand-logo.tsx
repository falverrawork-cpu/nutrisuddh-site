import Image from "@/components/common/app-image";
import Link from "@/components/common/app-link";

export function BrandLogo({ className = "", imageClassName = "" }: { className?: string; imageClassName?: string }) {
  return (
    <Link href="/" className={className} aria-label="Home">
      <Image
        src="/logo/brand-logo.png"
        alt="Brand logo"
        width={160}
        height={42}
        priority
        className={imageClassName}
      />
    </Link>
  );
}
