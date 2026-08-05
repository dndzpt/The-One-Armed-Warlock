import type { Metadata } from "next";
import AnalyticsConsent from "./analytics-consent";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://theonearmedwarlock.com"),
  title: "The One-Armed Warlock | Threshold",
  description: "Cross the threshold into The One-Armed Warlock Hearthall and The Tappery.",
  icons: { icon: "/oaw-logo.png", shortcut: "/oaw-logo.png" },
  openGraph: {
    title: "Welcome, Traveler | The One-Armed Warlock",
    description: "Two paths await: enter Hearthall or pull up a chair in The Tappery.",
    url: "/",
    siteName: "The One-Armed Warlock",
    images: [{ url: "/og.png", width: 1800, height: 900, alt: "The One-Armed Warlock — The Tappery is Open" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Welcome, Traveler | The One-Armed Warlock",
    description: "Two paths await: enter Hearthall or pull up a chair in The Tappery.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <AnalyticsConsent />
      </body>
    </html>
  );
}
