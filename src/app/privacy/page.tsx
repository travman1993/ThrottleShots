import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — ThrottleShots",
  description: "Privacy policy for ThrottleShots automotive event photography.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="mb-2 font-display text-4xl text-text-primary">Privacy Policy</h1>
      <p className="mb-10 text-sm text-text-muted">Last updated: April 1, 2025</p>

      <div className="space-y-8 text-text-secondary leading-relaxed">
        <section>
          <h2 className="mb-3 text-xl font-semibold text-text-primary">1. Information We Collect</h2>
          <p>
            When you make a purchase, Stripe collects your email address and payment information directly.
            ThrottleShots receives only your email address to send your download links. If you submit a
            booking inquiry or subscribe to event notifications, we collect your name, email address, and
            any additional details you provide.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-text-primary">2. How We Use Your Information</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>To deliver your purchased photo download links via email.</li>
            <li>To respond to booking inquiries and shoot requests.</li>
            <li>To notify you of new events you have opted into.</li>
            <li>To improve our site using aggregated, anonymized analytics data (Google Analytics).</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-text-primary">3. Third-Party Services</h2>
          <p className="mb-3">We use the following third-party services that may process your data:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li><strong>Stripe</strong> — payment processing. Your payment data is handled directly by Stripe and is never stored on our servers.</li>
            <li><strong>Resend</strong> — transactional email delivery of download links.</li>
            <li><strong>Supabase</strong> — secure database and file storage hosted in the United States.</li>
            <li><strong>Google Analytics</strong> — anonymized site usage analytics. You can opt out via browser extensions.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-text-primary">4. Data Retention</h2>
          <p>
            Photo files are retained for approximately 60 days after the event date, after which they may
            be removed from our servers. Purchase records are retained as required by our payment processor.
            Subscriber email addresses are retained until you request removal.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-text-primary">5. Cookies</h2>
          <p>
            We use a session cookie solely to maintain your shopping cart across pages. No tracking cookies
            are set by ThrottleShots. Google Analytics may set its own cookies in accordance with Google&apos;s
            privacy policy.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-text-primary">6. Your Rights</h2>
          <p>
            You may request deletion of your personal data at any time by emailing us at{" "}
            <a href="mailto:hello@throttleshotsmedia.com" className="text-accent underline">
              hello@throttleshotsmedia.com
            </a>
            . We will respond within 30 days.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-text-primary">7. Contact</h2>
          <p>
            Questions about this policy? Reach us at{" "}
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
