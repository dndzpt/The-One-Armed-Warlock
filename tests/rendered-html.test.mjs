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
  assert.match(html, /Pull up a chair/);
  assert.match(html, /Patron Ledger/);
  assert.match(html, /Copper Coins/);
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
