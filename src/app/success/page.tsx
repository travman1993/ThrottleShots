"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/lib/cart";

interface Download {
  id: string;
  url: string;
  thumbnail_url: string;
  vehicle_type: string;
  color: string;
}

function SuccessContent() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [loadingDownloads, setLoadingDownloads] = useState(false);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  useEffect(() => {
    if (sessionId) {
      setLoadingDownloads(true);
      fetch(`/api/downloads?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => { if (data.downloads) setDownloads(data.downloads); })
        .catch(() => {})
        .finally(() => setLoadingDownloads(false));
    }
  }, [sessionId]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-accent"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="font-display text-4xl tracking-wider text-text-primary">
          PAYMENT SUCCESSFUL
        </h1>

        <p className="mt-4 text-text-secondary">
          Thank you for your purchase! Your photos are ready.
        </p>

        {/* Download links */}
        {loadingDownloads ? (
          <div className="mt-6 rounded-xl border border-border bg-bg-card p-6">
            <p className="text-sm text-text-muted">Loading your downloads...</p>
          </div>
        ) : downloads.length > 0 ? (
          <div className="mt-6 rounded-xl border border-border bg-bg-card p-6 text-left">
            <h2 className="font-display text-sm tracking-wider text-text-secondary">
              YOUR PHOTOS
            </h2>
            <div className="mt-4 space-y-3">
              {downloads.map((d, i) => (
                <div key={d.id} className="flex items-center gap-4">
                  <img
                    src={d.thumbnail_url}
                    alt=""
                    className="h-14 w-20 flex-shrink-0 rounded-lg object-cover"
                  />
                  <p className="flex-1 text-sm capitalize text-text-primary">
                    {d.color ? `${d.color} ` : ""}{d.vehicle_type}
                  </p>
                  <a
                    href={d.url}
                    download={`throttleshots-photo-${i + 1}.jpg`}
                    className="rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent-hover"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* What happens next */}
        <div className="mt-6 rounded-xl border border-border bg-bg-card p-6 text-left">
          <h2 className="font-display text-sm tracking-wider text-text-secondary">
            WHAT HAPPENS NEXT
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-text-secondary">
            {downloads.length > 0 ? (
              <>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-accent">→</span>
                  Download links above are valid for 24 hours.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-accent">→</span>
                  A copy has also been sent to your email as a backup.
                </li>
              </>
            ) : (
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-accent">→</span>
                You will receive an email with download links for your
                full-resolution photos.
              </li>
            )}
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-accent">→</span>
              Lost your email?{" "}
              <a href="/resend" className="text-accent underline hover:text-accent-hover">
                Resend my download links
              </a>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-accent">→</span>
              Other issues? Contact us at{" "}
              <a
                href="mailto:hello@throttleshotsmedia.com"
                className="text-accent underline hover:text-accent-hover"
              >
                hello@throttleshotsmedia.com
              </a>
            </li>
          </ul>
        </div>

        <Link
          href="/"
          className="mt-8 inline-block rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          Browse More Photos
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
