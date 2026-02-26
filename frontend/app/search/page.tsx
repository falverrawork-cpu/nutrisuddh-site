import { Suspense } from "react";
import { SearchResultsClient } from "./search-results-client";
import { PageLoader } from "@/components/common/page-loader";

export default function SearchPage() {
  return (
    <div className="container-base py-10">
      <h1 className="font-display text-4xl">Search</h1>
      <Suspense fallback={<PageLoader message="Loading search results..." compact />}>
        <SearchResultsClient />
      </Suspense>
    </div>
  );
}
