// ── Collection Name Constants ───────────────────────────────────────────
// Single source of truth for all Firestore collection names.
// Change them here — not in 15 scattered files.

export const COLLECTIONS = {
  USERS: 'users',
  AUDIT: 'audit',
  MAIL: 'mail',
} as const

// ── App-wide Thresholds ─────────────────────────────────────────────────
// Number of modules a user must pass to earn the certificate.
// Referenced by userService, leaderboardService, and inline-quiz.
export const MODULES_FOR_CERTIFICATE = 9
