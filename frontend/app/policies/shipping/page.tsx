
export default function ShippingPolicyPage() {
  return (
    <div className="container-base py-12">
      <h1 className="font-display text-4xl">Shipping Policy</h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-700">
        This policy outlines order processing, dispatch, and delivery terms for Nutri Suddh.
      </p>

      <div className="mt-8 space-y-7 text-sm leading-7 text-gray-700">
        <section>
          <h2 className="text-lg font-semibold text-ink">Dispatch Timeline</h2>
          <p className="mt-2">
            Orders are usually dispatched within 2-4 working days after payment confirmation. During peak periods,
            dispatch may take longer.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">Delivery Coverage</h2>
          <p className="mt-2">
            We deliver across serviceable pin codes in India. Delivery timelines vary by location, courier network, and
            local conditions.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">Shipping Charges</h2>
          <p className="mt-2">
            Shipping charges, if applicable, are shown at checkout before payment.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">Delivery Attempts and Delays</h2>
          <p className="mt-2">
            Couriers may make multiple delivery attempts. Delays can occur due to weather, strikes, transport
            disruptions, or other events outside our control.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">Order Tracking and Support</h2>
          <p className="mt-2">
            Tracking details are shared after dispatch. For support, contact us with your order details.
          </p>
        </section>
      </div>
    </div>
  );
}
