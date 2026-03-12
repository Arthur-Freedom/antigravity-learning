// ── Callable: Set Admin Custom Claim ────────────────────────────────────
// Sets `admin: true` custom claim on a user's Firebase Auth token.
// Bootstrap: ADMIN_EMAILS env var allows first admin to self-promote.

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

export const setAdminClaim = onCall(
  { invoker: "public" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }

    const callerUid = request.auth.uid;
    const callerEmail = request.auth.token.email ?? "";
    const isCallerAdmin = request.auth.token.admin === true;

    // Bootstrap: allow env-listed emails to self-promote
    const adminEmails = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (!isCallerAdmin && !adminEmails.includes(callerEmail.toLowerCase())) {
      throw new HttpsError(
        "permission-denied",
        "Only administrators can grant admin access."
      );
    }

    const targetUid = (request.data as { targetUid?: string })?.targetUid ?? callerUid;

    try {
      await getAuth().setCustomUserClaims(targetUid, { admin: true });

      const db = getFirestore();
      await db.doc(`users/${targetUid}`).update({
        isAdmin: true,
        adminGrantedBy: callerUid,
        adminGrantedAt: FieldValue.serverTimestamp(),
      });

      logger.info("✅ Admin claim set", { targetUid, grantedBy: callerUid });
      return { success: true, targetUid };
    } catch (error) {
      logger.error("Failed to set admin claim:", error);
      throw new HttpsError("internal", "Failed to set admin claim.");
    }
  }
);
