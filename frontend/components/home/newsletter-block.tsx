export function NewsletterBlock() {
  return (
    <section className="container-base mt-14">
      <div className="rounded-3xl border border-stone bg-gradient-to-br from-white to-sand p-8 text-center sm:p-10">
        <p className="text-xs uppercase tracking-[0.2em] text-pine">Newsletter</p>
        <h2 className="mt-2 font-display text-3xl">Get Smart Snacking Updates</h2>
        <p className="mt-3 text-sm text-gray-600">
          Receive placeholder offers, launch alerts, and healthy snacking tips in your inbox.
        </p>
        <form className="mx-auto mt-5 flex max-w-xl flex-col gap-3 sm:flex-row">
          <input
            type="email"
            aria-label="Newsletter email"
            placeholder="Enter your email"
            className="focus-ring h-11 flex-1 rounded-full border border-stone px-4 text-sm"
          />
          <button type="button" className="focus-ring h-11 rounded-full bg-pine px-5 text-sm font-semibold text-white">
            Join now
          </button>
        </form>
      </div>
    </section>
  );
}
