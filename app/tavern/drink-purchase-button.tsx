"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type PurchaseResult = { balance: number; tavern_message: string };

export default function DrinkPurchaseButton({ drinkId }: { drinkId: number }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, []);

  async function purchase() {
    setBusy(true); setMessage(""); setIsError(false);
    const { data, error } = await supabase.rpc("purchase_drink", { p_drink_id: drinkId, p_quantity: 1 });
    setBusy(false);
    if (error) {
      setIsError(true);
      setMessage(error.message.includes("Not enough Copper Coins")
        ? "Yerma taps the ledger: you need a few more Copper Coins for that pour."
        : "The order slipped off the ledger. Yerma asks you to try again.");
      return;
    }
    const result = (data?.[0] || null) as PurchaseResult | null;
    setMessage(result ? `${result.tavern_message} ${result.balance} Copper Coins remain.` : "Yerma has entered your order.");
  }

  if (!ready) return <span className="purchase-placeholder">Checking the ledger…</span>;
  if (!session) return <a className="drink-order-link" href="/patrons">Sign in to order</a>;

  return <div className="drink-purchase">
    <button onClick={purchase} disabled={busy}>{busy ? "Yerma is pouring…" : "Order this drink"}</button>
    {message && <p className={isError ? "purchase-message error" : "purchase-message"} role="status">{message}</p>}
  </div>;
}
