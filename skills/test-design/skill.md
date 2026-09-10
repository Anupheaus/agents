---
name: test-design
description: Use when writing tests for specific code or functionality, or when asked to audit tests or find gaps in test coverage
---

# Test Design

## Modes of Use

This skill operates in two distinct modes depending on what is being asked:

**Writing mode** — triggered when asked to write, add, or fix tests for a specific piece of code or functionality. Use the rest of this skill as the reference guide for how to think, structure, and write the tests.

**Audit mode** — triggered when asked to *audit* tests, *find gaps* in test coverage, or *review* the quality of an existing test suite. Follow the **Auditing Tests** workflow below.

---

## Core Principle: Test Intent, Not Implementation

**Before writing a single test, stop and ask: what is this code *for*?** Ignore how it is coded. Read the function/module name, its inputs, its outputs, its callers — derive the *purpose*. Every test you write must be a test of that purpose, not of how the code achieves it.

**The refactor rule:** If you change the internals of a function without changing its observable behavior, every existing test must still pass. If a test breaks on a pure refactor, **the test is wrong** — delete or rewrite it. This is not a nice-to-have: it is the definition of a correct test.

**Be exhaustive about intent.** Don't stop at the happy path. See Input Partitioning for the full breakdown of what "exhaustive" means in practice.

If you find yourself saying "I'll test that later," test it now.

## What to Test

**Always test:**
- Every distinct *behavioral* path through public/exported code
- All semantically distinct input categories (see Input Partitioning)
- Error conditions and how they're surfaced

**Never test:**
- Private/internal functions directly
- How the code works internally (only what it produces)
- Third-party library behavior
- Implementation choices that could change without affecting behavior (algorithm selection, internal data structures, internal call counts)

## Test Anatomy (Arrange → Act → Assert)

One act per test. One logical outcome per test.

```
// Arrange: set up the exact scenario
// Act: call the single thing under test
// Assert: verify the single observable result
```

If you need to assert multiple things, ask: are they all aspects of the same outcome? If yes, fine. If no, split the test.

## Naming

Test names are the spec. Name them as sentences describing behavior:

| ✅ Good | ❌ Bad |
|--------|--------|
| `returns empty list when no items match` | `testGetItems` |
| `throws when value is negative` | `test2` |
| `sends email after order confirmed` | `it works` |

When the test fails, the name should tell you exactly what broke without reading the body.

## Test Isolation

Each test must stand alone:
- Set up its own state — no shared mutable fixtures
- Clean up after itself
- Pass in any order, in isolation, or in parallel

Tests that depend on run order are scripts, not tests.

## Test Doubles

Use doubles to control **external** dependencies (I/O, time, randomness, APIs). Do not mock your own code — needing to mock internals usually signals a design problem.

| Double | Use when |
|--------|----------|
| **Stub** | You need a query to return a fixed value |
| **Fake** | You need a working lightweight replacement (e.g. in-memory DB) |
| **Mock** | You need to assert an *external* side effect was triggered (e.g. an email was sent, a webhook was called) |

Default to stubs/fakes. Mocks couple tests to implementation — use sparingly, and only for external boundaries.

## Granularity

Test at the **lowest level that gives real confidence**:

| Level | Target | When |
|-------|--------|------|
| Unit | Pure functions, algorithms, transformations | Always |
| Integration | Modules interacting with real I/O | When units touch external systems |
| End-to-end | Full user-visible flows | Critical paths only |

Don't duplicate coverage across levels. A behavior tested at unit level doesn't need an E2E test too.

## How to Derive Intent Before Writing Tests

1. Read the function/module name and its doc comment (if any). Write one sentence: "This code exists to ___."
2. Look at its callers — what do they expect to be true after calling it?
3. Look at its inputs and outputs only — ignore the body entirely.
4. List every behavioral guarantee implied by steps 1–3.
5. Partition all possible inputs into **good** and **bad** lists (see below).
6. Write parameterized tests that iterate those lists. That's your test suite.

**If intent is not obvious, stop and raise it.** If you cannot write the one-sentence purpose from name, signature, and callers alone, the code may need to be refactored before tests are written. Flag it: "I can't determine the intent of `X` from its interface — it may need renaming or splitting before I write tests for it." Do not proceed by guessing.

## Input Partitioning

Before writing any test code, classify the entire input space into two explicit lists:

**Good inputs** — values that satisfy the function's preconditions and should produce a valid result:
- Typical representative values
- Boundary-valid values (exactly at a min/max limit, not past it)
- All valid shapes/types if the input is polymorphic or overloaded
- Values that are "obviously fine" AND values that are "just barely fine"

