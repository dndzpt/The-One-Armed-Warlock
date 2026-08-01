import type { Metadata } from "next";
import Link from "next/link";
import PatronAuth from "./patron-auth";
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

      <section className="patrons-intro">
        <p className="patrons-kicker">The Patron Ledger</p>
        <h1>Your chair is waiting.</h1>
        <p>Create a patron account to join the ledger. Yerma will send a verification code to make certain the raven found the right door.</p>
        <div className="ledger-note"><span>House promise</span> Your password is handled securely by our account provider. Yerma never sees it.</div>
      </section>

      <PatronAuth />
    </main>
  );
}
