// ── Scheduled: Daily Streak Reset ───────────────────────────────────────
// Runs at midnight UTC every day.
// Resets the streak to 0 for users who haven't logged in within
// STREAK_EXPIRY_DAYS. Without this, a user who stops visiting keeps
// their streak frozen forever.

import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions";
import { getFirestore } from "firebase-admin/firestore";
import { STREAK_EXPIRY_DAYS } from "../config";

/**
 * Returns the date string for N days ago in YYYY-MM-DD format (UTC).
 */
function daysAgoStr(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export const dailyStreakReset = onSchedule(
  {
    schedule: "0 0 * * *", // midnight UTC
    timeZone: "UTC",
    retryCount: 1,
  },
  async () => {
    const db = getFirestore();
    const cutoff = daysAgoStr(STREAK_EXPIRY_DAYS);

    logger.info("🔥 Daily streak reset starting", { cutoff });

    // Query only on `streak > 0` (single field — no composite index needed).
    // Filter `lastLoginDate < cutoff` in-memory to avoid the Firestore
    // requirement for a composite index on two inequality fields.
    const snapshot = await db
      .collection("users")
      .where("streak", ">", 0)
      .get();

    if (snapshot.empty) {
      logger.info("🔥 No users with active streaks");
      return;
    }

    const batch = db.batch();
    let count = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const lastLogin = data.lastLoginDate as string | undefined;

      // Skip users who logged in recently (within cutoff)
      if (lastLogin && lastLogin >= cutoff) continue;

      batch.update(doc.ref, { streak: 0 });
      count++;

      // Firestore batches max at 500 writes
      if (count % 500 === 0) {
        await batch.commit();
        logger.info(`🔥 Committed batch of ${count} streak resets`);
      }
    }

    // Commit any remaining writes
    if (count % 500 !== 0) {
      await batch.commit();
    }

    logger.info(`🔥 Daily streak reset complete — ${count} users reset`, {
      count,
      cutoff,
    });
  }
);
