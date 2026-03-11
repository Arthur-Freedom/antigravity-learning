// ── Auth Service ────────────────────────────────────────────────────────
// Pure authentication logic — ZERO DOM manipulation.
// UI components import from here; this file never touches the DOM.

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import type { AppUser } from '../types/user';

const provider = new GoogleAuthProvider();

// ── Helpers ─────────────────────────────────────────────────────────────

/** Map Firebase User → AppUser (strips provider-specific fields) */
function toAppUser(user: User): AppUser {
  return {
    uid: user.uid,
    displayName: user.displayName ?? 'User',
    email: user.email ?? '',
    photoURL: user.photoURL,
  };
}

// ── Public API ──────────────────────────────────────────────────────────

/** Returns the currently signed-in user mapped to AppUser, or null */
export function getCurrentUser(): AppUser | null {
  const user = auth.currentUser;
  return user ? toAppUser(user) : null;
}

/** Returns the raw Firebase User (only for cases that truly need it, like getIdTokenResult) */
export function getRawFirebaseUser(): User | null {
  return auth.currentUser;
}

/**
 * Subscribe to auth state changes.
 * Callback receives an AppUser or null — never a raw Firebase User.
 */
export function onAuthChange(callback: (user: AppUser | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, (fbUser) => {
    callback(fbUser ? toAppUser(fbUser) : null);
  });
}

/** Trigger the Google sign-in popup */
export async function loginWithGoogle(): Promise<AppUser | null> {
  try {
    const result = await signInWithPopup(auth, provider);
    return toAppUser(result.user);
  } catch (error) {
    console.error('[auth] Google sign-in failed:', error);
    return null;
  }
}

/** Update the current Auth user profile */
export async function updateAuthProfile(
  data: { displayName?: string | null; photoURL?: string | null }
): Promise<void> {
  if (auth.currentUser) {
    try {
      await updateProfile(auth.currentUser, data);
    } catch (error) {
      console.error('[auth] Failed to update auth profile:', error);
      throw error;
    }
  }
}

/** Sign the current user out */
export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('[auth] Sign-out failed:', error);
  }
}