**Bad inputs** — values that violate preconditions and should be rejected, error, or return a sentinel:
- `null` / `undefined` / missing
- Wrong type
- Out-of-range (below min, above max)
- Empty where non-empty is required
- Structurally invalid (missing required fields, wrong shape)
- Values that are "close to valid but aren't" (off-by-one past a boundary)

Once the lists exist, write **one parameterized test per category** (good / bad), not one test per value. The test body encodes *what should happen*; the list encodes *which inputs trigger it*. Adding a new case is one line in the list.

```typescript
// Derive lists first — this IS the spec
const validAges   = [0, 1, 17, 18, 99, 120];
const invalidAges = [-1, -100, 121, 1000, null, undefined, NaN, "25", 1.5];

test.each(validAges)('accepts valid age %i', (age) => {
  expect(() => validateAge(age)).not.toThrow();
});

test.each(invalidAges)('rejects invalid age %p', (age) => {
  expect(() => validateAge(age as number)).toThrow();
});
```

**The lists are documentation.** A reader can understand the full valid/invalid contract without reading any assertion logic. If the function's contract changes, update the list — not scattered individual test bodies.

## Security Inputs

For any code that handles user-supplied data, string processing, query building, rendering, file access, or authentication — security inputs are a mandatory bad-input category, not optional extras.

**XSS (Cross-Site Scripting)** — strings that could end up rendered as HTML:
```
<script>alert(1)</script>
<img src=x onerror=alert(1)>
javascript:alert(1)
"><svg onload=alert(1)>
```
Expected: output is escaped/sanitised; no script executes.

**SQL / NoSQL Injection** — values passed to a database:
```
' OR '1'='1
'; DROP TABLE users; --
{"$gt": ""}          // MongoDB operator injection
{"$where": "1==1"}
```
Expected: parameterised statements used; injected syntax treated as data, never executed.

**Command / Code Injection** — values passed to a shell, `eval`, `exec`, template engine, or dynamic `require`:
```
; rm -rf /
| cat /etc/passwd
$(malicious_command)
__import__('os').system('rm -rf /')
```
Expected: input never passed unescaped to a shell or eval context.

**Path Traversal** — values used as file paths:
```
../../etc/passwd
..\..\windows\system32\config\sam
/etc/passwd%00
....//....//etc/passwd      // double-encode bypass
```
Expected: resolved path always within the allowed directory; traversal sequences rejected or stripped.

**Prototype Pollution** (JavaScript) — `__proto__` or `constructor` keys in object merges, deep clones, or property assignments from user data:
```json
{ "__proto__": { "isAdmin": true } }
{ "constructor": { "prototype": { "isAdmin": true } } }
```
Expected: prototype chain of base objects unaffected after processing.

**Oversized / DoS inputs** — inputs that exhaust resources:
```
'A'.repeat(10_000_000)              // excessive string length
Array(1_000_000).fill(x)            // excessive array length
{ a: { a: { a: { ... } } } }       // deeply nested → stack overflow
```
Expected: rejected or truncated gracefully; does not hang, crash, or exhaust memory.

**Encoding and format confusion:**
```
\u0000, %00                         // null bytes
value\r\nX-Injected: header         // CRLF injection
UTF-8 overlong sequences
Bidi override characters (U+202E)
```
Expected: raw encoding sequences are treated as literal text or rejected; they must not alter structure, headers, or rendering context.

**How to apply:** Add a `securityInputs` list alongside your good/bad lists for any function touching user data. Use `test.each` to run all of them. The assertion is always the same: the dangerous payload must never appear unescaped in output, never execute, and never access data outside its permitted scope.

```typescript
const xssPayloads = [
  '<script>alert(1)</script>',
  '<img src=x onerror=alert(1)>',
  '"><svg onload=alert(1)>',
];

test.each(xssPayloads)('sanitises XSS payload: %s', (payload) => {
  const result = renderUserContent(payload);
  expect(result).not.toContain('<script>');
  expect(result).not.toMatch(/on\w+=/i);
});
```

## Property-Based and Generative Testing

Manual input lists enumerate cases you thought of. Property-based testing generates cases you didn't.

Use a library (`fast-check` for TypeScript/JS, `hypothesis` for Python) to define *properties* — invariants that must hold for all valid inputs — and let the framework generate thousands of inputs automatically, including edge cases you would never write by hand.

