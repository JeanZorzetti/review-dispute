import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'ReviewShield — Remove fake Google reviews, pay only when they come down',
  description:
    'We remove policy-violating Google reviews for contractors. Fake, competitor, and off-topic reviews disputed and removed. You only pay when one comes down.',
  openGraph: {
    title: 'ReviewShield — Stop losing jobs to fake reviews',
    description: 'Policy-violating Google reviews removed. Pay only on removal.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
