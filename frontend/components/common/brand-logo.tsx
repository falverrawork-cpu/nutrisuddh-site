"use client";

import Image from "@/components/common/app-image";
import Link from "@/components/common/app-link";
import { useThemeStore } from "@/stores/theme-store";

export function BrandLogo({ className = "", imageClassName = "" }: { className?: string; imageClassName?: string }) {
  const theme = useThemeStore((state) => state.theme);

  return (
    <Link href="/" className={className} aria-label="Home">
      <Image
        src={theme === "dark" ? "/logo/dark.png" : "/logo/light.png"}
        alt="Brand logo"
        width={160}
        height={42}
        priority
        className={imageClassName}
      />
    </Link>
  );
}
