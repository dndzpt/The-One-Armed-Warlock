"use client";

import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export function usePatronNavigationLabel() {
  const [label, setLabel] = useState("Join");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setLabel(data.session ? "My Ledger" : "Join"));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setLabel(session ? "My Ledger" : "Join"));
    return () => data.subscription.unsubscribe();
  }, []);

  return label;
}

export default function PatronNavigationLink() {
  const label = usePatronNavigationLabel();
  return <a href="/patrons">{label}</a>;
}
