import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Cormorant_Garamond, Source_Sans_3 } from 'next/font/google';
import './globals.css';

const display = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
});

const bodyFont = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://qa.annavital.com'),
  title: {
    default: 'Anna Vital',
    template: '%s | Anna Vital',
  },
  description: 'Artist and design portfolio for Anna Vital.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className={`${display.variable} ${bodyFont.variable}`}>
        <div className="min-h-screen">
          <header className="border-b border-line/80">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
              <Link href="/" className="font-display text-2xl tracking-wide transition hover:opacity-70">
                Anna Vital
              </Link>
              <Link href="/about" className="text-sm text-ink/70 transition hover:text-ink">
                About
              </Link>
            </div>
          </header>
          <main>{children}</main>
          <footer className="border-t border-line/80">
            <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-sm text-ink/55 sm:flex-row sm:items-center sm:justify-between">
              <p>Artist portfolio for Anna Vital.</p>
              <p>QA deploy target: qa.annavital.com</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
