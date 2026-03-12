// ── Firestore Trigger: Server-Side Data Validation ──────────────────────
// Fires on every write to users/{userId}.
// Validates and sanitises client-written data as a second layer of defence.

import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import {
  MAX_DISPLAY_NAME_LENGTH,
  MODULES_REQUIRED_FOR_COMPLETION,
  getValidTopics,
} from "../config";
import { stripHtml } from "../helpers/sanitize";

export const onUserDataWrite = onDocumentWritten(
  "users/{userId}",
  async (event) => {
    const userId = event.params.userId;
    const afterData = event.data?.after.data();

    // Document was deleted — nothing to validate
    if (!afterData) return;

    // Prevent infinite loops: if we just sanitised, skip.
    // IMPORTANT: Use .isEqual() for Timestamp comparison — NOT ===.
    const beforeData = event.data?.before.data();
    if (
      afterData._sanitizedAt &&
      beforeData?._sanitizedAt &&
      typeof afterData._sanitizedAt.isEqual === "function" &&
      afterData._sanitizedAt.isEqual(beforeData._sanitizedAt)
    ) {
      return;
    }

    const fixes: Record<string, unknown> = {};
    let needsFix = false;

    // ── Display name validation ─────────────────────────────────────
    if (typeof afterData.displayName === "string") {
      const cleaned = stripHtml(afterData.displayName).trim();
      const capped = cleaned.slice(0, MAX_DISPLAY_NAME_LENGTH);
      if (capped !== afterData.displayName) {
        fixes.displayName = capped || "Learner";
        needsFix = true;
        logger.warn("Sanitised displayName", {
          userId,
          original: afterData.displayName,
          fixed: fixes.displayName,
        });
      }
    }

    // ── Quiz score validation ───────────────────────────────────────
    const progress = afterData.quizProgress ?? {};
    const validTopics = await getValidTopics();
    const validProgress: Record<string, unknown> = {};
    let invalidKeys = false;

    for (const [key, value] of Object.entries(progress)) {
      if (validTopics.includes(key)) {
        validProgress[key] = value;
      } else {
        invalidKeys = true;
        logger.warn("Removed invalid quiz topic", { userId, key, validTopics });
      }
    }

    if (invalidKeys) {
      fixes.quizProgress = validProgress;
      needsFix = true;
    }

    // Recalculate denormalised fields from actual progress
    const results = Object.values(validProgress) as Array<{ correct?: boolean }>;
    const correctCount = results.filter((r) => r.correct === true).length;
    const totalCount = results.length;
    const shouldBeComplete = correctCount >= MODULES_REQUIRED_FOR_COMPLETION;

    if (
      afterData.quizScore !== correctCount ||
      afterData.quizTotal !== totalCount ||
      afterData.completedAll !== shouldBeComplete
    ) {
      fixes.quizScore = correctCount;
      fixes.quizTotal = totalCount;
      fixes.completedAll = shouldBeComplete;
      needsFix = true;
      logger.warn("Recalculated denormalised quiz fields", {
        userId,
        correctCount,
        totalCount,
        shouldBeComplete,
      });
    }

    // ── Apply fixes ─────────────────────────────────────────────────
    if (needsFix) {
      const db = getFirestore();
      fixes._sanitizedAt = FieldValue.serverTimestamp();
      await db.doc(`users/${userId}`).update(fixes);
      logger.info("✅ Applied data sanitisation", {
        userId,
        fixedFields: Object.keys(fixes),
      });
    }
  }
);
