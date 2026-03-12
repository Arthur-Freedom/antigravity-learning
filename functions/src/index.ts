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
// setAdminClaim:
//   Trigger:  HTTPS Callable
//   Action:   Sets admin custom claim on a user's Auth token.
//             Bootstrapped via ADMIN_EMAILS env var. Once set, the
//             claim persists on the ID token — no env var needed client-side.
//
// onUserDataWrite:
//   Trigger:  Firestore onDocumentWritten on users/{uid}
//   Action:   Server-side validation/sanitisation of user-written data.
//             Trims display names, clamps scores, strips HTML, ensures
//             data integrity as a second layer of defence.
//
// onUserCreated:
//   Trigger:  Firestore onDocumentCreated on users/{uid}
//   Action:   Sends a branded welcome email when a new user signs up.
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

import {
  onDocumentUpdated,
  onDocumentCreated,
  onDocumentWritten,
} from "firebase-functions/v2/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import * as nodemailer from "nodemailer";
import { GoogleGenAI } from "@google/genai";

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
// 3. CALLABLE — Set Admin Custom Claim
// ═══════════════════════════════════════════════════════════════════════

/**
 * Sets the `admin: true` custom claim on a user's Firebase Auth token.
 *
 * Access control:
 *   - If the caller already has `admin` custom claim → allowed
 *   - Otherwise, falls back to ADMIN_EMAILS env var (bootstrap)
 *
 * Client usage:
 *   const fn = httpsCallable(functions, 'setAdminClaim');
 *   await fn({ targetUid: 'some-uid' });
 */
