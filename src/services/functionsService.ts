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
 * Request a Socratic hint from the Gemini AI Tutor.
 */
export async function getAiHintForQuiz(
  question: string,
  options: string[],
  wrongAnswer: string,
): Promise<string> {
  const getAiHint = httpsCallable<{ question: string; options: string[]; wrongAnswer: string }, { hint: string }>(
    functions,
    'getAiHint'
  );
  const result = await getAiHint({ question, options, wrongAnswer });
  return result.data.hint;
}
