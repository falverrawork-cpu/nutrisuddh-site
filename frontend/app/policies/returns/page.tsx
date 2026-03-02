
export default function ReturnsPolicyPage() {
  return (
    <div className="container-base py-12">
      <h1 className="font-display text-4xl">Refund & Return Policy</h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-700">
        As these are food items, returns are not allowed. Please read the refund terms below.
      </p>

      <div className="mt-8 space-y-7 text-sm leading-7 text-gray-700">
        <section>
          <h2 className="text-lg font-semibold text-ink">No Return Policy</h2>
          <p className="mt-2">
            Since our products are consumables, we do not accept product returns once delivered.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">Refund Eligibility</h2>
          <p className="mt-2">
            You are only Eligible for return if you share a video opening the box and receive a damaged/expired
            product and mail to us within 48 hours of delivery.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">Proof Requirements</h2>
          <p className="mt-2">
            The video proof should clearly show the package condition, label details, and issue (damage/expiry). Claims
            without sufficient proof may not be approved.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">Refund Processing</h2>
          <p className="mt-2">
            Once the claim is verified and approved, refund will be processed to the original payment method. Timelines
            may vary depending on the payment provider.
          </p>
        </section>
      </div>
    </div>
  );
}
