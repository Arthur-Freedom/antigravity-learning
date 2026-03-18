// ── Scheduled: Weekly Nudge Email ────────────────────────────────────────
// Runs at 10:00 AM UTC every Sunday.
// Sends a re-engagement email to users who:
//   1. Haven't completed all modules yet
//   2. Haven't been active in the past 3 days
//   3. Haven't received a nudge email in the past 7 days

import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import {
  createTransporter,
  generateNudgeHtml,
  generateNudgeText,
  getEnvironmentPrefix,
  ALL_MODULES,
} from "../helpers/mail";

export const weeklyNudgeEmail = onSchedule(
  {
    schedule: "0 10 * * 0", // 10:00 AM UTC every Sunday
    timeZone: "UTC",
    retryCount: 1,
    secrets: ["SMTP_EMAIL", "SMTP_PASSWORD"],
  },
  async () => {
    const db = getFirestore();
    logger.info("📬 Weekly nudge email job starting");

    const usersSnapshot = await db.collection("users").get();

    if (usersSnapshot.empty) {
      logger.info("📬 No users found — skipping nudge");
      return;
    }

    const now = new Date();
    const threeDaysAgo = new Date(now);
    threeDaysAgo.setUTCDate(threeDaysAgo.getUTCDate() - 3);

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);

    let sent = 0;
    let skipped = 0;

    for (const doc of usersSnapshot.docs) {
      const data = doc.data();
      const userId = doc.id;

      // Skip users who completed everything
      if (data.completedAll === true) {
        skipped++;
        continue;
      }

      // Skip users without email
      const email = data.email;
      if (!email) {
        skipped++;
        continue;
      }

      // Skip recently active users (active in the last 3 days)
      if (data.lastLoginDate) {
        const lastLogin = new Date(data.lastLoginDate);
        if (lastLogin > threeDaysAgo) {
          skipped++;
          continue;
        }
      }

      // Skip if we already sent a nudge within the past 7 days
      if (data.nudgeEmailSentAt) {
        const lastNudge = data.nudgeEmailSentAt instanceof Timestamp
          ? data.nudgeEmailSentAt.toDate()
          : new Date(data.nudgeEmailSentAt);
        if (lastNudge > sevenDaysAgo) {
          skipped++;
          continue;
        }
      }

      // Determine completed modules and next module
      const completedSlugs: string[] = [];
      for (const mod of ALL_MODULES) {
        if (data[`quiz_${mod.slug}`]?.passed === true) {
          completedSlugs.push(mod.slug);
        }
      }

      const completedCount = completedSlugs.length;
      const nextModule = ALL_MODULES.find(m => !completedSlugs.includes(m.slug));
      if (!nextModule) {
        // Somehow they completed all but completedAll wasn't set — skip
        skipped++;
        continue;
      }

      const displayName = data.displayName ?? "Learner";
      const subject = `${getEnvironmentPrefix()}🔥 You're ${completedCount}/${ALL_MODULES.length} done — keep going!`;
      const html = generateNudgeHtml(displayName, completedCount, nextModule.slug, nextModule.name);
      const text = generateNudgeText(displayName, completedCount, nextModule.slug, nextModule.name);

      try {
        const transporter = createTransporter();

        const info = await transporter.sendMail({
          from: `"Antigravity Learning" <${process.env.SMTP_EMAIL}>`,
          to: email,
          subject,
          html,
          text,
        });

        // Audit record
        await db.collection("mail").add({
          to: email,
          subject,
          userId,
          type: "nudge",
          status: "sent",
          messageId: info.messageId,
          completedCount,
          nextModule: nextModule.slug,
          createdAt: FieldValue.serverTimestamp(),
        });

        // Stamp the user doc so we rate-limit nudges
        await db.doc(`users/${userId}`).update({
          nudgeEmailSentAt: FieldValue.serverTimestamp(),
        });

        sent++;
        logger.info("📬 Nudge sent", { userId, email: email.substring(0, 3) + "***", completedCount });
      } catch (error) {
        logger.error("❌ Failed to send nudge email:", { userId, error: String(error) });

        await db.collection("mail").add({
          to: email,
          subject,
          userId,
          type: "nudge",
          status: "failed",
          error: String(error),
          createdAt: FieldValue.serverTimestamp(),
        });
      }
    }

    logger.info("📬 Weekly nudge job complete", { sent, skipped });
  }
);
