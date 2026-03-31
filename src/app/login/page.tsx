"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/admin");
      } else {
        setError("Wrong password.");
      }
    } catch (err) {
      setError("Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <h1 className="font-display text-3xl tracking-wider text-text-primary">
            <span className="text-accent">THROTTLE</span>SHOTS
          </h1>
          <p className="mt-2 text-sm text-text-secondary">Admin Access</p>
        </div>

        <form onSubmit={handleLogin} className="mt-8">
          <div>
            <label className="mb-2 block text-xs text-text-muted">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full rounded-lg border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent"
              autoFocus
            />
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className={`mt-6 w-full rounded-lg py-3 text-sm font-semibold text-white transition-colors ${
              loading || !password
                ? "bg-bg-elevated text-text-muted cursor-not-allowed"
                : "bg-accent hover:bg-accent-hover"
            }`}
          >
            {loading ? "Checking..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}