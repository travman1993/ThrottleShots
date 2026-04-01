"use client";

import { useState } from "react";

export function NotifyForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <p className="text-sm text-accent">
        You&apos;re in — we&apos;ll let you know when new photos drop.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        className="flex-1 rounded-lg border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
      >
        {status === "loading" ? "..." : "Notify Me"}
      </button>
      {status === "error" && (
        <p className="absolute mt-10 text-xs text-red-400">Something went wrong — try again.</p>
      )}
    </form>
  );
}
