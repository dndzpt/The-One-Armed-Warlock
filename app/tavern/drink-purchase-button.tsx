"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { transportedDreamKey } from "../hearth-dream";
import { hearthDreams } from "../hearth-dreams";
import { supabase } from "../lib/supabase";
import { drinkQuotes, enjoymentLabels, hearthInterventions, hearthRestLabels, steadyHeadings, steadyResponseLabels, steadyWarnings, unfocusedHeadings } from "./drink-quotes";

type PurchaseResult = { balance: number; tavern_message: string };
type AllowanceResult = { balance: number; awarded: boolean; amount: number };
type YermaMode = "drink" | "warning" | "intervention";
const UNLIMITED_COPPER = 2147483647;
const FIVE_MINUTES_MS = 5 * 60 * 1000;
const INTERVENTION_BLUR_MS = 5000;
const FALL_ASLEEP_MS = 1700;
const awakeningLabels = ["Awaken", "Open your eyes", "Return to the firelight", "Wake by the Hearth", "Let the dream fade", "Stir from your slumber", "Return to the Hearthall", "Rise gently"];

function randomItem<T>(items: readonly T[]): T {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return items[values[0] % items.length];
}

export default function DrinkPurchaseButton({ drinkId, drinkName, price }: { drinkId: number; drinkName: string; price: number }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [yermaQuote, setYermaQuote] = useState("");
  const [enjoymentLabel, setEnjoymentLabel] = useState("");
  const [yermaMode, setYermaMode] = useState<YermaMode>("drink");
  const [yermaHeading, setYermaHeading] = useState(drinkName);
  const [interventionReady, setInterventionReady] = useState(true);
  const [transportingToHearth, setTransportingToHearth] = useState(false);
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
      if (event.key === "Escape" && (yermaMode !== "intervention" || interventionReady)) finishYermaMessage();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [interventionReady, yermaQuote, yermaMode]);

  useEffect(() => {
    if (!yermaQuote || yermaMode !== "intervention" || interventionReady) return;
    const timer = window.setTimeout(() => setInterventionReady(true), INTERVENTION_BLUR_MS);
    return () => window.clearTimeout(timer);
  }, [interventionReady, yermaMode, yermaQuote]);

  function beginHearthRest() {
    const selectedDream = randomItem(hearthDreams);
    const selectedAwakeningLabel = randomItem(awakeningLabels);
    setYermaQuote("");
    window.sessionStorage.setItem(transportedDreamKey, JSON.stringify({
      dream: selectedDream,
      awakeningPhrase: selectedAwakeningLabel,
    }));
    setTransportingToHearth(true);
    window.setTimeout(() => router.replace("/hearthall?rest=1#hearth", { scroll: false }), FALL_ASLEEP_MS);
  }

  function finishYermaMessage() {
    if (yermaMode === "intervention") beginHearthRest();
    else setYermaQuote("");
  }

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
    if (!session) return;
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

    const resetKey = `oaw-drink-window-reset:${session.user.id}`;
    const priorReset = Number(window.localStorage.getItem(resetKey) || 0);
    const windowStart = Math.max(Date.now() - FIVE_MINUTES_MS, priorReset);
    const fiveMinutesAgo = new Date(windowStart).toISOString();
    const { data: recentPurchases } = await supabase
      .from("purchases")
      .select("quantity")
      .eq("patron_id", session.user.id)
      .eq("status", "completed")
      .gte("purchased_at", fiveMinutesAgo);
    const recentDrinkCount = recentPurchases?.reduce((total, recent) => total + recent.quantity, 0) ?? 0;

    if (recentDrinkCount >= 4) {
      window.localStorage.setItem(resetKey, String(Date.now()));
      setInterventionReady(false);
      setYermaMode("intervention");
      setYermaHeading(randomItem(unfocusedHeadings));
      setYermaQuote(randomItem(hearthInterventions));
      setEnjoymentLabel(randomItem(hearthRestLabels));
    } else if (recentDrinkCount >= 3) {
      setInterventionReady(true);
      setYermaMode("warning");
      setYermaHeading(randomItem(steadyHeadings));
      setYermaQuote(randomItem(steadyWarnings));
      setEnjoymentLabel(randomItem(steadyResponseLabels));
    } else {
      setInterventionReady(true);
      setYermaMode("drink");
      setYermaHeading(drinkName);
      setYermaQuote(randomItem(drinkQuotes[drinkId]));
      setEnjoymentLabel(randomItem(enjoymentLabels));
    }
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
    {yermaQuote && <div className={`yerma-toast-backdrop${yermaMode === "intervention" ? " inebriation-backdrop" : ""}`} role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && (yermaMode !== "intervention" || interventionReady)) finishYermaMessage();
    }}>
      {yermaMode !== "intervention" || interventionReady ? <section className="yerma-toast" role="dialog" aria-modal="true" aria-labelledby={`yerma-message-${drinkId}`}>
        <button className="yerma-toast-close" onClick={finishYermaMessage} aria-label={yermaMode === "intervention" ? "Rest by the Hearth" : "Close Yerma's message"}>×</button>
        <p className="yerma-toast-kicker">{yermaMode === "intervention" ? "Hearthmother's orders" : "A word from the Hearthmother"}</p>
        <h3 id={`yerma-message-${drinkId}`}>{yermaHeading}</h3>
        <blockquote>“{yermaQuote}”</blockquote>
        <p className="yerma-toast-balance" role="status">{message}</p>
        <button className="yerma-toast-enjoy" autoFocus onClick={finishYermaMessage}>{enjoymentLabel}</button>
      </section> : <span className="inebriation-status" role="status">Your vision blurs. Yerma is beside you.</span>}
    </div>}
    {transportingToHearth ? <div className="hearth-dream-backdrop hearth-dream-transport" aria-label="You drift into sleep" /> : null}
  </>;
}
