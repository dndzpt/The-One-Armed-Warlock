"use client";

import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { claimPatronAllowance } from "./lib/patron-allowance";

const UNLIMITED_COPPER = 2147483647;

const welcomeMessages = [
  "Welcome back, fellow Patron. It is good to see you! Here is your share of the house coin for today. Take a seat and have a drink.",
  "There you are, Patron! The fire is warm, your chair is waiting, and today’s share of the house coin is safely in your purse.",
  "Welcome home, Patron. Yerma has set aside your daily house coin. Come in, settle down, and stay awhile.",
  "Good to see you again, Patron. Your share of today’s coin is ready—and there is always room for you by the fire.",
  "Back through the door, are you? Welcome, Patron. Yerma has added today’s house coin to your purse. The Tappery awaits.",
];

const dismissLabels = ["Take a seat", "Warm myself by the fire", "Visit the Tappery", "Thank you, Yerma"];

function randomItem<T>(items: readonly T[]) {
  const value = new Uint32Array(1);
  crypto.getRandomValues(value);
  return items[value[0] % items.length];
}

export default function DailyPatronWelcome() {
  const [message, setMessage] = useState("");
  const [dismissLabel, setDismissLabel] = useState("Take a seat");
  const [coinMessage, setCoinMessage] = useState("10 Copper Coins have been added to your purse.");

  useEffect(() => {
    let active = true;

    async function welcomePatron() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;
      const result = await claimPatronAllowance(sessionData.session.user.id).catch(() => null);
      if (!active) return;
      if (result?.welcomed && (result.awarded || result.balance === UNLIMITED_COPPER)) {
        setMessage(randomItem(welcomeMessages));
        setDismissLabel(randomItem(dismissLabels));
        setCoinMessage(result.balance === UNLIMITED_COPPER
          ? "Your house testing purse remains unlimited."
          : "10 Copper Coins have been added to your purse.");
      }
    }

    void welcomePatron();
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) window.setTimeout(() => void welcomePatron(), 0);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  if (!message) return null;

  return (
    <div className="daily-welcome-backdrop" role="presentation">
      <section className="daily-welcome-dialog" role="dialog" aria-modal="true" aria-labelledby="daily-welcome-title">
        <p>A word from the Hearthmother</p>
        <h2 id="daily-welcome-title">Welcome back.</h2>
        <blockquote>“{message}”</blockquote>
        <strong>{coinMessage}</strong>
        <button type="button" onClick={() => setMessage("")} autoFocus>{dismissLabel}</button>
      </section>
    </div>
  );
}
