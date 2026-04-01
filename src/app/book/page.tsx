"use client";

import { useState } from "react";
import Link from "next/link";

const SHOOT_TYPES = [
  "Event Coverage",
  "Private Vehicle Shoot",
  "Track Day",
  "Bike Night",
  "Car Meet",
  "Portrait / Lifestyle",
  "Other",
];

export default function BookPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    shoot_type: "",
    date: "",
    location: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong.");
        setStatus("error");
      } else {
        setStatus("success");
      }
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="font-display text-4xl tracking-wider text-text-primary">
            REQUEST SENT
          </h1>
          <p className="mt-4 text-text-secondary">
            Got it, {form.name.split(" ")[0]}. We&apos;ll be in touch at{" "}
            <span className="text-text-primary">{form.email}</span> shortly.
          </p>
          <Link
            href="/"
            className="mt-8 inline-block rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-hover"
          >
            Back to ThrottleShots
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <Link href="/" className="text-sm text-text-muted transition-colors hover:text-text-secondary">
        ← Back
      </Link>

      <h1 className="mt-6 font-display text-4xl tracking-wider text-text-primary sm:text-5xl">
        BOOK A SHOOT
      </h1>
      <p className="mt-3 text-text-secondary">
        Private sessions, dedicated event coverage, track days, and more.
        Fill out the form and we&apos;ll get back to you within 24 hours.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs text-text-muted">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
              placeholder="Your name"
              className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs text-text-muted">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs text-text-muted">Phone (optional)</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="(555) 000-0000"
              className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs text-text-muted">Type of Shoot *</label>
            <select
              value={form.shoot_type}
              onChange={(e) => set("shoot_type", e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent"
            >
              <option value="">Select...</option>
              {SHOOT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs text-text-muted">Preferred Date / Timeframe</label>
            <input
              type="text"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              placeholder="e.g. June weekends, ASAP"
              className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs text-text-muted">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="City, track name, etc."
              className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs text-text-muted">Additional Details</label>
          <textarea
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            rows={4}
            placeholder="Tell us about your vehicle, the event, what you're looking for..."
            className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent resize-none"
          />
        </div>

        {status === "error" && (
          <p className="text-sm text-red-400">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className={`w-full rounded-lg py-3 text-sm font-semibold transition-colors ${
            status === "loading"
              ? "bg-bg-elevated text-text-muted cursor-not-allowed"
              : "bg-accent text-white hover:bg-accent-hover"
          }`}
        >
          {status === "loading" ? "Sending..." : "Send Request"}
        </button>
      </form>
    </div>
  );
}
