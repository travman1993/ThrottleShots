import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — ThrottleShots",
  description: "Terms of service for ThrottleShots automotive event photography.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="mb-2 font-display text-4xl text-text-primary">Terms of Service</h1>
      <p className="mb-10 text-sm text-text-muted">Last updated: April 1, 2025</p>

      <div className="space-y-8 text-text-secondary leading-relaxed">
        <section>
          <h2 className="mb-3 text-xl font-semibold text-text-primary">1. Digital Goods — All Sales Final</h2>
          <p>
            All purchases on ThrottleShots are for digital photograph files. Because digital goods are
            delivered immediately upon payment, <strong>all sales are final and non-refundable</strong>.
            If you experience a technical issue preventing download, contact us within 7 days of purchase
            and we will resolve it.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-text-primary">2. Download Links &amp; Expiry</h2>
          <p>
            Download links are sent to the email address provided at checkout and are valid for{" "}
            <strong>24 hours</strong> from the time of purchase. If your links expire, use the{" "}
            <a href="/resend" className="text-accent underline">Resend Downloads</a> page to request
            new links at no additional charge, provided the photos are still within the 60-day retention
            window.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-text-primary">3. License — Personal Use</h2>
          <p>
            Purchasing a photo grants you a <strong>non-exclusive, non-transferable personal use license</strong>.
            You may print, share on personal social media, and use the photos for personal purposes.
            You may <strong>not</strong>:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Sell or sublicense the photos to any third party.</li>
            <li>Use the photos for commercial advertising without written permission.</li>
            <li>Remove or obscure any watermarks on preview images.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-text-primary">4. Photo Availability</h2>
          <p>
            Photos are available for purchase for approximately <strong>60 days</strong> after the event
            date. After this window, photos may be permanently removed from our servers. ThrottleShots
            is not obligated to retain photos beyond this period.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-text-primary">5. Intellectual Property</h2>
          <p>
            All photographs on ThrottleShots are the intellectual property of ThrottleShots and its
            photographers. Copyright is retained by ThrottleShots. Purchase of a photo does not transfer
            copyright.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-text-primary">6. Booking Inquiries</h2>
          <p>
            Submitting a booking inquiry through our site does not constitute a confirmed booking or
            guarantee of services. A booking is only confirmed upon written agreement and receipt of any
            required deposit.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-text-primary">7. Limitation of Liability</h2>
          <p>
            ThrottleShots shall not be liable for any indirect, incidental, or consequential damages
            arising from the use or inability to use our services. Our maximum liability is limited to
            the amount paid for the specific photo(s) in question.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-text-primary">8. Changes to These Terms</h2>
          <p>
            We may update these terms at any time. Continued use of the site after changes constitutes
            acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-text-primary">9. Contact</h2>
          <p>
            Questions? Email us at{" "}
            <a href="mailto:hello@throttleshotsmedia.com" className="text-accent underline">
              hello@throttleshotsmedia.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