**When to use it:** Functions with large or combinatorial input spaces where manual enumeration is insufficient — parsers, serialisers, data transformers, sort/filter functions, mathematical operations.

**A property is a behavioral guarantee stated as a universal rule:**
- Serialise then deserialise → original value (round-trip)
- Sort output contains exactly the same elements as input (no addition/removal)
- Merge of two sets always contains all elements of both
- Encode then decode → identity

```typescript
import fc from 'fast-check';

it('round-trips any valid user object through serialisation', () => {
  fc.assert(
    fc.property(
      fc.record({ name: fc.string(), age: fc.integer({ min: 0, max: 120 }) }),
      (user) => {
        expect(deserialise(serialise(user))).toEqual(user);
      }
    )
  );
});
```

When `fast-check` finds a failure it automatically shrinks to the minimal failing case — far more useful than a random failing input.

**Don't replace input partitioning with property-based testing** — use both. Partitioning covers known categories clearly; generative testing finds unknown combinations.

## Test Data Factories

Brittle test setup is the main reason tests couple to implementation. The fix is factory functions: create a minimal valid object and let each test override only the field relevant to its scenario.

```typescript
function makeUser(overrides: Partial<User> = {}): User {
  return { id: 'user-1', name: 'Alice', email: 'alice@example.com', role: 'member', ...overrides };
}

it('rejects users without an email', () => {
  expect(() => validateUser(makeUser({ email: '' }))).toThrow('email required');
});

it('allows admin role', () => {
  expect(validateUser(makeUser({ role: 'admin' }))).toBe(true);
});
```

**Rules for factories:**
- Return a fully valid object by default — tests that don't care about a field should not need to set it
- Return a fresh object each call — never share mutable output between tests
- Keep factories in a shared test-utilities file, not duplicated per test file
- If a factory grows many parameters, that's a signal the data structure may be too complex

## Async Testing Without Flakiness

Async tests that use real time (`sleep`, `setTimeout`) are flaky by definition — they pass on fast machines and fail on slow ones. Never use real time in tests.

**Rules:**
- **Never `sleep` in a test.** Control when things happen instead of waiting for them.
- Use fake/mock timers (`vi.useFakeTimers()`, `jest.useFakeTimers()`) to advance time deterministically.
- Use controlled promises — resolve/reject them explicitly in the test rather than waiting for real I/O.
- For event-driven code, trigger the event directly; don't wait for it to fire naturally.

```typescript
it('retries after a delay when the first attempt fails', async () => {
  vi.useFakeTimers();
  const fetch = vi.fn()
    .mockRejectedValueOnce(new Error('timeout'))
    .mockResolvedValueOnce({ data: 'ok' });

  const promise = fetchWithRetry(fetch);
  await vi.runAllTimersAsync();

  expect(await promise).toEqual({ data: 'ok' });
  expect(fetch).toHaveBeenCalledTimes(2);
  vi.useRealTimers();
});
```

**Flakiness is a test bug, not a test feature.** A test that fails 5% of the time provides no reliable signal. Fix it — don't re-run it until it passes.

## Mutation Testing Mindset

Before considering a test suite complete, ask: *would these tests actually catch a real bug?*

A test that passes when it shouldn't is worse than no test — it creates false confidence. Mentally (or with a tool like Stryker) mutate the code and check whether the tests would fail:

- Flip a `>` to `>=` or `<`
- Change `&&` to `||`
- Delete a branch or an early return
- Return the wrong field, a hardcoded value, or `null`
- Swap two arguments

If any of these mutations leave all tests green, the tests are running the code without verifying it.

**Checklist before marking tests complete:**
- Does every assertion use specific expected values, not just `toBeTruthy` or `not.toBeNull`?
- Is every branch reachable by at least one test that would fail if that branch were deleted?
- If the function returned a hardcoded correct-looking value, would the tests catch it?
- Are error path assertions checking the *right* error, not just that *an* error was thrown?

```typescript
// ❌ Survives mutation — passes even if function returns anything truthy
expect(getUser(id)).toBeTruthy();

// ✅ Catches mutations — specific field values asserted
expect(getUser(id)).toEqual({ id: 'u1', name: 'Alice', role: 'member' });

// ❌ Survives mutation — passes even if wrong error is thrown
expect(() => parseDate('abc')).toThrow();

// ✅ Catches mutations — asserts the specific failure reason
expect(() => parseDate('abc')).toThrow('invalid date format');
```

**Use Stryker** (`npx stryker run`) to automate this. It mutates your source code, runs your tests against each mutation, and reports which mutations survived — each survivor is a gap in your test coverage.

