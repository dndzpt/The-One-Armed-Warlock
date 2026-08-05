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

test("renders the public Tappery", async () => {
  const response = await render("/tappery");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Hearthall/);
  assert.match(html, /Pull up a chair/);
  assert.match(html, /Patron Ledger/);
  assert.match(html, /aria-label="Tappery mobile navigation"/);
  assert.match(html, /Navigation/);
  assert.match(html, /Join the Patron Ledger/);
  assert.match(html, /Copper Coins/);
  assert.match(html, /Hearthmother/);
  assert.doesNotMatch(html, /Chief Barmaid/i);
  assert.match(html, /The Threshold[\s\S]*Hearthall[\s\S]*Noticeboard[\s\S]*Join[\s\S]*Connect/);
  assert.doesNotMatch(html, /href="#menu">The Bar<\/a>/);
  assert.doesNotMatch(html, /href="#menu">Drinks<\/a>/);
  assert.match(html, /From The Tap/);
  assert.match(html, /id="connect"/);
  assert.match(html, /Discord[\s\S]*YouTube[\s\S]*Instagram/);
});

test("renders the Threshold with a single Hearthall entrance", async () => {
  const response = await render("/");
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /Welcome, Traveler/);
  assert.match(html, /Legends tell of an impossible doorway/);
  assert.match(html, /world of Occura/);
  assert.match(html, /The fire is lit\. The mugs are full\. Welcome!/);
  assert.match(html, /href="\/" aria-current="page">The Threshold/);
  assert.match(html, /class="threshold-paths"/);
  assert.match(html, /class="threshold-navigation"[^>]*><a href="\/" aria-current="page">The Threshold<\/a><\/nav>/);
  assert.match(html, /Enter the OAW Hearthall/);
  assert.doesNotMatch(html, /Visit the Tappery/);
  assert.doesNotMatch(html, /href="\/patrons">Join/);
});

