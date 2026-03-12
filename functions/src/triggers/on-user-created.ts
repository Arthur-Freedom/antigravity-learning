// ── Firestore Trigger: Welcome Email on Sign-Up ────────────────────────
// Fires when a new user document is created in Firestore.
// Sends a branded welcome email via Nodemailer.

import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import {
  createTransporter,
  generateWelcomeHtml,
  generateWelcomeText,
} from "../helpers/mail";

export const onUserCreated = onDocumentCreated(
  "users/{userId}",
  async (event) => {
    const userId = event.params.userId;
    const data = event.data?.data();

    if (!data) {
      logger.warn("onUserCreated: no data", { userId });
      return;
    }

    const displayName = data.displayName ?? "Learner";
    const email = data.email;

    if (!email) {
      logger.warn("New user has no email — skipping welcome.", { userId });
      return;
    }

    logger.info("👋 New user signed up!", { userId, displayName, email });

    const db = getFirestore();
    const subject = "🚀 Welcome to Antigravity Learning!";
    const html = generateWelcomeHtml(displayName);
    const text = generateWelcomeText(displayName);

    try {
      const transporter = createTransporter();

      const info = await transporter.sendMail({
        from: `"Antigravity Learning" <${process.env.SMTP_EMAIL}>`,
        to: email,
        subject,
        html,
        text,
      });

      logger.info("✉️  Welcome email sent!", {
        messageId: info.messageId,
        to: email,
      });

      await db.collection("mail").add({
        to: email,
        subject,
        userId,
        type: "welcome",
        status: "sent",
        messageId: info.messageId,
        createdAt: FieldValue.serverTimestamp(),
      });

      await db.doc(`users/${userId}`).update({
        welcomeEmailSentAt: FieldValue.serverTimestamp(),
      });
    } catch (error) {
      logger.error("❌ Failed to send welcome email:", error);

      await db.collection("mail").add({
        to: email,
        subject,
        userId,
        type: "welcome",
        status: "failed",
        error: String(error),
        createdAt: FieldValue.serverTimestamp(),
      });
    }
  }
);
