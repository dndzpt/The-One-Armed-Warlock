"use client";

import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export function usePatronNavigationLabel() {
  const [label, setLabel] = useState("Join");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setLabel(data.session ? "My Ledger" : "Join");
      if (data.session) void supabase.rpc("claim_daily_allowance");
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setLabel(session ? "My Ledger" : "Join");
      if (session) void supabase.rpc("claim_daily_allowance");
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return label;
}

type PatronNavigationLinkProps = {
  className?: string;
  signedOutLabel?: string;
};

export default function PatronNavigationLink({
  className,
  signedOutLabel = "Join",
}: PatronNavigationLinkProps = {}) {
  const label = usePatronNavigationLabel();
  return <a className={className} href="/patrons">{label === "My Ledger" ? label : signedOutLabel}</a>;
}
