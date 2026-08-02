"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function PatronIntro() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session)));
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <section className="patrons-intro">
      <p className="patrons-kicker">The Patron Ledger</p>
      <h1>{signedIn ? "Your seat is now reserved." : "Your chair is waiting."}</h1>
      <p>{signedIn
        ? "Thank you for becoming a Patron of The One-Armed Warlock — we look forward to sharing drinks and tales with you."
        : "Create a patron account to join the ledger. Yerma will send a verification code to make certain the raven found the right door."}</p>
      <div className="ledger-note">
        <span>{signedIn ? "House welcome" : "House promise"}</span>
        {signedIn
          ? "The hearth is warm, your place is kept, and the next tale is waiting."
          : "Your password is handled securely by our account provider. Yerma never sees it."}
      </div>
    </section>
  );
}
