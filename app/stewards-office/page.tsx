import type { Metadata } from "next";
import Link from "next/link";
import StewardsDashboard from "./stewards-dashboard";
import "./stewards-office.css";

export const metadata: Metadata = {
  title: "The Steward’s Office | The One-Armed Warlock",
  description: "Private administrative records for The One-Armed Warlock.",
  robots: { index: false, follow: false },
};

export default function StewardsOfficePage() {
  return (
    <main className="stewards-page">
      <header className="stewards-header">
        <Link className="stewards-brand" href="/">
          <img src="/oaw-logo.png" alt="" />
          <span>The One-Armed Warlock</span>
        </Link>
        <Link href="/patrons">Patron Ledger</Link>
      </header>
      <StewardsDashboard />
    </main>
  );
}
