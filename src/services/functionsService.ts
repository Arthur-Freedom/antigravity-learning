// ── Cloud Functions Service ─────────────────────────────────────────────
// Abstraction layer for calling Firebase Cloud Functions.
// UI components import from here — never from firebase/functions directly.

import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../lib/firebase';

const functions = getFunctions(app);

/**
 * Grant admin access (custom claim) to a user by UID.
 * Requires the caller to already be an admin.
 */
export async function grantAdminAccess(targetUid: string): Promise<void> {
  const setAdminClaim = httpsCallable(functions, 'setAdminClaim');
  await setAdminClaim({ targetUid });
}

/**
 * Reset a user's quiz progress, XP, level, and streak (admin only).
 */
export async function resetUserProgress(targetUid: string): Promise<void> {
  const fn = httpsCallable(functions, 'resetUserProgress');
  await fn({ targetUid });
}

/**
 * Request a Socratic hint from the Gemini AI Tutor.
 * Returns the hint text and how many hints remain today.
 */
export async function getAiHintForQuiz(
  question: string,
  options: string[],
  wrongAnswer: string,
): Promise<{ hint: string; hintsRemaining: number }> {
  const getAiHint = httpsCallable<
    { question: string; options: string[]; wrongAnswer: string },
    { hint: string; hintsRemaining: number }
  >(
    functions,
    'getAiHint'
  );
  const result = await getAiHint({ question, options, wrongAnswer });
  return result.data;
}