test("randomizes the framed Threshold artwork on each visit", async () => {
  const [gallerySource, globalCss] = await Promise.all([
    readFile(new URL("../app/threshold-gallery.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.match(gallerySource, /length: 13/);
  assert.match(gallerySource, /crypto\.getRandomValues/);
  assert.match(gallerySource, /thresholdImages\[randomImageIndex\(\)\]/);
  assert.match(gallerySource, /The door that isn&apos;t there\.\.\./);
  assert.match(globalCss, /\.threshold-frame/);
  assert.match(globalCss, /aspect-ratio:\s*2 \/ 3/);
  assert.match(globalCss, /border-image:\s*url\("\/threshold\/frame\.webp"\)/);
  assert.doesNotMatch(globalCss, /repeating-linear-gradient\(4deg/);
  assert.match(globalCss, /\.threshold-gallery \{ width: min\(36vw, 560px\)/);
  assert.match(globalCss, /\.threshold-gallery \{ width: min\(72vw, 390px\)/);
  assert.match(globalCss, /\.threshold-paths \{ margin-top: 34px; display: grid/);
  assert.match(globalCss, /\.threshold-paths \{ grid-template-columns: 1fr; \}/);
});

test("keeps The Tappery, locked Doors, and account creation reachable from Hearthall on mobile", async () => {
  const response = await render("/hearthall");
  const html = await response.text();
  assert.match(html, /aria-label="Main mobile navigation"/);
  assert.match(html, /mobile-guild-navigation/);
  assert.match(html, /href="\/">The Threshold/);
  assert.match(html, /href="\/tappery">The Tappery/);
  assert.match(html, /href="\/patrons">Join/);
  assert.doesNotMatch(html, /Create an account/);
  assert.match(html, /class="button secondary" href="\/patrons">Join<\/a>/);
  assert.match(html, /Doors[\s\S]*Guildhall[\s\S]*Library[\s\S]*Music Chamber[\s\S]*Gallery[\s\S]*Join[\s\S]*Connect/);
  assert.doesNotMatch(html, />About<\/a>/);
  assert.doesNotMatch(html, />Explore<\/a>/);
  assert.match(html, /Welcome to the Hearthall/);
  assert.match(html, /Every great inn is remembered not for its walls, but for its hearth/);
  assert.match(html, /The Noticeboard/);
  assert.match(html, /Publishing tools for the master OAW account are coming soon/);
  assert.match(html, /Rest by the Hearth/);
  assert.match(html, /Settle into the warmth, close your eyes, and let your mind wander/);
  assert.match(html, /Close your eyes/);
  assert.doesNotMatch(html, /Every great story starts around a table/);
});

test("offers every visitor a randomized, accessible Hearth dream", async () => {
  const [dreamSource, dreamsSource, globalCss] = await Promise.all([
    readFile(new URL("../app/hearth-dream.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/hearth-dreams.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.equal((dreamsSource.match(/\{ title:/g) || []).length, 50);
  assert.match(dreamSource, /crypto\.getRandomValues/);
  assert.match(dreamSource, /randomItem\(hearthDreams\)/);
  assert.match(dreamSource, /randomItem\(awakeningPhrases\)/);
  assert.match(dreamSource, /role="dialog"/);
  assert.match(dreamSource, /aria-modal="true"/);
  assert.match(dreamSource, /event\.key === "Escape"/);
  assert.match(dreamSource, /autoFocus/);
  assert.match(globalCss, /animation: hearth-fall-asleep 1\.65s/);
  assert.match(globalCss, /@media \(prefers-reduced-motion: reduce\)/);
});

test("mobile navigation expands accessibly and closes after selection", async () => {
  const source = await readFile(new URL("../app/mobile-navigation.tsx", import.meta.url), "utf8");
  assert.match(source, /aria-expanded=\{open\}/);
  assert.match(source, /setOpen\(\(current\) => !current\)/);
  assert.match(source, /onClick=\{\(\) => setOpen\(false\)\}/);
  assert.match(source, /event\.key === "Escape"/);
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /\.doors-chevron \{[^}]*border-top: 5px solid currentColor/);
  assert.match(css, /\.doors-trigger\[aria-expanded="true"\] \.doors-chevron \{[^}]*border-bottom: 5px solid currentColor/);
});

test("shows an accessible locked Doors menu", async () => {
  const source = await readFile(new URL("../app/doors-menu.tsx", import.meta.url), "utf8");
  assert.match(source, /Guildhall/);
  assert.match(source, /Library/);
  assert.match(source, /Music Chamber/);
  assert.match(source, /Gallery/);
  assert.match(source, /Guild Key not yet acquired\./);
  assert.match(source, /aria-expanded=\{open\}/);
  assert.match(source, /role="status"/);
  assert.match(source, /event\.key === "Escape"/);
});

test("shows My Ledger in site navigation for signed-in patrons", async () => {
  const [linkSource, mobileSource, guildHallSource, tavernSource] = await Promise.all([
    readFile(new URL("../app/patron-navigation-link.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/mobile-navigation.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/guild-hall/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/tavern/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(linkSource, /data\.session \? "My Ledger" : "Join"/);
  assert.match(linkSource, /session \? "My Ledger" : "Join"/);
  assert.match(linkSource, /label === "My Ledger" \? label : signedOutLabel/);
  assert.match(mobileSource, /item\.href === "\/patrons" \? patronLabel : item\.label/);
  assert.match(guildHallSource, /<PatronNavigationLink className="button secondary" \/>/);
  assert.match(tavernSource, /signedOutLabel="Join the Patron Ledger"/);
});

test("awards daily Copper Coins and protects Tavern purchases", async () => {
  const [ledgerSource, navigationSource, purchaseSource, tavernSource] = await Promise.all([
    readFile(new URL("../app/patrons/patron-auth.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/patron-navigation-link.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/tavern/drink-purchase-button.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/tavern/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(ledgerSource, /rpc\("claim_daily_allowance"\)/);
  assert.match(ledgerSource, /today’s 10 Copper Coins/);
  assert.match(navigationSource, /rpc\("claim_daily_allowance"\)/);
  assert.match(purchaseSource, /rpc\("purchase_drink"/);
  assert.match(purchaseSource, /Not enough Copper Coins/);
  assert.match(ledgerSource, /rpc\("get_my_orders_today"\)/);
  assert.match(ledgerSource, /rpc\("get_my_drink_totals"\)/);
  assert.match(ledgerSource, /Today&apos;s Orders/);
  assert.match(ledgerSource, /Tappery Totals/);
  assert.doesNotMatch(ledgerSource, /Coin ledger/);
  assert.doesNotMatch(ledgerSource, /Purchase records/);
  assert.match(ledgerSource, /balance === UNLIMITED_COPPER \? "Unlimited" : balance/);
  assert.match(purchaseSource, /Unlimited Copper Coins remain/);
  assert.match(purchaseSource, /rpc\("claim_daily_allowance"\)/);
  assert.match(purchaseSource, /After this order, \$\{projectedBalance\} Copper Coins will remain/);
  assert.match(purchaseSource, /Confirm order/);
  assert.match(purchaseSource, /Select this drink/);
  assert.match(tavernSource, /<DrinkPurchaseButton drinkId=/);
  assert.doesNotMatch(tavernSource, /Service coming soon/);
});

test("shows a randomized Yerma message after each successful drink purchase", async () => {
  const [purchaseSource, quotesSource, tavernCss] = await Promise.all([
    readFile(new URL("../app/tavern/drink-purchase-button.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/tavern/drink-quotes.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/tavern/tavern.css", import.meta.url), "utf8"),
  ]);
  assert.match(purchaseSource, /crypto\.getRandomValues/);
  assert.match(purchaseSource, /setYermaQuote\(randomItem\(drinkQuotes\[drinkId\]\)\)/);
  assert.match(purchaseSource, /role="dialog"/);
  assert.match(purchaseSource, /A word from the Hearthmother/);
  assert.match(purchaseSource, /autoFocus/);
  assert.match(quotesSource, /Ironroot Ale/);
  assert.match(quotesSource, /Maha's Honey Mead/);
  assert.match(quotesSource, /Moondrop Cider/);
  assert.match(quotesSource, /Yerma's Reserve/);
  assert.equal((quotesSource.match(/^\s{4}"/gm) || []).length, 60);
  assert.match(tavernCss, /\.yerma-toast-backdrop/);
});

test("warns rapid drinkers and settles a fourth-order patron into a Hearth dream", async () => {
  const [purchaseSource, dreamSource, quotesSource, tavernCss] = await Promise.all([
    readFile(new URL("../app/tavern/drink-purchase-button.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/hearth-dream.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/tavern/drink-quotes.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/tavern/tavern.css", import.meta.url), "utf8"),
  ]);
  assert.match(purchaseSource, /FIVE_MINUTES_MS = 5 \* 60 \* 1000/);
  assert.match(purchaseSource, /\.eq\("patron_id", session\.user\.id\)/);
  assert.match(purchaseSource, /\.gte\("purchased_at", fiveMinutesAgo\)/);
  assert.match(purchaseSource, /recentDrinkCount >= 4/);
  assert.match(purchaseSource, /recentDrinkCount >= 3/);
  assert.match(purchaseSource, /randomItem\(steadyWarnings\)/);
  assert.match(purchaseSource, /randomItem\(steadyHeadings\)/);
  assert.match(purchaseSource, /randomItem\(hearthInterventions\)/);
  assert.match(purchaseSource, /randomItem\(unfocusedHeadings\)/);
  assert.match(purchaseSource, /INTERVENTION_BLUR_MS = 5000/);
  assert.match(purchaseSource, /yermaMode !== "intervention" \|\| interventionReady/);
  assert.match(dreamSource, /<HearthDreamOverlay/);
  assert.match(purchaseSource, /window\.localStorage\.setItem\(resetKey, String\(Date\.now\(\)\)\)/);
  assert.match(purchaseSource, /window\.sessionStorage\.setItem\(transportedDreamKey/);
  assert.match(purchaseSource, /FALL_ASLEEP_MS = 1700/);
  assert.match(purchaseSource, /router\.replace\("\/hearthall\?rest=1#hearth", \{ scroll: false \}\)/);
  assert.match(purchaseSource, /hearth-dream-transport/);
  assert.match(dreamSource, /useEffect\(\(\) => \{\s+const transportedDream = takeTransportedDream\(\)/);
  assert.match(dreamSource, /setDream\(transportedDream\.dream\)/);
  assert.match(dreamSource, /alreadyAsleep=\{isArrivingFromTappery\}/);
  assert.match(quotesSource, /Steady there, traveler\. These pours are brewed strong!/);
  assert.match(quotesSource, /You feel a tingling in your fingers/);
  assert.match(quotesSource, /Don't worry, I've got you\. Let's set you down by the hearth/);
  assert.match(quotesSource, /You lose focus/);
  assert.match(tavernCss, /\.yerma-toast-backdrop\.inebriation-backdrop/);
  assert.match(tavernCss, /backdrop-filter:blur\(24px\)/);
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
  assert.match(patronsCss, /\.patrons-intro\{position:sticky;top:92px/);
  assert.match(patronsCss, /@media\(max-width:950px\)\{\.patrons-page\{display:block\}\.patrons-intro\{position:static/);
});

test("renders the patron account entry page", async () => {
  const response = await render("/patrons");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Your chair is waiting/);
  assert.match(html, /Opening the ledger/);
  assert.doesNotMatch(html, /service_role|secret key/i);
});

test("welcomes signed-in patrons with a reserved seat", async () => {
  const introSource = await readFile(new URL("../app/patrons/patron-intro.tsx", import.meta.url), "utf8");
  assert.match(introSource, /getSession\(\)/);
  assert.match(introSource, /onAuthStateChange/);
  assert.match(introSource, /Your seat is now reserved/);
  assert.match(introSource, /Thank you for becoming a Patron of The One-Armed Warlock/);
  assert.match(introSource, /Your chair is waiting/);
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

test("supports secure password recovery by email link", async () => {
  const authSource = await readFile(new URL("../app/patrons/patron-auth.tsx", import.meta.url), "utf8");
  assert.match(authSource, /Forgot your password\?/);
  assert.match(authSource, /resetPasswordForEmail\(nextEmail/);
  assert.match(authSource, /redirectTo: "https:\/\/theonearmedwarlock\.com\/patrons"/);
  assert.match(authSource, /event === "PASSWORD_RECOVERY"/);
  assert.match(authSource, /updateUser\(\{ password \}\)/);
  assert.match(authSource, /Set new password/);
  assert.match(authSource, /If that address is written in the ledger/);
  assert.doesNotMatch(authSource, /service_role|admin\.updateUserById/);
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
