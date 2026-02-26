
export default function ContactPage() {
  return (
    <div className="container-base py-12">
      <h1 className="font-display text-4xl">Contact</h1>
      <p className="mt-3 text-sm text-gray-600">
        Reach us for order support, wholesale partnerships, and bulk makhana enquiries.
      </p>

      <form className="card-surface mt-8 grid gap-3 p-6 sm:grid-cols-2">
        <input className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm" placeholder="Full name" />
        <input className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm" placeholder="Email" type="email" />
        <input className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm sm:col-span-2" placeholder="Subject (Retail / Wholesale / Bulk)" />
        <textarea className="focus-ring min-h-36 rounded-lg border border-stone px-3 py-2 text-sm sm:col-span-2" placeholder="Message" />
        <button type="button" className="focus-ring rounded-full bg-pine px-5 py-2 text-sm text-white sm:col-span-2 sm:w-fit">
          Send Enquiry
        </button>
      </form>
    </div>
  );
}
