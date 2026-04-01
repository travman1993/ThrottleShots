import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { Providers } from "@/components/Providers";
import { CartIconClient } from "@/components/CartIconClient";
import { Footer } from "@/components/Footer";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://throttleshotsmedia.com"),
  title: "ThrottleShots — Automotive Event Photography",
  description:
    "Find and purchase photos of your vehicle from Tail of the Dragon, car meets, bike nights, track days, and more.",
  openGraph: {
    title: "ThrottleShots — Automotive Event Photography",
    description:
      "Find and purchase photos of your vehicle from Tail of the Dragon, car meets, bike nights, track days, and more.",
    url: "https://throttleshotsmedia.com",
    siteName: "ThrottleShots",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ThrottleShots — Automotive Event Photography",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ThrottleShots — Automotive Event Photography",
    description:
      "Find and purchase photos of your vehicle from Tail of the Dragon, car meets, bike nights, track days, and more.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const isAdmin = cookieStore.get("admin_auth")?.value === "true";

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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-EE2QJKJGND"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-EE2QJKJGND');
          `}
        </Script>
        <Providers>
          <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-bg/80 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center">
                  <Image
                    src="/logo-horizontal.png"
                    alt="ThrottleShots"
                    width={180}
                    height={40}
                    className="h-8 w-auto object-contain"
                    priority
                  />
                </Link>
                <div className="flex items-center gap-6">
                  <CartIconClient />
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="rounded-md bg-bg-elevated px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
                    >
                      Admin
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </nav>
          <main className="pt-16">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}