import type { Metadata } from "next";
import { Cormorant_Garamond, Geist } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const sans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://theonearmedwarlock.com"),
  title: "The One-Armed Warlock",
  description: "The home of The One-Armed Warlock party, campaign world, and shared adventures.",
  icons: { icon: "/oaw-logo.png", shortcut: "/oaw-logo.png" },
  openGraph: {
    title: "The One-Armed Warlock",
    description: "The hearth is warm, the door is open, and Yerma is behind the bar.",
    url: "/tavern",
    siteName: "The One-Armed Warlock",
    images: [{ url: "/og.png", width: 1800, height: 900, alt: "The One-Armed Warlock — The Tavern is Open" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The One-Armed Warlock",
    description: "The hearth is warm, the door is open, and Yerma is behind the bar.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable}`}>{children}</body>
    </html>
  );
}