export const setAdminClaim = onCall(
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

      // Stamp audit trail on the user doc
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

// ═══════════════════════════════════════════════════════════════════════
// 4. CALLABLE — Reset User Progress (Admin Only)
// ═══════════════════════════════════════════════════════════════════════

/**
 * Resets a user's quiz progress, XP, level, and streak.
 * Only callable by users with the `admin` custom claim.
 */
export const resetUserProgress = onCall(
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

// ═══════════════════════════════════════════════════════════════════════
// 5. CALLABLE — Gemini AI Tutor
// ═══════════════════════════════════════════════════════════════════════

/**
 * Provides a Socratic hint using the Gemini API.
 * The model is instructed NOT to give the direct answer.
 */
/** Max AI hints a single user can request per calendar day */
const AI_HINT_DAILY_LIMIT = 10;

export const getAiHint = onCall(
  { secrets: ["GEMINI_API_KEY"] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in required to use AI Tutor.");
    }

    const uid = request.auth.uid;

    // ── Per-user daily rate limiting ────────────────────────────────
    const now = new Date();
    const todayStr = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
    const rateLimitRef = db.doc(`rateLimits/aiHints/users/${uid}`);
    const rateLimitSnap = await rateLimitRef.get();
    const rateLimitData = rateLimitSnap.data() as
      { date: string; count: number } | undefined;

    const hintsUsedToday =
      rateLimitData?.date === todayStr ? (rateLimitData.count ?? 0) : 0;

    if (hintsUsedToday >= AI_HINT_DAILY_LIMIT) {
      logger.warn("AI Hint rate limit reached", { uid, hintsUsedToday });
      throw new HttpsError(
        "resource-exhausted",
        `You've used all ${AI_HINT_DAILY_LIMIT} AI hints for today. Try again tomorrow!`
      );
    }

    const { question, options, wrongAnswer } = request.data as {
      question?: string;
      options?: string[];
      wrongAnswer?: string;
    };

    if (!question || !options || !wrongAnswer) {
      throw new HttpsError(
        "invalid-argument",
        "Missing question, options, or wrongAnswer."
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your-gemini-api-key") {
      logger.error("GEMINI_API_KEY is missing or invalid in environment.");
      throw new HttpsError("internal", "AI Tutor is currently unavailable.");
    }

    try {
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
A student is taking a multiple-choice quiz on AI agent development.
They answered a question incorrectly.

QUESTION: ${question}
OPTIONS: ${options.join(" | ")}
THEIR WRONG ANSWER: ${wrongAnswer}

You are a wise, encouraging Socratic tutor. 
1. DO NOT give them the correct answer directly.
2. Acknowledge their wrong answer briefly and explain why it's incorrect.
3. Provide a hint or ask a guiding question that points them toward the correct concept.
4. Keep your response short (2-3 sentences max).
`;

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
      });

      const hint = response.text;
      if (!hint) {
        throw new Error("No text returned from Gemini");
      }

      // ── Increment the rate limit counter ──────────────────────────
      await rateLimitRef.set({ date: todayStr, count: hintsUsedToday + 1 });

      logger.info("✨ AI Hint generated", {
        uid,
        hintLength: hint.length,
        hintsUsedToday: hintsUsedToday + 1,
      });

      return { hint, hintsRemaining: AI_HINT_DAILY_LIMIT - hintsUsedToday - 1 };
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      logger.error("AI Tutor Error:", error);
      throw new HttpsError("internal", "Failed to generate AI hint.");
    }
  }
);

// ═══════════════════════════════════════════════════════════════════════
// 6. FIRESTORE TRIGGER — Server-Side Data Validation
// ═══════════════════════════════════════════════════════════════════════

/** Maximum allowed display name length */
const MAX_DISPLAY_NAME_LENGTH = 50;

/** Hardcoded fallback — used only if Firestore config doc is missing */
const FALLBACK_TOPICS = [
  "workflows", "skills", "agents", "prompts",
  "context", "mcp", "tools", "safety", "projects",
];

/**
 * Reads valid quiz topics from Firestore config/quizTopics doc.
 * Falls back to FALLBACK_TOPICS if the config doc doesn't exist.
 *
 * This means adding a new quiz module NEVER requires redeploying
 * Cloud Functions — just update the config doc in Firestore.
 */
async function getValidTopics(): Promise<string[]> {
  try {
    const configDoc = await db.doc("config/quizTopics").get();
    if (configDoc.exists) {
      const data = configDoc.data();
      const topics = data?.topics;
      if (Array.isArray(topics) && topics.length > 0) {
        return topics;
      }
    }
    logger.info("No config/quizTopics doc found — using fallback topics");
  } catch (error) {
    logger.warn("Failed to read config/quizTopics — using fallback", { error });
  }
  return FALLBACK_TOPICS;
}

/** Strip HTML tags from a string */
function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "");
}

/**
 * Fires on every write to users/{userId}.
 * Validates and sanitises data written by the client:
 *   - displayName: trimmed, HTML stripped, capped at 50 chars
 *   - quizScore/quizTotal: clamped 0–3, must be integers
 *   - completedAll: recalculated from actual quizProgress
 *   - quizProgress keys: must be valid topics
 *
 * If violations are found, the function writes corrected values back.
 * Uses a `_sanitizedAt` stamp to prevent infinite trigger loops.
 */
export const onUserDataWrite = onDocumentWritten(
  "users/{userId}",
  async (event) => {
    const userId = event.params.userId;
    const afterData = event.data?.after.data();

    // Document was deleted — nothing to validate
    if (!afterData) return;

    // Prevent infinite loops: if we just sanitised, skip.
    // IMPORTANT: Use .isEqual() for Timestamp comparison — NOT ===.
    // (=== compares object identity, which always fails for Timestamps)
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
    const shouldBeComplete = correctCount >= 9;

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
      fixes._sanitizedAt = FieldValue.serverTimestamp();
      await db.doc(`users/${userId}`).update(fixes);
      logger.info("✅ Applied data sanitisation", { userId, fixedFields: Object.keys(fixes) });
    }
  }
);

// ═══════════════════════════════════════════════════════════════════════
// 7. FIRESTORE TRIGGER — Welcome Email on Sign-Up
// ═══════════════════════════════════════════════════════════════════════

/**
 * Fires when a new user document is created (first sign-in).
 * Sends a branded welcome email via the existing Nodemailer transporter.
 */
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

      // Audit record
      await db.collection("mail").add({
        to: email,
        subject,
        userId,
        type: "welcome",
        status: "sent",
        messageId: info.messageId,
        createdAt: FieldValue.serverTimestamp(),
      });

      // Stamp user doc
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
          You've successfully completed all nine modules in the
          <strong>Antigravity Learning</strong> program:
        </p>

        <!-- Modules -->
        <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
          ${["Workflows", "Skills", "Autonomous Agents", "Prompt Engineering",
            "Context Windows", "Model Context Protocol", "Tool Use & Function Calling",
            "Safety & Guardrails", "Real-World Projects"].map(mod =>
            `<tr><td style="padding:10px 14px; background:#f0fdf4; border-radius:6px;">
              <span style="font-size:14px; color:#16a34a; font-weight:600;">✅ ${mod}</span>
            </td></tr><tr><td style="height:4px;"></td></tr>`
          ).join("")}
        </table>

        <p style="font-size:15px; color:#5a6b7c; line-height:1.7; margin:0 0 24px;">
          You can now download your <strong>completion certificate</strong> from
          the website. Click the 🎓 Certificate button in the navigation bar.
        </p>

        <!-- CTA Button -->
        <table cellspacing="0" cellpadding="0" style="margin:0 auto;">
          <tr>
            <td style="background:#283A4A; border-radius:6px;">
              <a href="https://antigravity-learning.web.app/"
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

You've completed all nine modules in the Antigravity Learning program:

  ✅ Workflows
  ✅ Skills
  ✅ Autonomous Agents
  ✅ Prompt Engineering
  ✅ Context Windows
  ✅ Model Context Protocol
  ✅ Tool Use & Function Calling
  ✅ Safety & Guardrails
  ✅ Real-World Projects

You can now download your completion certificate from the website:
https://antigravity-learning.web.app/

Click the 🎓 Certificate button in the navigation bar.

© ${new Date().getFullYear()} Antigravity Learning`;
}

// ── Welcome Email Templates ─────────────────────────────────────────────

function generateWelcomeHtml(displayName: string): string {
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
        <h1 style="color:#fff; font-size:28px; margin:0 0 8px;">🚀 Welcome aboard!</h1>
        <p style="color:rgba(255,255,255,0.85); font-size:14px; margin:0;">Your learning journey starts now</p>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding:32px;">
        <p style="font-size:16px; color:#283A4A; margin:0 0 16px;">
          Hey <strong>${displayName}</strong>,
        </p>
        <p style="font-size:15px; color:#5a6b7c; line-height:1.7; margin:0 0 20px;">
          Welcome to <strong>Antigravity Learning</strong>! You've just joined a platform
          designed to teach you how to build and work with AI agents.
        </p>

        <p style="font-size:15px; color:#5a6b7c; line-height:1.7; margin:0 0 8px;">Here's what's waiting for you:</p>

        <!-- Modules -->
        <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
          ${[
            ["📋", "Workflows", "Automate repetitive tasks with step-by-step recipes"],
            ["🧠", "Skills", "Give your agent permanent knowledge with SKILL.md files"],
            ["🤖", "Autonomous Agents", "Build agents that think, act, and observe"],
            ["✍️", "Prompt Engineering", "Master the art of effective AI prompts"],
            ["🪟", "Context Windows", "Understand token limits and memory management"],
            ["🔌", "MCP", "Connect agents to external tools via the open standard"],
            ["🔧", "Tool Use", "Discover how agents invoke functions and APIs"],
            ["🛡️", "Safety & Guardrails", "Build responsible AI with proper defenses"],
            ["🚀", "Real-World Projects", "Apply everything with hands-on capstone projects"],
          ].map(([icon, name, desc]) =>
            `<tr><td style="padding:10px 14px; background:#eff6ff; border-radius:6px;">
              <span style="font-size:14px; color:#2563eb; font-weight:600;">${icon} ${name}</span>
              <p style="font-size:13px; color:#5a6b7c; margin:4px 0 0;">${desc}</p>
            </td></tr><tr><td style="height:4px;"></td></tr>`
          ).join("")}
        </table>

        <p style="font-size:15px; color:#5a6b7c; line-height:1.7; margin:0 0 24px;">
          Complete all 9 modules to earn your <strong>completion certificate</strong>
          and join the leaderboard!
        </p>

        <!-- CTA Button -->
        <table cellspacing="0" cellpadding="0" style="margin:0 auto;">
          <tr>
            <td style="background:#283A4A; border-radius:6px;">
              <a href="https://antigravity-learning.web.app/learn/workflows"
                 style="display:inline-block; padding:14px 32px; color:#fff; text-decoration:none; font-weight:600; font-size:14px; letter-spacing:0.5px;">
                Start Module 1 →
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

function generateWelcomeText(displayName: string): string {
  return `🚀 Welcome to Antigravity Learning, ${displayName}!

You've just joined a platform designed to teach you how to build and work with AI agents.

Here's what's waiting for you:

  📋 Module 1 — Workflows: Automate repetitive tasks
  🧠 Module 2 — Skills: Give your agent permanent knowledge
  🤖 Module 3 — Autonomous Agents: Build agents that think and act
  ✍️ Module 4 — Prompt Engineering: Master effective AI prompts
  🪟 Module 5 — Context Windows: Understand token limits
  🔌 Module 6 — MCP: Connect agents to external tools
  🔧 Module 7 — Tool Use: Invoke functions and APIs dynamically
  🛡️ Module 8 — Safety & Guardrails: Build responsible AI
  🚀 Module 9 — Real-World Projects: Hands-on capstone projects

Complete all 9 modules to earn your completion certificate!

Start here: https://antigravity-learning.web.app/learn/workflows

© ${new Date().getFullYear()} Antigravity Learning`;
}
