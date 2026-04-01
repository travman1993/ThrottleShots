"use client";

import { useState } from "react";
import Link from "next/link";

export default function ResendDownloadsPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/resend-downloads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      } else {
        setStatus("success");
        setMessage(`Done — we sent ${data.count} download link${data.count !== 1 ? "s" : ""} to ${email}. Check your inbox (and spam folder).`);
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="text-sm text-text-muted transition-colors hover:text-text-secondary"
        >
          ← Back
        </Link>

        <h1 className="mt-6 font-display text-4xl tracking-wider text-text-primary">
          RESEND DOWNLOADS
        </h1>
        <p className="mt-3 text-text-secondary">
          Lost your download email? Enter the address you used at checkout and
          we&apos;ll send fresh links right away.
        </p>

        {status === "success" ? (
          <div className="mt-8 rounded-xl border border-border bg-bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent/10">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-sm text-text-secondary">{message}</p>
            </div>
            <button
              onClick={() => { setStatus("idle"); setEmail(""); setMessage(""); }}
              className="mt-4 text-xs text-text-muted hover:text-text-secondary"
            >
              Try a different email →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8">
            <label className="mb-2 block text-xs text-text-muted">
              Email address used at checkout
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent"
            />
            {status === "error" && (
              <p className="mt-2 text-sm text-red-400">{message}</p>
            )}
            <button
              type="submit"
              disabled={status === "loading" || !email}
              className={`mt-4 w-full rounded-lg py-3 text-sm font-semibold transition-colors ${
                status === "loading" || !email
                  ? "bg-bg-elevated text-text-muted cursor-not-allowed"
                  : "bg-accent text-white hover:bg-accent-hover"
              }`}
            >
              {status === "loading" ? "Sending..." : "Send My Download Links"}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-xs text-text-muted">
          Still having trouble?{" "}
          <a
            href="mailto:hello@throttleshotsmedia.com"
            className="text-accent hover:text-accent-hover"
          >
            Contact us
          </a>
        </p>
      </div>
    </div>
  );
}
