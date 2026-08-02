import type { Metadata } from "next";
import Link from "next/link";
import PatronAuth from "./patron-auth";
import PatronIntro from "./patron-intro";
import "./patrons.css";

export const metadata: Metadata = {
  title: "Patron Ledger | The One-Armed Warlock",
  description: "Create or enter your patron account at The One-Armed Warlock.",
};

export default function PatronsPage() {
  return (
    <main className="patrons-page">
      <header className="patrons-header">
        <Link className="patrons-brand" href="/tavern">
          <img src="/oaw-logo.png" alt="" />
          <span>The One-Armed Warlock</span>
        </Link>
        <Link className="back-to-tavern" href="/tavern">Return to the tavern</Link>
      </header>

      <PatronIntro />

      <PatronAuth />
    </main>
  );
}
