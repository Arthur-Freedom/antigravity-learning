// ── Callable: Reset User Progress (Admin Only) ─────────────────────────
// Resets a user's quiz progress, XP, level, and streak.
// Only callable by users with the `admin` custom claim.

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

export const resetUserProgress = onCall(
  { invoker: "public" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }

    if (request.auth.token.admin !== true) {
      throw new HttpsError(
        "permission-denied",
        "Only administrators can reset user progress."
      );
    }

    const { targetUid } = request.data as { targetUid?: string };
    if (!targetUid) {
      throw new HttpsError("invalid-argument", "targetUid is required.");
    }

    try {
      const db = getFirestore();
      const userRef = db.doc(`users/${targetUid}`);
      const snap = await userRef.get();

      if (!snap.exists) {
        throw new HttpsError("not-found", `User ${targetUid} not found.`);
      }

      await userRef.update({
        quizProgress: {},
        quizScore: 0,
        quizTotal: 0,
        completedAll: false,
        xp: 0,
        level: 1,
        streak: 0,
        congratsEmailSentAt: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Audit trail
      await db.collection("audit").add({
        action: "reset_user_progress",
        targetUid,
        performedBy: request.auth.uid,
        timestamp: FieldValue.serverTimestamp(),
      });

      logger.info("✅ User progress reset", {
        targetUid,
        performedBy: request.auth.uid,
      });

      return { success: true, targetUid };
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      logger.error("Failed to reset user progress:", error);
      throw new HttpsError("internal", "Failed to reset user progress.");
    }
  }
);
