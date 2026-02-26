
export default function TermsPolicyPage() {
  return (
    <div className="container-base py-12">
      <h1 className="font-display text-4xl">Terms & Conditions</h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-700">
        By using this website and placing orders, you agree to the terms below.
      </p>

      <div className="mt-8 space-y-7 text-sm leading-7 text-gray-700">
        <section>
          <h2 className="text-lg font-semibold text-ink">Product Information</h2>
          <p className="mt-2">
            We strive to keep all product descriptions, pricing, and availability accurate. Product images are
            representative and actual packaging may vary.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">Orders and Payments</h2>
          <p className="mt-2">
            Orders are confirmed only after successful payment. We reserve the right to cancel or reject orders in case
            of stock unavailability, pricing errors, suspected fraud, or compliance issues.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">Shipping and Refund Policy</h2>
          <p className="mt-2">
            Shipping timelines are covered in our Shipping Policy. As these are food products, returns are not allowed.
            Refunds are only considered for damaged or expired products when valid video proof is shared within 7 days
            of purchase, as per our Refund & Return Policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">Intellectual Property</h2>
          <p className="mt-2">
            All website content, branding, and product visuals are owned by NS Agro Overseas/Nutrisuddh or used with
            permission and may not be reproduced without authorization.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">Limitation of Liability</h2>
          <p className="mt-2">
            To the extent permitted by law, we are not liable for indirect, incidental, or consequential losses arising
            from use of the website, service interruptions, or delivery delays beyond our control.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">Updates to Terms</h2>
          <p className="mt-2">
            We may update these terms from time to time. Continued use of the website after updates constitutes
            acceptance of the revised terms.
          </p>
        </section>
      </div>
    </div>
  );
}
