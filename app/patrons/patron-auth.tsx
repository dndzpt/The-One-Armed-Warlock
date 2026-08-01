"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type View = "register" | "verify" | "login";
type CoinTransaction = { id: number; amount: number; transaction_type: string; description: string; created_at: string };
type Purchase = { id: number; quantity: number; total_price_copper: number; status: string; purchased_at: string; drinks: { name: string } | null };

export default function PatronAuth() {
  const [view, setView] = useState<View>("register");
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [profileName, setProfileName] = useState("");
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [ledgerError, setLedgerError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setProfileName(""); setTransactions([]); setPurchases([]); setLedgerError("");
      return;
    }
    let active = true;
    async function loadLedger() {
      const [profileResult, transactionResult, purchaseResult] = await Promise.all([
        supabase.from("patron_profiles").select("display_name").eq("id", session!.user.id).single(),
        supabase.from("coin_transactions").select("id, amount, transaction_type, description, created_at").order("created_at", { ascending: false }).limit(20),
        supabase.from("purchases").select("id, quantity, total_price_copper, status, purchased_at, drinks(name)").order("purchased_at", { ascending: false }).limit(20),
      ]);
      if (!active) return;
      const error = profileResult.error || transactionResult.error || purchaseResult.error;
      if (error) return setLedgerError("The ledger could not be opened just now. Please refresh and try again.");
      setProfileName(profileResult.data.display_name);
      setTransactions((transactionResult.data || []) as CoinTransaction[]);
      setPurchases((purchaseResult.data || []) as unknown as Purchase[]);
      setLedgerError("");
    }
    loadLedger();
    return () => { active = false; };
  }, [session]);

  function changeView(next: View) {
    setMessage("");
    setView(next);
  }

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const displayName = String(form.get("displayName") || "").trim();
    const nextEmail = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");
    const confirmation = String(form.get("confirmation") || "");
    if (password !== confirmation) return setMessage("Those passwords do not match.");
    setBusy(true); setMessage("");
    const { error } = await supabase.auth.signUp({
      email: nextEmail,
      password,
      options: { data: { display_name: displayName } },
    });
    setBusy(false);
    if (error) return setMessage(error.message);
    setEmail(nextEmail);
    setView("verify");
    setMessage("Yerma has sent your verification code. Check your inbox and spam folder.");
  }

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextEmail = String(form.get("email") || "").trim().toLowerCase();
    const token = String(form.get("token") || "").replace(/\D/g, "");
    setBusy(true); setMessage("");
    const { error } = await supabase.auth.verifyOtp({ email: nextEmail, token, type: "signup" });
    setBusy(false);
    if (error) return setMessage(error.message);
    setMessage("Your place in the ledger is confirmed. Welcome, patron.");
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextEmail = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");
    setBusy(true); setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email: nextEmail, password });
    setBusy(false);
    if (error) {
      if (/email not confirmed/i.test(error.message)) {
        setEmail(nextEmail);
        setView("verify");
        return setMessage("Your account is waiting for verification. Request a fresh code below.");
      }
      return setMessage(error.message);
    }
  }

  async function resendCode() {
    if (!email) return setMessage("Enter the email address used to create your account first.");
    setBusy(true); setMessage("");
    const { error } = await supabase.auth.resend({ type: "signup", email: email.trim().toLowerCase() });
    setBusy(false);
    if (error) return setMessage(error.message);
    setMessage("Yerma has sent a fresh verification code. Please use the newest email.");
  }

  async function logout() {
    setBusy(true);
    await supabase.auth.signOut();
    setBusy(false); setMessage(""); setView("login");
  }

  if (!ready) return <section className="ledger-panel loading-ledger">Opening the ledger…</section>;

  if (session) {
    const name = profileName || String(session.user.user_metadata?.display_name || "Patron");
    const balance = transactions.reduce((total, transaction) => total + transaction.amount, 0);
    return (
      <section className="ledger-panel patron-profile" aria-live="polite">
        <p className="form-eyebrow">Private patron page</p>
        <h2>Welcome back, {name}.</h2>
        <p>Your name is written in Yerma’s ledger. This page is visible only while you are signed in.</p>
        <dl>
          <div><dt>Patron name</dt><dd>{name}</dd></div>
          <div><dt>Registered email</dt><dd>{session.user.email}</dd></div>
          <div><dt>Standing</dt><dd className="standing">Verified patron</dd></div>
          <div><dt>Copper Coin balance</dt><dd className="coin-balance">{balance}</dd></div>
        </dl>
        {ledgerError && <p className="auth-message" role="status">{ledgerError}</p>}
        <div className="ledger-history">
          <div><span>Coin ledger</span><strong>{transactions.length ? "Recent activity" : "No transactions yet"}</strong></div>
          {transactions.map((transaction) => <article key={transaction.id}>
            <p><strong>{transaction.description}</strong><small>{new Date(transaction.created_at).toLocaleDateString()}</small></p>
            <b className={transaction.amount > 0 ? "credit" : "debit"}>{transaction.amount > 0 ? "+" : ""}{transaction.amount}</b>
          </article>)}
        </div>
        <div className="ledger-history purchase-history">
          <div><span>Purchase records</span><strong>{purchases.length ? "From the bar" : "No purchases yet"}</strong></div>
          {purchases.map((purchase) => <article key={purchase.id}>
            <p><strong>{purchase.quantity} × {purchase.drinks?.name || "Tavern drink"}</strong><small>{new Date(purchase.purchased_at).toLocaleDateString()} · {purchase.status}</small></p>
            <b className="debit">−{purchase.total_price_copper}</b>
          </article>)}
        </div>
        <div className="profile-coming"><span>Database connected</span><strong>Balances and records now come directly from Yerma’s ledger.</strong></div>
        <button className="secondary-button" onClick={logout} disabled={busy}>Sign out</button>
      </section>
    );
  }

  return (
    <section className="ledger-panel">
      <div className="auth-tabs" role="tablist" aria-label="Patron account options">
        <button className={view === "register" ? "active" : ""} onClick={() => changeView("register")}>Register</button>
        <button className={view === "login" ? "active" : ""} onClick={() => changeView("login")}>Sign in</button>
        <button className={view === "verify" ? "active" : ""} onClick={() => changeView("verify")}>Verify account</button>
      </div>

      {view === "register" && <form onSubmit={register}>
        <p className="form-eyebrow">New to the house?</p><h2>Join the ledger</h2>
        <label>Patron name<input name="displayName" autoComplete="name" required maxLength={50} /></label>
        <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
        <label>Password<input name="password" type="password" autoComplete="new-password" required minLength={8} /></label>
        <label>Repeat password<input name="confirmation" type="password" autoComplete="new-password" required minLength={8} /></label>
        <button className="primary-button" disabled={busy}>{busy ? "Writing your name…" : "Create patron account"}</button>
      </form>}

      {view === "verify" && <form onSubmit={verify}>
        <p className="form-eyebrow">One last step</p><h2>Check your raven-post</h2>
        <p className="form-copy">Enter the complete verification code sent by Yerma, or request a fresh one for an account you already created.</p>
        <label>Email address<input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Verification code<input className="code-input" name="token" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,10}" minLength={6} maxLength={10} required /></label>
        <button className="primary-button" disabled={busy}>{busy ? "Checking the ledger…" : "Verify my account"}</button>
        <button className="text-button" type="button" onClick={resendCode} disabled={busy}>Send a new code</button>
        <button className="text-button" type="button" onClick={() => changeView("register")}>Use a different address</button>
      </form>}

      {view === "login" && <form onSubmit={login}>
        <p className="form-eyebrow">Already in the ledger?</p><h2>Enter the tavern</h2>
        <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
        <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
        <button className="primary-button" disabled={busy}>{busy ? "Checking the ledger…" : "Sign in"}</button>
      </form>}

      {message && <p className="auth-message" role="status">{message}</p>}
    </section>
  );
}
