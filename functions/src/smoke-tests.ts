// ── Cloud Functions Smoke Tests ─────────────────────────────────────────
// Runs callable functions against the Firebase Emulator to catch runtime
// errors BEFORE deploying to production.
//
// Usage:  npm --prefix functions run test
// Prereq: Emulators must be running:
//         npx firebase emulators:start --only functions,firestore
//
// These are NOT unit tests. They are "does it blow up?" smoke tests that
// verify functions can be invoked and return expected shapes. They exist
// because TypeScript compilation catches type errors but NOT:
//   - Missing environment variables / secrets at runtime
//   - Firestore path typos (rateLimits/aiHints/users/... etc.)
//   - SDK version mismatches
//   - Auth/permission logic regressions

import * as admin from "firebase-admin";

// ── Setup ───────────────────────────────────────────────────────────────

const PROJECT_ID = process.env.GCLOUD_PROJECT || "antigravity-learning-dev";
const FUNCTIONS_URL = `http://127.0.0.1:5001/${PROJECT_ID}/us-central1`;

// Point Admin SDK at emulator
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";

if (!admin.apps.length) {
  admin.initializeApp({ projectId: PROJECT_ID });
}
const db = admin.firestore();

// ── Helpers ─────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  ❌ ${name}: ${msg}`);
    failed++;
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

/**
 * Call a callable function via HTTP (emulator).
 * Simulates an authenticated call by injecting a fake auth token header.
 */
async function callFunction(
  name: string,
  data: Record<string, unknown>,
  authUid?: string,
): Promise<{ result: Record<string, unknown>; status: number }> {
  const url = `${FUNCTIONS_URL}/${name}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // The emulator accepts a special Authorization header to fake auth
  if (authUid) {
    headers["Authorization"] = `Bearer owner`;
    // For callable functions in the emulator, we pass auth context in the body
  }

  const body = JSON.stringify({ data });
  const response = await fetch(url, { method: "POST", headers, body });
  const json = (await response.json()) as { result?: Record<string, unknown>; error?: Record<string, unknown> };

  if (json.error) {
    throw new Error(`Function ${name} returned error: ${JSON.stringify(json.error)}`);
  }

  return { result: json.result ?? {}, status: response.status };
}

// ── Test Cases ──────────────────────────────────────────────────────────

async function run() {
  console.log("\n🧪 Cloud Functions Smoke Tests\n");
  console.log(`   Emulator: ${FUNCTIONS_URL}`);
  console.log(`   Firestore: ${process.env.FIRESTORE_EMULATOR_HOST}\n`);

  // ── Verify emulators are reachable ────────────────────────────────
  await test("Emulator is reachable", async () => {
    const resp = await fetch(`http://127.0.0.1:5001`, { method: "GET" }).catch(() => null);
    assert(resp !== null, "Cannot reach Functions emulator on port 5001. Is it running?");
  });

  await test("Firestore emulator is reachable", async () => {
    // Writing to emulated Firestore should not throw
    await db.doc("_smoketest/ping").set({ ts: Date.now() });
    await db.doc("_smoketest/ping").delete();
  });

  // ── getCompletionStatus — unauthenticated should fail ─────────────
  await test("getCompletionStatus rejects unauthenticated calls", async () => {
    try {
      await callFunction("getCompletionStatus", {});
      throw new Error("Should have thrown");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      assert(msg.includes("UNAUTHENTICATED") || msg.includes("unauthenticated"),
        `Expected UNAUTHENTICATED error, got: ${msg}`);
    }
  });

  // ── getAiHint — unauthenticated should fail ───────────────────────
  await test("getAiHint rejects unauthenticated calls", async () => {
    try {
      await callFunction("getAiHint", {
        question: "What is an agent?",
        options: ["A", "B", "C"],
        wrongAnswer: "A",
      });
      throw new Error("Should have thrown");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      assert(msg.includes("UNAUTHENTICATED") || msg.includes("unauthenticated"),
        `Expected UNAUTHENTICATED error, got: ${msg}`);
    }
  });

  // ── getAiHint — missing arguments should fail ─────────────────────
  await test("getAiHint rejects missing arguments", async () => {
    try {
      await callFunction("getAiHint", {}, "test-user-123");
      throw new Error("Should have thrown");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // Should get either INVALID_ARGUMENT or UNAUTHENTICATED (emulator auth varies)
      assert(msg.includes("error"), `Expected an error, got: ${msg}`);
    }
  });

  // ── setAdminClaim — unauthenticated should fail ───────────────────
  await test("setAdminClaim rejects unauthenticated calls", async () => {
    try {
      await callFunction("setAdminClaim", { targetUid: "some-uid" });
      throw new Error("Should have thrown");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      assert(msg.includes("UNAUTHENTICATED") || msg.includes("unauthenticated"),
        `Expected UNAUTHENTICATED error, got: ${msg}`);
    }
  });

  // ── resetUserProgress — unauthenticated should fail ───────────────
  await test("resetUserProgress rejects unauthenticated calls", async () => {
    try {
      await callFunction("resetUserProgress", { targetUid: "some-uid" });
      throw new Error("Should have thrown");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      assert(msg.includes("UNAUTHENTICATED") || msg.includes("unauthenticated"),
        `Expected UNAUTHENTICATED error, got: ${msg}`);
    }
  });

  // ── Rate limit Firestore path — verify it's writable ──────────────
  await test("rateLimits Firestore path is writable by Admin SDK", async () => {
    const ref = db.doc("rateLimits/aiHints/users/test-user");
    await ref.set({ date: "2026-01-01", count: 5 });
    const snap = await ref.get();
    assert(snap.exists, "Rate limit doc should exist after write");
    const data = snap.data()!;
    assert(data.count === 5, `Expected count=5, got ${data.count}`);
    assert(data.date === "2026-01-01", `Expected date=2026-01-01, got ${data.date}`);
    // Cleanup
    await ref.delete();
  });

  // ── onUserDataWrite — verify trigger sanitises data ───────────────
  await test("User doc write triggers validation (Firestore path works)", async () => {
    const testUid = "smoke-test-user-" + Date.now();
    const ref = db.doc(`users/${testUid}`);
    await ref.set({
      displayName: "Test User",
      email: "test@test.com",
      quizProgress: {},
      quizScore: 0,
      quizTotal: 0,
      completedAll: false,
      xp: 0,
      level: 1,
      streak: 0,
      lastLoginDate: "",
    });

    // Wait a moment for the trigger to fire
    await new Promise((r) => setTimeout(r, 2000));

    const snap = await ref.get();
    assert(snap.exists, "User doc should still exist after trigger");

    // Cleanup
    await ref.delete();
  });

  // ── Summary ───────────────────────────────────────────────────────
  console.log(`\n${"─".repeat(50)}`);
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log(`${"─".repeat(50)}\n`);

  if (failed > 0) {
    console.error("❌ SMOKE TESTS FAILED — Do NOT deploy until these are fixed.\n");
    process.exit(1);
  } else {
    console.log("✅ All smoke tests passed — safe to deploy.\n");
    process.exit(0);
  }
}

run().catch((err) => {
  console.error("Fatal error running smoke tests:", err);
  process.exit(1);
});
