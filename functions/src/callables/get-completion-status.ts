// ── Callable: Get Completion Status ─────────────────────────────────────
// Secure server-side check of quiz completion — reads directly from
// Firestore using the Admin SDK (bypasses security rules).

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { getFirestore } from "firebase-admin/firestore";

export const getCompletionStatus = onCall(
  { invoker: "public" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "You must be signed in to check completion status."
      );
    }

    const uid = request.auth.uid;

    try {
      const db = getFirestore();
      const userDoc = await db.doc(`users/${uid}`).get();

      if (!userDoc.exists) {
        return { completed: false, score: 0, total: 0 };
      }

      const data = userDoc.data()!;
      return {
        completed: data.completedAll === true,
        score: data.quizScore ?? 0,
        total: data.quizTotal ?? 0,
        displayName: data.displayName ?? "Learner",
        congratsEmailSent: !!data.congratsEmailSentAt,
      };
    } catch (error) {
      logger.error("getCompletionStatus failed:", error);
      throw new HttpsError("internal", "Failed to check completion status.");
    }
  }
);
