import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ & How It Works — ThrottleShots",
  description:
    "Answers to common questions about finding your photos, downloading, pricing, and more.",
};

const faqs = [
  {
    q: "How do I find my vehicle?",
    a: "Browse by category (Bike Nights, Tail of the Dragon, Car Meets, etc.), then select the event date from the calendar. Use the vehicle type and color filters to narrow down the photos.",
  },
  {
    q: "How does pricing work?",
    a: "Photos are $9.99 each. If you buy 3 or more, the price drops to $19.99 for 3 or $29.99 for 5. The discount applies automatically in your cart — no code needed.",
  },
  {
    q: "What do I get after I purchase?",
    a: "You'll receive an email with download links for your full-resolution, watermark-free photos. Links are also shown immediately on the confirmation page after checkout.",
  },
  {
    q: "How long do the download links last?",
    a: "Download links expire 24 hours after purchase. Make sure to download your photos promptly. If your links expire, use the Resend My Downloads page to get fresh ones.",
  },
  {
    q: "What resolution and format are the photos?",
    a: "All photos are delivered as full-resolution JPEGs, exactly as shot. No compression, no resizing.",
  },
  {
    q: "Can I print the photos?",
    a: "Yes — the full-resolution files are suitable for large-format printing. You receive personal use rights, which includes printing for yourself.",
  },
  {
    q: "I lost my download email. What do I do?",
    a: "Head to the Resend My Downloads page, enter the email address you used at checkout, and we'll send fresh links right away.",
  },
  {
    q: "How long are event photos available?",
    a: "Photos are available for 60 days after the event. After that they are removed from the site to free up storage.",
  },
  {
    q: "My vehicle isn't in the photos. What happened?",
    a: "Not every vehicle at every event gets photographed. If you can't find your shot, feel free to reach out — if we have it we'll make sure it's posted.",
  },
  {
    q: "What's your refund policy?",
    a: "Because downloads are digital files, all sales are final. If you have a technical issue with your download, contact us and we'll make it right.",
  },
  {
    q: "How do I contact you?",
    a: "Email us at hello@throttleshotsmedia.com. We typically respond within 24 hours.",
  },
];

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link
        href="/"
        className="text-sm text-text-muted transition-colors hover:text-text-secondary"
      >
        ← Back
      </Link>

      <h1 className="mt-6 font-display text-4xl tracking-wider text-text-primary sm:text-5xl">
        FAQ
      </h1>
      <p className="mt-3 text-text-secondary">
        Everything you need to know about finding and purchasing your photos.
      </p>

      <div className="mt-12 space-y-6">
        {faqs.map((item, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-bg-card p-6"
          >
            <h2 className="font-display text-lg tracking-wide text-text-primary">
              {item.q}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {item.a}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-xl border border-border bg-bg-card p-6 text-center">
        <p className="text-sm text-text-secondary">
          Still have a question?{" "}
          <a
            href="mailto:hello@throttleshotsmedia.com"
            className="text-accent hover:text-accent-hover"
          >
            hello@throttleshotsmedia.com
          </a>
        </p>
      </div>
    </div>
  );
}
