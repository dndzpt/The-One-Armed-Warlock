"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { drinkQuotes, enjoymentLabels } from "./drink-quotes";

type PurchaseResult = { balance: number; tavern_message: string };
type AllowanceResult = { balance: number; awarded: boolean; amount: number };
const UNLIMITED_COPPER = 2147483647;

function randomItem<T>(items: T[]): T {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return items[values[0] % items.length];
}

export default function DrinkPurchaseButton({ drinkId, drinkName, price }: { drinkId: number; drinkName: string; price: number }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [yermaQuote, setYermaQuote] = useState("");
  const [enjoymentLabel, setEnjoymentLabel] = useState("");
  const [confirmationBalance, setConfirmationBalance] = useState<number | null>(null);
  const [checkingBalance, setCheckingBalance] = useState(false);

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

  async function selectDrink() {
    setCheckingBalance(true); setMessage(""); setIsError(false);
    const { data, error } = await supabase.rpc("claim_daily_allowance");
    setCheckingBalance(false);
    if (error) {
      setIsError(true);
      setMessage("Yerma cannot open your coin purse just now. Please try again.");
      return;
    }
    const result = (data?.[0] || null) as AllowanceResult | null;
    setConfirmationBalance(result?.balance ?? 0);
  }

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
    setMessage(result
      ? result.balance === UNLIMITED_COPPER ? "Unlimited Copper Coins remain." : `${result.balance} Copper Coins remain.`
      : "Yerma has entered your order.");
    setConfirmationBalance(null);
    setYermaQuote(randomItem(drinkQuotes[drinkId]));
    setEnjoymentLabel(randomItem(enjoymentLabels));
  }

  if (!ready) return <span className="purchase-placeholder">Checking the ledger…</span>;
  if (!session) return <a className="drink-order-link" href="/patrons">Sign in to order</a>;

  const isUnlimited = confirmationBalance === UNLIMITED_COPPER;
  const projectedBalance = confirmationBalance === null || isUnlimited ? null : confirmationBalance - price;
  const canAfford = isUnlimited || (projectedBalance !== null && projectedBalance >= 0);

  return <>
    <div className="drink-purchase">
      {confirmationBalance === null
        ? <button onClick={selectDrink} disabled={busy || checkingBalance}>{checkingBalance ? "Checking your purse…" : "Select this drink"}</button>
        : <div className="order-confirmation">
            <p>{isUnlimited
              ? "Your testing purse is unlimited."
              : canAfford
                ? `After this order, ${projectedBalance} Copper Coins will remain.`
                : `You have ${confirmationBalance} Copper Coins and need ${Math.abs(projectedBalance || 0)} more.`}</p>
            <div>
              <button className="confirm-order" onClick={purchase} disabled={busy || !canAfford}>{busy ? "Yerma is pouring…" : "Confirm order"}</button>
              <button className="cancel-order" onClick={() => setConfirmationBalance(null)} disabled={busy}>Cancel</button>
            </div>
          </div>}
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
