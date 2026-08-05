"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type View = "register" | "verify" | "login" | "forgot";
type TodayOrder = { id: number; quantity: number; total_price_copper: number; status: string; purchased_at: string; drink_name: string };
type DrinkTotal = { drink_id: number; drink_name: string; total_quantity: number };
const UNLIMITED_COPPER = 2147483647;

export default function PatronAuth() {
  const [view, setView] = useState<View>("register");
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [profileName, setProfileName] = useState("");
  const [todayOrders, setTodayOrders] = useState<TodayOrder[]>([]);
  const [drinkTotals, setDrinkTotals] = useState<DrinkTotal[]>([]);
  const [balance, setBalance] = useState(0);
  const [allowanceMessage, setAllowanceMessage] = useState("");
  const [ledgerError, setLedgerError] = useState("");

  useEffect(() => {
    if (window.location.hash.includes("type=recovery")) setRecovering(true);
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (event === "PASSWORD_RECOVERY") setRecovering(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setProfileName(""); setTodayOrders([]); setDrinkTotals([]); setBalance(0); setAllowanceMessage(""); setLedgerError("");
      return;
    }
    let active = true;
    async function loadLedger() {
      const allowanceResult = await supabase.rpc("claim_daily_allowance");
      const [profileResult, todayOrdersResult, drinkTotalsResult] = await Promise.all([
        supabase.from("patron_profiles").select("display_name").eq("id", session!.user.id).single(),
        supabase.rpc("get_my_orders_today"),
        supabase.rpc("get_my_drink_totals"),
      ]);
      if (!active) return;
      const error = allowanceResult.error || profileResult.error || todayOrdersResult.error || drinkTotalsResult.error;
      if (error) return setLedgerError("The ledger could not be opened just now. Please refresh and try again.");
      const allowance = allowanceResult.data?.[0] as { balance: number; awarded: boolean; amount: number } | undefined;
      setProfileName(profileResult.data.display_name);
      setBalance(allowance?.balance || 0);
      setAllowanceMessage(allowance?.balance === UNLIMITED_COPPER
        ? "The house testing purse never runs dry."
        : allowance?.awarded
          ? "Yerma has added today’s 10 Copper Coins to your purse."
          : "Today’s allowance is already safely tucked into your purse.");
      setTodayOrders((todayOrdersResult.data || []) as TodayOrder[]);
      setDrinkTotals((drinkTotalsResult.data || []) as DrinkTotal[]);
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

  async function requestPasswordReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextEmail = String(form.get("email") || "").trim().toLowerCase();
    setBusy(true); setMessage("");
    const { error } = await supabase.auth.resetPasswordForEmail(nextEmail, {
      redirectTo: "https://theonearmedwarlock.com/patrons",
    });
    setBusy(false);
    if (error) return setMessage(error.message);
    setMessage("If that address is written in the ledger, Yerma has sent a secure password-reset link.");
  }

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    const confirmation = String(form.get("confirmation") || "");
    if (password !== confirmation) return setMessage("Those passwords do not match.");
    setBusy(true); setMessage("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setBusy(false);
      return setMessage(error.message);
    }
    await supabase.auth.signOut();
    setRecovering(false); setBusy(false); setView("login");
    window.history.replaceState({}, "", "/patrons");
    setMessage("Your new password is sealed in the ledger. You may now sign in.");
  }

  async function logout() {
    setBusy(true);
    await supabase.auth.signOut();
    setBusy(false); setMessage(""); setView("login");
  }

  if (!ready) return <section className="ledger-panel loading-ledger">Opening the ledger…</section>;

  if (recovering) return <section className="ledger-panel">
    <form onSubmit={updatePassword}>
      <p className="form-eyebrow">A fresh key for the ledger</p><h2>Choose a new password</h2>
      <p className="form-copy">Enter a new password for your patron account. The recovery link can only be used for this protected change.</p>
      <label>New password<input name="password" type="password" autoComplete="new-password" required minLength={8} /></label>
      <label>Repeat new password<input name="confirmation" type="password" autoComplete="new-password" required minLength={8} /></label>
      <button className="primary-button" disabled={busy}>{busy ? "Sealing the ledger…" : "Set new password"}</button>
      {message && <p className="auth-message" role="status">{message}</p>}
    </form>
  </section>;

  if (session) {
    const name = profileName || String(session.user.user_metadata?.display_name || "Patron");
    return (
      <section className="ledger-panel patron-profile" aria-live="polite">
        <p className="form-eyebrow">Private patron page</p>
        <h2>Welcome back, {name}.</h2>
        <p>Your name is written in Yerma’s ledger. This page is visible only while you are signed in.</p>
        <dl>
          <div><dt>Patron name</dt><dd>{name}</dd></div>
          <div><dt>Registered email</dt><dd>{session.user.email}</dd></div>
          <div><dt>Standing</dt><dd className="standing">Verified patron</dd></div>
          <div><dt>Copper Coin balance</dt><dd className="coin-balance">{balance === UNLIMITED_COPPER ? "Unlimited" : balance}</dd></div>
        </dl>
        {allowanceMessage && <p className="allowance-message" role="status">{allowanceMessage}</p>}
        {ledgerError && <p className="auth-message" role="status">{ledgerError}</p>}
        <div className="ledger-history today-orders">
          <div><span>Today&apos;s Orders</span><strong>{todayOrders.length ? `${todayOrders.length} at the bar` : "Nothing ordered today"}</strong></div>
          {todayOrders.map((order) => <article key={order.id}>
            <p><strong>{order.quantity} × {order.drink_name}</strong><small>{new Date(order.purchased_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} · {order.status}</small></p>
            <b className="debit">−{order.total_price_copper}</b>
          </article>)}
        </div>
        <div className="ledger-history tavern-totals">
          <div><span>Tappery Totals</span><strong>Lifetime pours</strong></div>
          {drinkTotals.map((drink) => <article key={drink.drink_id}>
            <p><strong>{drink.drink_name}</strong><small>All visits</small></p>
            <b>{drink.total_quantity}</b>
          </article>)}
        </div>
        {session.user.app_metadata?.role === "admin" && <a className="admin-office-link" href="/stewards-office">Enter the Steward’s Office</a>}
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
        <p className="form-eyebrow">Already in the ledger?</p><h2>Enter the Tappery</h2>
        <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
        <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
        <button className="primary-button" disabled={busy}>{busy ? "Checking the ledger…" : "Sign in"}</button>
        <button className="text-button" type="button" onClick={() => changeView("forgot")}>Forgot your password?</button>
      </form>}

      {view === "forgot" && <form onSubmit={requestPasswordReset}>
        <p className="form-eyebrow">Lost your ledger key?</p><h2>Reset your password</h2>
        <p className="form-copy">Enter your registered email address. Yerma will send a secure link to choose a new password.</p>
        <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
        <button className="primary-button" disabled={busy}>{busy ? "Sending raven-post…" : "Send reset link"}</button>
        <button className="text-button" type="button" onClick={() => changeView("login")}>Return to sign in</button>
      </form>}

      {message && <p className="auth-message" role="status">{message}</p>}
    </section>
  );
}
