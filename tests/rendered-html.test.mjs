import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the public tavern", async () => {
  const response = await render("/tavern");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /The Guild Hall/);
  assert.match(html, /Pull up a chair/);
  assert.match(html, /Patron Ledger/);
  assert.match(html, /aria-label="Tavern mobile navigation"/);
  assert.match(html, /Navigation/);
  assert.match(html, /Join the Patron Ledger/);
  assert.match(html, /Copper Coins/);
  assert.match(html, /Guild Hall[\s\S]*The Bar[\s\S]*Drinks[\s\S]*Noticeboard[\s\S]*Join[\s\S]*Connect/);
  assert.match(html, /id="connect"/);
  assert.match(html, /Discord[\s\S]*YouTube[\s\S]*Instagram/);
});

test("keeps tavern and account creation reachable on mobile", async () => {
  const response = await render("/");
  const html = await response.text();
  assert.match(html, /aria-label="Main mobile navigation"/);
  assert.match(html, /mobile-guild-navigation/);
  assert.match(html, /href="\/tavern">Tavern/);
  assert.match(html, /href="\/patrons">Join/);
  assert.doesNotMatch(html, /Create an account/);
  assert.match(html, /class="button secondary" href="\/patrons">Join<\/a>/);
  assert.match(html, /Explore[\s\S]*Join[\s\S]*Connect/);
  assert.match(html, /Welcome to the Guild Hall/);
});

test("mobile navigation expands accessibly and closes after selection", async () => {
  const source = await readFile(new URL("../app/mobile-navigation.tsx", import.meta.url), "utf8");
  assert.match(source, /aria-expanded=\{open\}/);
  assert.match(source, /setOpen\(\(current\) => !current\)/);
  assert.match(source, /onClick=\{\(\) => setOpen\(false\)\}/);
  assert.match(source, /event\.key === "Escape"/);
});

test("shows My Ledger in site navigation for signed-in patrons", async () => {
  const [linkSource, mobileSource] = await Promise.all([
    readFile(new URL("../app/patron-navigation-link.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/mobile-navigation.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(linkSource, /data\.session \? "My Ledger" : "Join"/);
  assert.match(linkSource, /session \? "My Ledger" : "Join"/);
  assert.match(mobileSource, /item\.href === "\/patrons" \? patronLabel : item\.label/);
});

test("keeps navigation visible while pages scroll", async () => {
  const [globalCss, tavernCss, patronsCss] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/tavern/tavern.css", import.meta.url), "utf8"),
    readFile(new URL("../app/patrons/patrons.css", import.meta.url), "utf8"),
  ]);
  assert.match(globalCss, /\.site-header[^}]*position:\s*sticky/);
  assert.match(globalCss, /background:\s*rgba\(244, 240, 231, \.32\)/);
  assert.match(tavernCss, /\.tavern-header\{position:fixed/);
  assert.match(tavernCss, /background:#08050352/);
  assert.match(tavernCss, /\.tavern-header \.mobile-navigation-panel\{display:grid\}/);
  assert.match(patronsCss, /\.patrons-header\{[^}]*position:sticky/);
  assert.match(patronsCss, /background:#0b070552/);
});

test("renders the patron account entry page", async () => {
  const response = await render("/patrons");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Your chair is waiting/);
  assert.match(html, /Opening the ledger/);
  assert.doesNotMatch(html, /service_role|secret key/i);
});

test("verifies and resends password-signup codes as signup tokens", async () => {
  const authSource = await readFile(new URL("../app/patrons/patron-auth.tsx", import.meta.url), "utf8");
  assert.match(authSource, /verifyOtp\(\{ email: nextEmail, token, type: "signup" \}\)/);
  assert.match(authSource, /resend\(\{ type: "signup"/);
  assert.match(authSource, />Verify account<\/button>/);
  assert.match(authSource, /email not confirmed/i);
  assert.doesNotMatch(authSource, /verifyOtp\(\{ email: nextEmail, token, type: "email" \}\)/);
  assert.match(authSource, /pattern="\[0-9\]\{6,10\}"/);
  assert.doesNotMatch(authSource, /six-digit/i);
});

test("loads analytics only after a visitor accepts", async () => {
  const [layoutSource, consentSource] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/analytics-consent.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(layoutSource, /<AnalyticsConsent \/>/);
  assert.match(consentSource, /G-9FQTQKMD71/);
  assert.match(consentSource, /analytics_storage: "granted"/);
  assert.match(consentSource, /ad_storage: "denied"/);
  assert.match(consentSource, /window\.localStorage\.setItem/);
  assert.match(consentSource, /Accept analytics/);
  assert.match(consentSource, /Decline/);
  assert.match(consentSource, /Privacy choices/);
  assert.ok(consentSource.indexOf('nextChoice === "accepted"') < consentSource.lastIndexOf("initialiseAnalytics();"));
});

test("protects the Steward's Office with the Supabase admin role", async () => {
  const [dashboardSource, patronSource] = await Promise.all([
    readFile(new URL("../app/stewards-office/stewards-dashboard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/patrons/patron-auth.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(dashboardSource, /app_metadata\?\.role === "admin"/);
  assert.match(dashboardSource, /This ledger is private/);
  assert.match(dashboardSource, /patron_profiles/);
  assert.match(dashboardSource, /coin_transactions/);
  assert.match(dashboardSource, /purchases/);
  assert.doesNotMatch(dashboardSource, /service_role|verification_code/i);
  assert.match(patronSource, /href="\/stewards-office"/);
});
