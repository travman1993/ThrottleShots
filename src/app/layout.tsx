import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { CartIconClient } from "@/components/CartIconClient";
import "./globals.css";

export const metadata: Metadata = {
  title: "ThrottleShots — Automotive Event Photography",
  description:
    "Find and purchase photos of your vehicle from Tail of the Dragon, car meets, bike nights, track days, and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-body">
        <Providers>
          <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-bg/80 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <a href="/" className="flex items-center">
                  <span className="font-display text-2xl tracking-wider text-accent">
                    THROTTLE
                  </span>
                  <span className="font-display text-2xl tracking-wider text-text-primary">
                    SHOTS
                  </span>
                </a>
                <div className="flex items-center gap-6">
                  <CartIconClient />
                  <a
                     href="/admin"
                    className="rounded-md bg-bg-elevated px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
                  >
                    Admin
                  </a>
                </div>
              </div>
            </div>
          </nav>
          <main className="pt-16">{children}</main>
        </Providers>
      </body>
    </html>
  );
}