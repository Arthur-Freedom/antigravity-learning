// ── Scheduled: Daily Rate Limit Cleanup ──────────────────────────────────
// Runs at 1:00 AM UTC every day.
// Deletes stale AI hint rate limit documents from
// rateLimits/aiHints/users/{uid} where the date is older than today.
// These docs accumulate indefinitely as users request hints — old ones
// serve no purpose and waste storage.

import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions";
import { getFirestore } from "firebase-admin/firestore";

export const dailyRateLimitCleanup = onSchedule(
  {
    schedule: "0 1 * * *", // 1:00 AM UTC
    timeZone: "UTC",
    retryCount: 1,
  },
  async () => {
    const db = getFirestore();

    const now = new Date();
    const todayStr = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;

    logger.info("🧹 Rate limit cleanup starting", { todayStr });

    const snapshot = await db
      .collection("rateLimits/aiHints/users")
      .get();

    if (snapshot.empty) {
      logger.info("🧹 No rate limit docs to clean up");
      return;
    }

    const batch = db.batch();
    let deleted = 0;
    let kept = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (data.date !== todayStr) {
        batch.delete(doc.ref);
        deleted++;
      } else {
        kept++;
      }

      // Firestore batches max at 500 writes
      if (deleted > 0 && deleted % 500 === 0) {
        await batch.commit();
        logger.info(`🧹 Committed batch of ${deleted} deletions`);
      }
    }

    if (deleted % 500 !== 0 && deleted > 0) {
      await batch.commit();
    }

    logger.info(`🧹 Rate limit cleanup complete`, {
      deleted,
      kept,
      total: snapshot.size,
    });
  }
);
