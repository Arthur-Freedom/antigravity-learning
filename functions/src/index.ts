// ── Cloud Functions for Antigravity Learning ────────────────────────────
// Barrel file — re-exports all functions from their dedicated modules.
//
// Architecture:
//   src/
//   ├── index.ts              ← This file (slim re-exports)
//   ├── config.ts             ← All tuneable constants
//   ├── helpers/
//   │   ├── mail.ts           ← Nodemailer transporter + email templates
//   │   └── sanitize.ts       ← Input sanitisation utilities
//   ├── triggers/
//   │   ├── on-quiz-completion.ts   (Firestore onUpdated)
//   │   ├── on-user-created.ts      (Firestore onCreated)
//   │   └── on-user-data-write.ts   (Firestore onWritten)
//   ├── callables/
//   │   ├── get-completion-status.ts (HTTPS Callable)
//   │   ├── set-admin-claim.ts       (HTTPS Callable)
//   │   ├── reset-user-progress.ts   (HTTPS Callable)
//   │   └── get-ai-hint.ts           (HTTPS Callable)
//   └── scheduled/
//       ├── daily-streak-reset.ts    (Cron: midnight UTC)
//       ├── daily-rate-limit-cleanup.ts (Cron: 1 AM UTC)
//       └── weekly-stats-snapshot.ts  (Cron: Mon 2 AM UTC)
//
// SMTP Setup:
//   firebase functions:secrets:set SMTP_EMAIL
//   firebase functions:secrets:set SMTP_PASSWORD
//   (Gmail App Password: https://myaccount.google.com/apppasswords)

import { initializeApp, getApps } from "firebase-admin/app";

// ── Initialise Firebase Admin SDK ───────────────────────────────────────
if (!getApps().length) {
  initializeApp();
}

// ── Triggers ────────────────────────────────────────────────────────────
export { onQuizCompletion } from "./triggers/on-quiz-completion";
export { onUserCreated } from "./triggers/on-user-created";
export { onUserDataWrite } from "./triggers/on-user-data-write";

// ── Callables ───────────────────────────────────────────────────────────
export { getCompletionStatus } from "./callables/get-completion-status";
export { setAdminClaim } from "./callables/set-admin-claim";
export { resetUserProgress } from "./callables/reset-user-progress";
export { getAiHint } from "./callables/get-ai-hint";

// ── Scheduled (Cron) ────────────────────────────────────────────────────
export { dailyStreakReset } from "./scheduled/daily-streak-reset";
export { dailyRateLimitCleanup } from "./scheduled/daily-rate-limit-cleanup";
export { weeklyStatsSnapshot } from "./scheduled/weekly-stats-snapshot";
