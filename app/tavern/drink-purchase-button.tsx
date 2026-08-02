"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { drinkQuotes, enjoymentLabels } from "./drink-quotes";

type PurchaseResult = { balance: number; tavern_message: string };

function randomItem<T>(items: T[]): T {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return items[values[0] % items.length];
}

export default function DrinkPurchaseButton({ drinkId, drinkName }: { drinkId: number; drinkName: string }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [yermaQuote, setYermaQuote] = useState("");
  const [enjoymentLabel, setEnjoymentLabel] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!yermaQuote) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setYermaQuote("");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [yermaQuote]);

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
    setMessage(result ? `${result.balance} Copper Coins remain.` : "Yerma has entered your order.");
    setYermaQuote(randomItem(drinkQuotes[drinkId]));
    setEnjoymentLabel(randomItem(enjoymentLabels));
  }

  if (!ready) return <span className="purchase-placeholder">Checking the ledger…</span>;
  if (!session) return <a className="drink-order-link" href="/patrons">Sign in to order</a>;

  return <>
    <div className="drink-purchase">
      <button onClick={purchase} disabled={busy}>{busy ? "Yerma is pouring…" : "Order this drink"}</button>
      {message && isError && <p className="purchase-message error" role="status">{message}</p>}
    </div>
    {yermaQuote && <div className="yerma-toast-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) setYermaQuote("");
    }}>
      <section className="yerma-toast" role="dialog" aria-modal="true" aria-labelledby={`yerma-message-${drinkId}`}>
        <button className="yerma-toast-close" onClick={() => setYermaQuote("")} aria-label="Close Yerma's message">×</button>
        <p className="yerma-toast-kicker">A word from the Hearthmother</p>
        <h3 id={`yerma-message-${drinkId}`}>{drinkName}</h3>
        <blockquote>“{yermaQuote}”</blockquote>
        <p className="yerma-toast-balance" role="status">{message}</p>
        <button className="yerma-toast-enjoy" autoFocus onClick={() => setYermaQuote("")}>{enjoymentLabel}</button>
      </section>
    </div>}
  </>;
}
