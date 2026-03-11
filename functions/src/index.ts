// ── Cloud Functions for Antigravity Learning ────────────────────────────
// Serverless backend logic deployed to Google Cloud.
//
// onQuizCompletion:
//   Trigger:  Firestore onDocumentUpdated on users/{uid}
//   Action:   When completedAll transitions false → true, send a real
//             congratulations email via Nodemailer (Gmail SMTP).
//
// getCompletionStatus:
//   Trigger:  HTTPS Callable (with App Check enforcement)
//   Action:   Secure server-side check of quiz completion.
//
// ── SMTP Setup (one-time) ───────────────────────────────────────────────
//
// Option A — .env file (simplest):
//   Create  functions/.env  with:
//     SMTP_EMAIL=your-gmail@gmail.com
//     SMTP_PASSWORD=your-16-char-app-password
//
// Option B — Firebase Secrets (Blaze plan required):
//   firebase functions:secrets:set SMTP_EMAIL
//   firebase functions:secrets:set SMTP_PASSWORD
//
// For Gmail, generate an App Password at:
//   https://myaccount.google.com/apppasswords
//   (requires 2-Step Verification enabled on your Google account)

import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import * as nodemailer from "nodemailer";

// ── Initialise Firebase Admin SDK ───────────────────────────────────────
if (!getApps().length) {
  initializeApp();
}
const db = getFirestore();

// ═══════════════════════════════════════════════════════════════════════
// HELPER — Create the Nodemailer transporter (Gmail SMTP)
// ═══════════════════════════════════════════════════════════════════════

function createTransporter() {
  const email = process.env.SMTP_EMAIL;
  const password = process.env.SMTP_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "SMTP_EMAIL and SMTP_PASSWORD must be set. " +
      "Create a functions/.env file or use firebase functions:secrets:set"
    );
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: email,
      pass: password,
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════
// 1. FIRESTORE TRIGGER — Congratulations Email on Quiz Completion
// ═══════════════════════════════════════════════════════════════════════

/**
 * Fires whenever a user document is updated.
 * If `completedAll` transitions from false → true, we:
 *   1. Log the achievement
 *   2. Send a real congratulations email via Gmail SMTP
 *   3. Write an audit record to Firestore `mail/` collection
 *   4. Stamp `congratsEmailSentAt` on the user doc to prevent duplicates
 */
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
    if (wasComplete || !isNowComplete) {
      return;
    }

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

    // ── Send the email via Nodemailer ────────────────────────────────
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

      // ── Write audit record to Firestore ───────────────────────────
      await db.collection("mail").add({
        to: email,
        subject,
        userId,
        type: "quiz_completion",
        status: "sent",
        messageId: info.messageId,
        createdAt: FieldValue.serverTimestamp(),
      });

      // ── Stamp the user doc so we never re-send ────────────────────
      await db.doc(`users/${userId}`).update({
        congratsEmailSentAt: FieldValue.serverTimestamp(),
      });

      logger.info("✅ Audit record saved & user doc stamped.", { userId });
    } catch (error) {
      logger.error("❌ Failed to send congratulations email:", error);

      // Still write an audit record so we know it failed
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

// ═══════════════════════════════════════════════════════════════════════
// 2. CALLABLE — Get completion status (secured server-side check)
// ═══════════════════════════════════════════════════════════════════════

/**
 * An HTTPS Callable function that verifies quiz completion server-side.
 * More secure than trusting client-side data — reads directly from
 * Firestore using the Admin SDK (bypasses security rules).
 *
 * Client usage:
 *   const { httpsCallable } = await import('firebase/functions');
 *   const fn = httpsCallable(functions, 'getCompletionStatus');
 *   const result = await fn();
 */
export const getCompletionStatus = onCall(
  { enforceAppCheck: true },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "You must be signed in to check completion status."
      );
    }

    const uid = request.auth.uid;

    try {
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

// ═══════════════════════════════════════════════════════════════════════
// EMAIL TEMPLATES
// ═══════════════════════════════════════════════════════════════════════

function generateCongratulationsHtml(displayName: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background:#f0f0f0; font-family:'Inter','Helvetica',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:40px auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <!-- Header -->
    <tr>
      <td style="background:linear-gradient(135deg,#283A4A 0%,#3178C6 100%); padding:40px 32px; text-align:center;">
        <h1 style="color:#fff; font-size:28px; margin:0 0 8px;">🎓 Congratulations!</h1>
        <p style="color:rgba(255,255,255,0.85); font-size:14px; margin:0;">You've completed all modules</p>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding:32px;">
        <p style="font-size:16px; color:#283A4A; margin:0 0 16px;">
          Hey <strong>${displayName}</strong>,
        </p>
        <p style="font-size:15px; color:#5a6b7c; line-height:1.7; margin:0 0 20px;">
          You've successfully completed all three modules in the
          <strong>Antigravity Learning</strong> program:
        </p>

        <!-- Modules -->
        <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
          <tr>
            <td style="padding:10px 14px; background:#f0fdf4; border-radius:6px; margin-bottom:8px;">
              <span style="font-size:14px; color:#16a34a; font-weight:600;">✅ Workflows</span>
            </td>
          </tr>
          <tr><td style="height:6px;"></td></tr>
          <tr>
            <td style="padding:10px 14px; background:#f0fdf4; border-radius:6px;">
              <span style="font-size:14px; color:#16a34a; font-weight:600;">✅ Skills</span>
            </td>
          </tr>
          <tr><td style="height:6px;"></td></tr>
          <tr>
            <td style="padding:10px 14px; background:#f0fdf4; border-radius:6px;">
              <span style="font-size:14px; color:#16a34a; font-weight:600;">✅ Autonomous Agents</span>
            </td>
          </tr>
        </table>

        <p style="font-size:15px; color:#5a6b7c; line-height:1.7; margin:0 0 24px;">
          You can now download your <strong>completion certificate</strong> from
          the website. Click the 🎓 Certificate button in the navigation bar.
        </p>

        <!-- CTA Button -->
        <table cellspacing="0" cellpadding="0" style="margin:0 auto;">
          <tr>
            <td style="background:#283A4A; border-radius:6px;">
              <a href="https://antigravity-learning.web.app/#/"
                 style="display:inline-block; padding:14px 32px; color:#fff; text-decoration:none; font-weight:600; font-size:14px; letter-spacing:0.5px;">
                Download Certificate →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding:20px 32px; background:#f8fafc; border-top:1px solid #e2e8f0; text-align:center;">
        <p style="font-size:12px; color:#94a3b8; margin:0;">
          © ${new Date().getFullYear()} Antigravity Learning · Built with ❤️ by AI agents
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function generateCongratulationsText(displayName: string): string {
  return `🎓 Congratulations, ${displayName}!

You've completed all three modules in the Antigravity Learning program:

  ✅ Workflows
  ✅ Skills
  ✅ Autonomous Agents

You can now download your completion certificate from the website:
https://antigravity-learning.web.app/#/

Click the 🎓 Certificate button in the navigation bar.

© ${new Date().getFullYear()} Antigravity Learning`;
}
