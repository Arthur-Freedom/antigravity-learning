// ── Callable: Gemini AI Tutor ───────────────────────────────────────────
// Provides a Socratic hint using the Gemini API.
// Rate-limited to prevent abuse. The model is instructed NOT to give
// the direct answer.

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { getFirestore } from "firebase-admin/firestore";
import { GoogleGenAI } from "@google/genai";
import { AI_HINT_DAILY_LIMIT, AI_MODEL } from "../config";

export const getAiHint = onCall(
  { secrets: ["GEMINI_API_KEY"], invoker: "public" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in required to use AI Tutor.");
    }

    const uid = request.auth.uid;
    const db = getFirestore();

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
        model: AI_MODEL,
        contents: prompt,
      });

      const hint = response.text;
      if (!hint) {
        throw new Error("No text returned from Gemini");
      }

      // Increment the rate limit counter
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
