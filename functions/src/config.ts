// ── Centralised Configuration ───────────────────────────────────────────
// All "magic numbers" and tuneable constants live here.
// Values are read from Firestore `config/` docs at runtime where possible,
// falling back to these compile-time defaults.

import { getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";

// ── Compile-Time Defaults ───────────────────────────────────────────────

/** Max characters allowed in a display name */
export const MAX_DISPLAY_NAME_LENGTH = 50;

/** Max AI hints a single user can request per calendar day */
export const AI_HINT_DAILY_LIMIT = 10;

/** Number of quiz modules required for "completedAll" */
export const MODULES_REQUIRED_FOR_COMPLETION = 9;

/** Days of inactivity before daily cron resets a user's streak to 0 */
export const STREAK_EXPIRY_DAYS = 1;

/** Gemini model used by the AI Tutor */
export const AI_MODEL = "gemini-2.5-flash";

/**
 * Hardcoded fallback quiz topics — used ONLY when the Firestore
 * `config/quizTopics` document is missing or empty.
 */
export const FALLBACK_TOPICS: readonly string[] = [
  "workflows",
  "skills",
  "agents",
  "prompts",
  "context",
  "mcp",
  "tools",
  "safety",
  "projects",
] as const;

// ── Runtime Config (Firestore-Backed) ───────────────────────────────────

/**
 * Reads valid quiz topics from Firestore `config/quizTopics`.
 * Falls back to `FALLBACK_TOPICS` if the config doc doesn't exist.
 *
 * This means adding a new quiz module NEVER requires redeploying
 * Cloud Functions — just update the config doc in Firestore.
 */
export async function getValidTopics(): Promise<string[]> {
  try {
    const db = getFirestore();
    const configDoc = await db.doc("config/quizTopics").get();
    if (configDoc.exists) {
      const data = configDoc.data();
      const topics = data?.topics;
      if (Array.isArray(topics) && topics.length > 0) {
        return topics;
      }
    }
    logger.info("No config/quizTopics doc found — using fallback topics");
  } catch (error) {
    logger.warn("Failed to read config/quizTopics — using fallback", { error });
  }
  return [...FALLBACK_TOPICS];
}
