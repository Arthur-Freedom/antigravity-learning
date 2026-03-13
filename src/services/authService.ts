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

/** Get the original Google photo URL from the provider data, ignoring custom photoURL overrides */
export function getGooglePhotoURL(): string | null {
  const user = auth.currentUser;
  if (!user) return null;
  const googleProvider = user.providerData.find(p => p.providerId === 'google.com');
  return googleProvider?.photoURL || null;
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

/** Result of a login attempt */
export type LoginResult =
  | { status: 'success'; user: AppUser }
  | { status: 'cancelled' }
  | { status: 'disabled' }
  | { status: 'error'; message: string };

/** Trigger the Google sign-in popup */
export async function loginWithGoogle(): Promise<LoginResult> {
  try {
    const result = await signInWithPopup(auth, provider);
    return { status: 'success', user: toAppUser(result.user) };
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;

    if (code === 'auth/user-disabled') {
      console.warn('[auth] Account is disabled.');
      return { status: 'disabled' };
    }

    // User closed the popup — not an error
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      return { status: 'cancelled' };
    }

    console.error('[auth] Google sign-in failed:', error);
    return { status: 'error', message: (error as Error).message ?? 'Sign-in failed' };
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

/**
 * Check whether the currently signed-in user has the `admin` custom claim.
 * Reads from the ID token JWT — no Firestore round-trip required.
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;
  try {
    const token = await user.getIdTokenResult();
    return token.claims.admin === true;
  } catch {
    return false;
  }
}

// Re-export Unsubscribe type so consumers import from this service,
// never directly from 'firebase/auth'.
export type { Unsubscribe };
