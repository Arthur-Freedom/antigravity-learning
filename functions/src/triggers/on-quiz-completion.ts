// ── Firestore Trigger: Quiz Completion Email ────────────────────────────
// Fires when a user document is updated. If `completedAll` transitions
// false → true, sends a congratulations email and stamps an audit trail.

import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import {
  createTransporter,
  generateCongratulationsHtml,
  generateCongratulationsText,
} from "../helpers/mail";

export const onQuizCompletion = onDocumentUpdated(
  "users/{userId}",
  async (event) => {
    const userId = event.params.userId;
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();

    if (!beforeData || !afterData) {
      logger.warn("Missing before/after data", { userId });
      return;
    }

    const wasComplete = beforeData.completedAll === true;
    const isNowComplete = afterData.completedAll === true;

    // Only fire when transitioning from incomplete → complete
    if (wasComplete || !isNowComplete) return;

    // Don't re-send if we already sent one
    if (afterData.congratsEmailSentAt) {
      logger.info("Congrats email already sent, skipping.", { userId });
      return;
    }

    const displayName = afterData.displayName ?? "Learner";
    const email = afterData.email;

    if (!email) {
      logger.warn("User has no email — cannot send congrats.", { userId });
      return;
    }

    logger.info("🎉 User completed all quizzes!", {
      userId,
      displayName,
      email,
      quizScore: afterData.quizScore,
    });

    const db = getFirestore();
    const subject = "🎓 Congratulations! You completed Antigravity Learning!";
    const html = generateCongratulationsHtml(displayName);
    const text = generateCongratulationsText(displayName);

    try {
      const transporter = createTransporter();

      const info = await transporter.sendMail({
        from: `"Antigravity Learning" <${process.env.SMTP_EMAIL}>`,
        to: email,
        subject,
        html,
        text,
      });

      logger.info("✉️  Email sent successfully!", {
        messageId: info.messageId,
        to: email,
      });

      // Audit record
      await db.collection("mail").add({
        to: email,
        subject,
        userId,
        type: "quiz_completion",
        status: "sent",
        messageId: info.messageId,
        createdAt: FieldValue.serverTimestamp(),
      });

      // Stamp the user doc so we never re-send
      await db.doc(`users/${userId}`).update({
        congratsEmailSentAt: FieldValue.serverTimestamp(),
      });

      logger.info("✅ Audit record saved & user doc stamped.", { userId });
    } catch (error) {
      logger.error("❌ Failed to send congratulations email:", error);

      await db.collection("mail").add({
        to: email,
        subject,
        userId,
        type: "quiz_completion",
        status: "failed",
        error: String(error),
        createdAt: FieldValue.serverTimestamp(),
      });
    }
  }
);
