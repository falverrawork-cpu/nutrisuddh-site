import { CartView } from "@/app/cart/cart-view";

export default function CartPage() {
  return (
    <div className="container-base py-10">
      <h1 className="font-display text-4xl">Cart</h1>
      <CartView />
    </div>
  );
}
