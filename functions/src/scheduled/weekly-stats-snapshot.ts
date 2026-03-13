// ── Scheduled: Weekly Stats Snapshot ─────────────────────────────────────
// Runs at 2:00 AM UTC every Monday.
// Snapshots platform-wide statistics into stats/weekly/{date} for basic
// analytics. Gives historical data without needing an external tool.

import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

export const weeklyStatsSnapshot = onSchedule(
  {
    schedule: "0 2 * * 1", // 2:00 AM UTC every Monday
    timeZone: "UTC",
    retryCount: 1,
  },
  async () => {
    const db = getFirestore();
    logger.info("📊 Weekly stats snapshot starting");

    const usersSnapshot = await db.collection("users").get();

    if (usersSnapshot.empty) {
      logger.info("📊 No users found — skipping snapshot");
      return;
    }

    let totalUsers = 0;
    let completedUsers = 0;
    let totalScore = 0;
    let totalXp = 0;
    let activeUsers7d = 0;

    // Calculate the date string for 7 days ago
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);
    const sevenDaysAgoStr = `${sevenDaysAgo.getUTCFullYear()}-${String(sevenDaysAgo.getUTCMonth() + 1).padStart(2, "0")}-${String(sevenDaysAgo.getUTCDate()).padStart(2, "0")}`;

    for (const doc of usersSnapshot.docs) {
      const data = doc.data();
      totalUsers++;

      if (data.completedAll === true) {
        completedUsers++;
      }

      totalScore += data.quizScore ?? 0;
      totalXp += data.xp ?? 0;

      if (data.lastLoginDate && data.lastLoginDate >= sevenDaysAgoStr) {
        activeUsers7d++;
      }
    }

    const averageScore = totalUsers > 0
      ? Math.round((totalScore / totalUsers) * 100) / 100
      : 0;

    const weekStr = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;

    const stats = {
      totalUsers,
      completedUsers,
      completionRate: totalUsers > 0
        ? Math.round((completedUsers / totalUsers) * 1000) / 10
        : 0,
      averageScore,
      activeUsers7d,
      totalXpAwarded: totalXp,
      timestamp: FieldValue.serverTimestamp(),
    };

    await db.doc(`stats/weekly/${weekStr}/snapshot`).set(stats);

    // Also update a "latest" doc for quick access
    await db.doc("stats/latest").set({
      ...stats,
      weekOf: weekStr,
    });

    logger.info("📊 Weekly stats snapshot complete", stats);
  }
);