## Resilience and Real-World Failure Scenarios

Beyond input validation, consider what happens when the *environment* fails underneath the code. These scenarios are rare but disproportionately dangerous — and almost never tested.

**For every function that touches external state, ask:** what happens if this fails partway through?

| Category | Scenarios to test |
|----------|------------------|
| **Network / connection** | Connection drops mid-request, timeout before response, connection refused, partial response received |
| **Process termination** | SIGKILL mid-operation, crash during write, restart with in-progress work abandoned |
| **I/O failure** | Disk full, permission denied, file deleted between open and read, corrupted data |
| **Concurrency** | Two writers on the same record simultaneously, read-modify-write with interleaved writes, lock starvation |
| **Race conditions** | Event arrives before handler is registered, callback fires after object is disposed |
| **Partial success** | First item in a batch succeeds, second fails — is state consistent? Can it retry safely? |
| **Duplicate execution** | Same operation run twice — is it idempotent? Does it double-charge, double-insert? |

**How to test these:** inject failures using fakes/stubs that throw or hang on demand; run the same operation from concurrent promises and assert the final state is consistent; simulate failure at each step of a multi-step write and assert either full commit or full rollback — never half-written state.

```typescript
it('leaves no partial record if write fails after metadata is saved', async () => {
  const db = new FakeDb();
  db.failOnCall('writeContent', new Error('disk full'));

  await expect(saveDocument(db, doc)).rejects.toThrow();
  expect(await db.findMetadata(doc.id)).toBeNull();
});

it('is idempotent — processing the same event twice produces one record', async () => {
  await processEvent(event);
  await processEvent(event);

  expect(await db.count('records', { eventId: event.id })).toBe(1);
});
```

**Rarity is not an excuse to skip.** Code with no defined failure behavior has undefined behavior. Even deciding "this function does not need to be crash-safe" is better than never asking.

## When Writing New Code

Before marking any implementation complete, ask:
1. Did I derive intent before reading the implementation?
2. Does every public function have tests covering all input categories (happy path, empty, null, boundary, error)?
3. If I rewrote this function from scratch, would all my tests still be valid specs?
4. Have I been exhaustive — is any intended behavior untested?
5. Does any function handle user-supplied data? If so, have security inputs been added to the bad-input list?
6. Does any function touch external state? If so, have at least the most likely failure scenarios been tested?

## When Fixing a Bug

Write a test that **reproduces the bug first**, then fix it. The test proves the bug existed and won't regress.

Then go further — a bug is a signal, not an isolated incident:

**1. Test similar scenarios.** What variations of the failing conditions also exist? If a function fails on an empty string, does it also fail on whitespace-only? If it fails on the last item in a list, what about the first, or a single-item list? Write tests for adjacent cases, not just the exact one reported.

**2. Search for the same pattern elsewhere in the codebase.** Look for other code doing the same thing — same operation, same assumption, same structure. If the mistake was made once, it may exist elsewhere. For each match found, check whether the same bug could apply and write a test if so.

## When to Delete a Test

A wrong test is worse than no test — it signals safety that doesn't exist. Delete a test when:
- It tests implementation details and breaks on pure refactors
- It duplicates coverage already provided at a lower level
- The behavior it tested has been deliberately removed
- It is permanently flaky and cannot be made deterministic

When deleting, confirm the behavior is covered elsewhere or genuinely no longer needs to exist. Don't delete tests just because they're inconvenient to maintain — that's a signal the code needs redesign.

## Auditing Tests

Use this workflow when asked to audit tests or find gaps. Do not skip steps.

### Step 1 — Build the Coverage Map

**Before reading any test file**, enumerate every source file and every test file in the project. Do this with directory listings or glob tools — do not rely on memory or a prior summary.

1. List every source file (non-test, non-index) in every folder under `src/` (or the project root). Group by folder.
2. List every test file (`*.tests.ts`, `*.tests.tsx`, `*.spec.ts`, etc.).
3. Cross-reference: for each source file, does a corresponding test file exist? Mark untested files explicitly.

**Folders or files with zero test coverage are 🔴 High findings by default** — record them before you read a single test body. Do not skip a folder because it looks like "just UI components" or "thin wrappers"; record the gap and note why tests may be deferred if applicable.

This step prevents the most common audit failure: only auditing *quality* of existing tests while completely missing untested modules.

### Step 2 — Scan Existing Tests for Quality Gaps

For each file that *does* have tests, read the test body and apply every lens below. Record every gap found — do not skip items because fixing them seems out of scope.

