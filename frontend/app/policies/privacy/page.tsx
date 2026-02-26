
export default function PrivacyPolicyPage() {
  return (
    <div className="container-base py-12">
      <h1 className="font-display text-4xl">Privacy Policy</h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-700">
        We value your privacy and handle personal information only for order processing, customer support, and service
        improvement.
      </p>

      <div className="mt-8 space-y-7 text-sm leading-7 text-gray-700">
        <section>
          <h2 className="text-lg font-semibold text-ink">Information We Collect</h2>
          <p className="mt-2">
            We may collect your name, phone number, email, shipping address, payment/order details, and communication
            history when you place an order or contact us.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">How We Use Information</h2>
          <p className="mt-2">
            Your data is used to process and deliver orders, send transaction and shipping updates, provide support,
            and improve product and service quality.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">Data Sharing</h2>
          <p className="mt-2">
            We share only necessary information with payment gateways, logistics partners, and technology providers for
            order fulfillment and platform operations. We do not sell personal data.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">Data Security and Retention</h2>
          <p className="mt-2">
            We use reasonable administrative and technical safeguards to protect your information. Data is retained only
            for legal, operational, and compliance requirements.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">Your Rights</h2>
          <p className="mt-2">
            You may request correction or deletion of your personal information, subject to legal obligations, by
            contacting us through the Contact page.
          </p>
        </section>
      </div>
    </div>
  );
}
