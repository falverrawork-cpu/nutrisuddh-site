import { Suspense } from "react";
import { OrdersView } from "@/app/orders/orders-view";
import { PageLoader } from "@/components/common/page-loader";

export default function OrdersPage() {
  return (
    <div className="container-base py-10">
      <Suspense fallback={<PageLoader message="Loading orders..." compact />}>
        <OrdersView />
      </Suspense>
    </div>
  );
}
