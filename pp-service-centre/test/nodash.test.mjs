import { noDash, hasDash } from "../src/nodash.js";
import { THREADS } from "../src/sample.js";
import assert from "node:assert/strict";

assert.equal(noDash("Hello—world"), "Hello, world");
assert.equal(noDash("Hello — world"), "Hello, world");
assert.equal(noDash("2–3 days"), "2-3 days");
assert.equal(noDash("a – b"), "a, b");
assert.equal(hasDash(noDash("x — y – z ― w")), false);

// no sample draft may contain a dash of any kind
for (const t of THREADS(Date.now())) {
  const text = JSON.stringify([t.draft, t.suggestedDrafts]);
  assert.equal(hasDash(text), false, "dash in sample draft " + t.id);
}
console.log("nodash tests passed");
