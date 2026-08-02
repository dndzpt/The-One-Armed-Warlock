"use client";

import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type Profile = { id: string; display_name: string; created_at: string };
type Drink = { id: number; name: string; is_active: boolean };
type Transaction = { id: number; amount: number; transaction_type: string; description: string; created_at: string; patron_profiles: { display_name: string } | null };
type Purchase = { id: number; quantity: number; total_price_copper: number; status: string; purchased_at: string; drinks: { name: string } | null; patron_profiles: { display_name: string } | null };

export default function StewardsDashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, []);

  const isAdmin = session?.user.app_metadata?.role === "admin";

  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    async function loadDashboard() {
      setLoading(true); setError("");
      const [profileResult, drinkResult, transactionResult, purchaseResult] = await Promise.all([
        supabase.from("patron_profiles").select("id, display_name, created_at").order("created_at", { ascending: false }),
        supabase.from("drinks").select("id, name, is_active").order("name"),
        supabase.from("coin_transactions").select("id, amount, transaction_type, description, created_at, patron_profiles(display_name)").order("created_at", { ascending: false }).limit(20),
        supabase.from("purchases").select("id, quantity, total_price_copper, status, purchased_at, drinks(name), patron_profiles(display_name)").order("purchased_at", { ascending: false }).limit(100),
      ]);
      if (!active) return;
      const firstError = profileResult.error || drinkResult.error || transactionResult.error || purchaseResult.error;
      if (firstError) setError("The office ledger could not be opened. Sign out and back in, then try again.");
      else {
        setProfiles((profileResult.data || []) as Profile[]);
        setDrinks((drinkResult.data || []) as Drink[]);
        setTransactions((transactionResult.data || []) as unknown as Transaction[]);
        setPurchases((purchaseResult.data || []) as unknown as Purchase[]);
      }
      setLoading(false);
    }
    loadDashboard();
    return () => { active = false; };
  }, [isAdmin]);

  const figures = useMemo(() => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const completed = purchases.filter((purchase) => purchase.status === "completed");
    const popularity = completed.reduce<Record<string, number>>((totals, purchase) => {
      const name = purchase.drinks?.name || "Unknown drink";
      totals[name] = (totals[name] || 0) + purchase.quantity;
      return totals;
    }, {});
    const popular = Object.entries(popularity).sort((a, b) => b[1] - a[1])[0];
    return {
      newPatrons: profiles.filter((profile) => new Date(profile.created_at).getTime() >= thirtyDaysAgo).length,
      activeDrinks: drinks.filter((drink) => drink.is_active).length,
      circulatingCoins: transactions.reduce((total, transaction) => total + transaction.amount, 0),
      completedPurchases: completed.length,
      copperSpent: completed.reduce((total, purchase) => total + purchase.total_price_copper, 0),
      popularDrink: popular ? `${popular[0]} · ${popular[1]}` : "No orders yet",
    };
  }, [profiles, drinks, transactions, purchases]);

  if (!ready) return <section className="stewards-status">Unlocking the office…</section>;
  if (!session) return <section className="stewards-status"><p className="stewards-kicker">Restricted records</p><h1>The office is locked.</h1><p>Sign in through the Patron Ledger using the authorised OAW account.</p><a href="/patrons">Go to the Patron Ledger</a></section>;
  if (!isAdmin) return <section className="stewards-status"><p className="stewards-kicker">Stewards only</p><h1>This ledger is private.</h1><p>Your patron account does not have permission to enter the Steward’s Office.</p><a href="/patrons">Return to your patron page</a></section>;

  return (
    <div className="stewards-dashboard">
      <section className="stewards-intro">
        <p className="stewards-kicker">Private administration</p><h1>The Steward’s Office</h1>
        <p>House totals and operational records—without private authentication data.</p><span>Signed in as {session.user.email}</span>
      </section>
      {loading && <p className="stewards-message">Reading the ledgers…</p>}
      {error && <p className="stewards-message error" role="alert">{error}</p>}
      {!loading && !error && <>
        <section className="stewards-figures" aria-label="House totals">
          <article><span>Registered patrons</span><strong>{profiles.length}</strong><small>{figures.newPatrons} joined in 30 days</small></article>
          <article><span>Active drinks</span><strong>{figures.activeDrinks}</strong><small>{drinks.length} recipes on record</small></article>
          <article><span>Coins in circulation</span><strong>{figures.circulatingCoins}</strong><small>Copper Coin ledger balance</small></article>
          <article><span>Completed purchases</span><strong>{figures.completedPurchases}</strong><small>{figures.copperSpent} Copper Coins spent</small></article>
        </section>
        <section className="stewards-grid">
          <article className="office-panel"><div className="office-panel-heading"><div><p className="stewards-kicker">The company</p><h2>Newest patrons</h2></div><span>{profiles.length} total</span></div><div className="office-list">{profiles.slice(0, 8).map((profile) => <div key={profile.id}><strong>{profile.display_name}</strong><span>Joined {new Date(profile.created_at).toLocaleDateString()}</span></div>)}</div></article>
          <article className="office-panel"><div className="office-panel-heading"><div><p className="stewards-kicker">The cellar</p><h2>House service</h2></div><span>{figures.activeDrinks} active</span></div><dl className="office-summary"><div><dt>Most ordered</dt><dd>{figures.popularDrink}</dd></div><div><dt>Total recipes</dt><dd>{drinks.length}</dd></div><div><dt>Completed orders</dt><dd>{figures.completedPurchases}</dd></div></dl></article>
          <article className="office-panel office-panel-wide"><div className="office-panel-heading"><div><p className="stewards-kicker">The till</p><h2>Recent coin activity</h2></div><span>{transactions.length ? "Latest 20" : "No entries"}</span></div><div className="office-list transaction-list">{transactions.map((transaction) => <div key={transaction.id}><p><strong>{transaction.description}</strong><span>{transaction.patron_profiles?.display_name || "Patron"} · {new Date(transaction.created_at).toLocaleDateString()}</span></p><b className={transaction.amount > 0 ? "positive" : "negative"}>{transaction.amount > 0 ? "+" : ""}{transaction.amount}</b></div>)}{!transactions.length && <p className="empty-record">The till has no recorded activity yet.</p>}</div></article>
        </section>
        <section className="analytics-link"><div><p className="stewards-kicker">Site activity</p><h2>Visitor reports live in Google Analytics.</h2><p>Open the dedicated report for page views, devices, countries, and traffic sources. Account credentials and verification information are never sent there.</p></div><a href="https://analytics.google.com/" target="_blank" rel="noreferrer">Open Google Analytics ↗</a></section>
      </>}
    </div>
  );
}
