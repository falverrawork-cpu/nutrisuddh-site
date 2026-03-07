"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { bulkSection } from "@/data/homepage";
import { apiFetch } from "@/lib/api";
import { getMediaUrl } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

export function BulkSection() {
  const location = useLocation();
  const addToast = useUIStore((state) => state.addToast);
  const [open, setOpen] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    country: "",
    quantity: "",
    message: ""
  });

  useEffect(() => {
    if (location.hash === "#bulk-quote") {
      setOpen(true);
    }
  }, [location.hash]);

  return (
    <section id="bulk-quote" className="container-base mt-14">
      <div className="group relative overflow-hidden rounded-3xl border border-emerald-200 p-8 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-24px_rgba(11,110,79,0.55)] sm:p-10">
        <div
          className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-110"
          style={{ backgroundImage: "url('https://ik.imagekit.io/Falverra/bulk.png?updatedAt=1772868772034')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/45 to-black/25 transition duration-500 group-hover:from-black/55 group-hover:via-black/35" aria-hidden="true" />

        <p className="relative z-10 text-xs uppercase tracking-[0.2em] text-white/90 transition duration-500 group-hover:translate-x-1">Bulk Orders</p>
        <h2 className="relative z-10 mt-2 font-display text-3xl text-white transition duration-500 group-hover:translate-x-1">{bulkSection.title}</h2>
        <p className="relative z-10 mt-3 max-w-3xl text-sm text-white/90 transition duration-500 group-hover:translate-x-1 sm:text-base">{bulkSection.copy}</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="focus-ring relative z-10 mt-6 rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-emerald-800 group-hover:-translate-y-0.5 group-hover:shadow-lg"
        >
          {bulkSection.ctaLabel}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-2xl">Wholesale & Bulk Enquiry</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="focus-ring rounded-full border border-stone p-2"
                aria-label="Close bulk form"
              >
                <X size={16} />
              </button>
            </div>
            <form
              className="grid gap-3 sm:grid-cols-2"
              onSubmit={async (event) => {
                event.preventDefault();
                setIsSubmitting(true);
                try {
                  await apiFetch<{ ok: true }>("/api/forms/bulk", {
                    method: "POST",
                    body: JSON.stringify(form)
                  });
                  setForm({
                    name: "",
                    company: "",
                    email: "",
                    phone: "",
                    country: "",
                    quantity: "",
                    message: ""
                  });
                  setOpen(false);
                  setShowSuccessPopup(true);
                } catch (error) {
                  addToast(error instanceof Error ? error.message : "Unable to submit enquiry.", "info");
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              <input required placeholder="Full name" className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              <input required placeholder="Company / Business" className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm" value={form.company} onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))} />
              <input required type="email" placeholder="Business email" className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
              <input required placeholder="Phone" className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
              <input placeholder="Country" className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm" value={form.country} onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))} />
              <input placeholder="Approx quantity requirement" className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm" value={form.quantity} onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))} />
              <textarea placeholder="Wholesale / bulk requirements" className="focus-ring min-h-28 rounded-lg border border-stone px-3 py-2 text-sm sm:col-span-2" value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} />
              <button
                type="submit"
                disabled={isSubmitting}
                className="focus-ring rounded-full bg-pine px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2 sm:w-fit"
              >
                {isSubmitting ? "Sending..." : "Send Enquiry"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showSuccessPopup && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-card">
            <h3 className="font-display text-2xl text-ink">Thank You</h3>
            <p className="mt-3 text-sm text-gray-700">
              Thank you for your request! Our Team will contact you within 24-48 hours.
            </p>
            <button
              type="button"
              onClick={() => setShowSuccessPopup(false)}
              className="focus-ring mt-5 rounded-full bg-pine px-5 py-2 text-sm font-semibold text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