| Category | What to check |
|----------|--------------|
| **Intent coverage** | Is every behavioral guarantee exercised by at least one test? Derive intent from name + signature + callers (never the body). |
| **Input partitioning** | Are good inputs, bad inputs, and boundary values all represented? Is there a test for null, empty, off-by-one, wrong type? |
| **Security inputs** | For code touching user data: are XSS, injection, path traversal, and oversized inputs tested? |
| **Resilience** | For code touching external state: are failure scenarios (connection drop, partial write, duplicate execution) covered? |
| **Mutation survival** | Are assertions specific enough to catch a real bug? Would they survive if the function returned a hardcoded plausible value? |
| **Test quality** | Are any tests flaky (real timers), testing implementation details, permanently wrong (break on refactor), or duplicating coverage from another level? |

### Step 2 — Report to User

Present all findings as a table before making any changes:

| Finding | Severity | Recommendation |
|---------|----------|----------------|
| `saveDocument` has no test for disk-full during write | 🔴 High | Inject `failOnCall('writeContent')` — assert no orphaned metadata row |
| `validateAge` assertions use `toBeTruthy` — survive mutations | 🟡 Medium | Assert specific values; add boundary values 0 and 120 to valid list |
| `processUser` test uses `setTimeout(500)` | 🟡 Medium | Replace with `vi.useFakeTimers()` — real timer = flakiness |
| `getUser` test name is `test1` | 🟢 Low | Rename to describe behavior: `returns null when user not found` |

**X gaps found (Y 🔴 high, Z 🟡 medium, W 🟢 low)**

Then ask: *"Which of these would you like me to fix? I can do all of them, just the high-severity ones, or specific items."*

### Severity Key

- 🔴 **High** — untested behavior that could fail silently in production: missing error paths, no security inputs for user-facing code, no resilience tests for external-state code, assertions that would never catch a real bug
- 🟡 **Medium** — not a bug today but a reliability or confidence risk: weak assertions, missing boundary coverage, real timers in async tests, missing input categories
- 🟢 **Low** — hygiene: stale tests, duplicate coverage, poor naming, redundant tests

### Step 3 — Agree on Scope

Confirm which gaps to address before proceeding. The user may want all of them, just high-severity, or specific items.

### Step 4 — Make the Changes

For each agreed gap, apply the relevant sections of this skill:
- Missing tests → write using Input Partitioning + intent-derivation process
- Weak assertions → strengthen to specific values; apply Mutation Testing Mindset
- Security gaps → add a `securityInputs` list with `test.each`
- Resilience gaps → inject failure using fakes/stubs
- Stale/wrong tests → delete or rewrite per "When to Delete a Test"

### Step 5 — Commit

Commit the changes with a clear message describing what was added, strengthened, or removed and why.

### Step 6 — Report to User

Summarise what was done:
- How many tests added / modified / deleted
- Which gaps were closed
- Any gaps deferred to a later session (and why)
- Any code that could not be tested without refactoring (flag for the user)

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Intent is unclear from name/signature alone | Stop — raise with user; code likely needs refactoring first |
| Reading the function body before writing tests | Read name + signature only; derive intent first |
| Test breaks after a pure refactor | Test is wrong — it tests implementation; rewrite to test behavior |
| Happy path only | Partition inputs into good/bad lists first, then iterate |
| One `it()` block per input value | Write one parameterized test per category; values go in the list |
| Inputs scattered across test bodies | Collect all inputs into explicit good/bad lists at the top |
| Testing implementation details or internal call counts | Assert observable outputs and external side effects only |
| One massive test per function | One test per scenario/input path |
| Mocking own internal modules | Redesign the interface or use an integration test |
| Vague assertions (`truthy`, `not null`) | Assert specific values — mutations must be caught |
| No security inputs for user-facing code | Add XSS, injection, path traversal, oversized inputs to bad list |
| `sleep` / real timers in async tests | Use fake timers and controlled promises — real time = flakiness |
| Manual input lists for large input spaces | Supplement with property-based testing (fast-check, hypothesis) |
| Tests pass but wouldn't catch real mutations | Assert specific values; run Stryker to find survivors |
| Keeping a permanently flaky or wrong test | Delete it — wrong tests are worse than no tests |

## Signs of a Healthy Test Suite

- Tests fail when **behavior** changes, not when implementation is refactored
- Each failing test name describes exactly what broke
- A new contributor can read the tests to understand the system
- The suite runs fast enough that developers run it constantly
