import { useParams } from "react-router-dom";
import { CollectionListing } from "@/components/collection/collection-listing";
import NotFound from "@/app/not-found";
import { collections } from "@/data/collections";
import { getCollectionProducts } from "@/lib/catalog";

export function CollectionPage() {
  const { handle = "" } = useParams();
  const collection = collections.find((item) => item.handle === handle);

  if (!collection) {
    return <NotFound />;
  }

  const collectionProducts = getCollectionProducts(handle);

  return (
    <div className="py-10">
      <div className="container-base">
        <h1 className="font-display text-4xl">{collection.title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600">{collection.description}</p>
      </div>
      <CollectionListing products={collectionProducts} />
    </div>
  );
}
