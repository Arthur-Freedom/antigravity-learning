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
