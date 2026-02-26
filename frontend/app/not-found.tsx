import Link from "@/components/common/app-link";

export default function NotFound() {
  return (
    <div className="container-base py-20 text-center">
      <h1 className="font-display text-5xl">404</h1>
      <p className="mt-3 text-sm text-gray-600">The page you requested does not exist.</p>
      <Link href="/" className="focus-ring mt-5 inline-block rounded-full bg-pine px-5 py-2 text-sm text-white">
        Back to home
      </Link>
    </div>
  );
}
