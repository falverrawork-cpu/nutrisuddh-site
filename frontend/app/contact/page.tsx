"use client";

import { FormEvent, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useUIStore } from "@/stores/ui-store";

export default function ContactPage() {
  const addToast = useUIStore((state) => state.addToast);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim()) {
      addToast("Name is required.", "info");
      return;
    }
    if (!form.email.trim()) {
      addToast("Email is required.", "info");
      return;
    }
    if (!form.message.trim()) {
      addToast("Message is required.", "info");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiFetch<{ ok: true }>("/api/forms/contact", {
        method: "POST",
        body: JSON.stringify(form)
      });
      addToast("Your enquiry has been submitted.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Unable to submit enquiry.", "info");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-base py-12">
      <h1 className="font-display text-4xl">Contact</h1>
      <p className="mt-3 text-sm text-gray-600">
        Reach us for order support, wholesale partnerships, and bulk makhana enquiries.
      </p>

      <form className="card-surface mt-8 grid gap-3 p-6 sm:grid-cols-2" onSubmit={onSubmit}>
        <input
          className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm"
          placeholder="Full name"
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          required
        />
        <input
          className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          required
        />
        <input
          className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm"
          placeholder="Phone"
          value={form.phone}
          onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
        />
        <input
          className="focus-ring rounded-lg border border-stone px-3 py-2 text-sm"
          placeholder="Subject"
          value={form.subject}
          onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
        />
        <textarea
          className="focus-ring min-h-36 rounded-lg border border-stone px-3 py-2 text-sm sm:col-span-2"
          placeholder="Message"
          value={form.message}
          onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
          required
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="focus-ring rounded-full bg-pine px-5 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2 sm:w-fit"
        >
          {isSubmitting ? "Sending..." : "Send Enquiry"}
        </button>
      </form>
    </div>
  );
}
