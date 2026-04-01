import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <Image
              src="/logo-horizontal.png"
              alt="ThrottleShots"
              width={160}
              height={36}
              className="h-8 w-auto object-contain"
            />
            <p className="mt-3 text-sm text-text-muted leading-relaxed">
              Event photography for car meets, bike nights, track days, and
              everything in between.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-semibold tracking-wider text-text-secondary uppercase">
              Help
            </p>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-text-muted transition-colors hover:text-text-primary"
                >
                  FAQ &amp; How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/resend"
                  className="text-sm text-text-muted transition-colors hover:text-text-primary"
                >
                  Resend My Downloads
                </Link>
              </li>
              <li>
                <a
                  href="mailto:hello@throttleshotsmedia.com"
                  className="text-sm text-text-muted transition-colors hover:text-text-primary"
                >
                  hello@throttleshotsmedia.com
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <p className="text-xs font-semibold tracking-wider text-text-secondary uppercase">
              Follow Along
            </p>
            <div className="mt-4 flex gap-4">
              <a
                href="https://instagram.com/throttleshotsmedia"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-text-muted transition-colors hover:border-accent/50 hover:text-accent"
                aria-label="Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                </svg>
              </a>
              <a
                href="https://facebook.com/throttleshotsmedia"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-text-muted transition-colors hover:border-accent/50 hover:text-accent"
                aria-label="Facebook"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} ThrottleShots Media. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
