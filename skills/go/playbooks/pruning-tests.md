### Pruning tests

**You own the suite's signal, not its size.** Every test left fails when intended behavior regresses, and only then. Distinct from Refactoring, which reshapes production code against a pinned contract.

1. Scope the suite to the path the user named, or the whole suite when they named none. Run it once and record the pass count. A suite that is red before you start gets reported, not pruned around.
2. Classify each test by what it depends on, per the **principle-test-behavior-not-implementation** skill. Keep a test only when it changes when intended behavior changes and fails only when that behavior regresses. Prune a test that depends on any of these:
   - **The past.** It guards code that no longer exists, so it has no reason of its own to change. It asserts a removed feature is gone, or that a moved module is absent from its old path. Removed code never changes, so the test can't catch a regression.
   - **Nothing.** No change to the code can make it fail. It tests the browser or framework (a `<button>` renders, a click event fires), mocks the unit under test and asserts what the mock returns, or asserts what the type system already guarantees.
   - **The implementation.** It changes whenever the code does, even when behavior didn't. Its expected value comes from the same logic as the code, so a wrong result still passes. Or it asserts private state, internal call order, or which helper was invoked.
   - **A copy.** Another test already guards the same behavior. Keep the one closest to the surface callers use.
3. Delete every test that isn't anchored to intended behavior. When one also covers behavior a caller relies on, rewrite it against that behavior instead. Drive it through the public interface and take the expected value from the requirement as a literal.
4. Delete production code that existed only for the tests you removed, such as test-only exports, reset hooks, and getters for private state.
5. Prove each rewrite still guards something. Break the behavior it claims (flip a value, skip an effect), watch it fail, then revert. Delete a rewrite that stays green.
6. Run the repository's full check command. A failure means a deleted test or helper was load-bearing. Restore it and classify it again.
7. Check the end state. Every test left is anchored to intended behavior and would fail on a regression, and only on one. No test asserts code that no longer exists. No two tests guard the same behavior. No production code exists only for tests.
8. Run **Opening a PR** with a table of each pruned test, its category, and whether it was deleted or rewritten.

**Example.**

```diff
--- a/pricing.test.ts
+++ b/pricing.test.ts
@@ rewritten: the expected value repeated the code's logic @@
 test("applies the discount", () => {
-  const price = 100;
-  expect(applyDiscount(price, 0.2)).toBe(price - price * 0.2);
+  expect(applyDiscount(100, 0.2)).toBe(80);
 });
--- a/cart.test.ts
+++ b/cart.test.ts
@@ rewritten against what callers see: it asserted private state @@
 test("adds an item to the cart", () => {
   const cart = new Cart();
   cart.add(book);
-  expect(cart._items.length).toBe(1);
+  expect(cart.total()).toBe(book.price);
 });
@@ deleted: checkout.test.ts already guards the same total @@
-test("total includes tax", () => {
-  expect(cartTotal([book], { tax: 0.1 })).toBe(11);
-});
--- a/export.test.ts
+++ b/export.test.ts
@@ deleted: it guards code that no longer exists @@
-test("legacy exporter is gone", () => {
-  expect(existsSync("src/export/legacy.ts")).toBe(false);
-});
--- a/session.test.ts
+++ b/session.test.ts
@@ deleted, with the production code that only existed for it @@
-test("clears the cache", () => {
-  _resetCacheForTests();
-  expect(_getCacheSize()).toBe(0);
-});
--- a/session.ts
+++ b/session.ts
@@ @@
-export function _resetCacheForTests() { cache.clear(); }
-export function _getCacheSize() { return cache.size; }
```

**Reply:** the scope, the count of tests deleted and rewritten in each category, the production code removed, the rewrites you broke to prove they fail, and any test you kept on a judgment call with the reason.
