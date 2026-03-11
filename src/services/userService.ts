// ── User Service ────────────────────────────────────────────────────────
// All Firestore user CRUD goes through this module.
// Pattern: each user gets a document at  users/{uid}
// This service NEVER touches Firebase Auth — only Firestore.

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  getCountFromServer,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { COLLECTIONS } from '../constants/collections';
import type { UserProfile, QuizResult } from '../types/user';

// Re-export types for consumers
export type { UserProfile, QuizResult };

// ── Public API ──────────────────────────────────────────────────────────

/**
 * Creates or updates the user profile document on first sign-in.
 * Merges data so existing fields are not overwritten.
 */
export async function ensureUserProfile(
  uid: string,
  data: { displayName: string; email: string; photoURL: string | null }
): Promise<void> {
  try {
    const ref = doc(db, COLLECTIONS.USERS, uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      const profile: UserProfile = {
        displayName: data.displayName,
        email: data.email,
        photoURL: data.photoURL,
        quizProgress: {},
        quizScore: 0,
        quizTotal: 0,
        completedAll: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(ref, profile);
      console.info('[userService] Created new user profile:', uid);
    } else {
      const existingData = snap.data() as Partial<UserProfile>;
      const progress = existingData.quizProgress ?? {};
      const results = Object.values(progress);
      const quizScore = existingData.quizScore ?? results.filter(r => r.correct).length;
      const quizTotal = existingData.quizTotal ?? results.length;
      const completedAll = existingData.completedAll ?? (quizScore >= 3);

      const updateFields: Record<string, unknown> = {
        photoURL: data.photoURL,
        quizScore,
        quizTotal,
        completedAll,
        updatedAt: serverTimestamp(),
      };

      if (!existingData.displayName) {
        updateFields.displayName = data.displayName;
      }

      await updateDoc(ref, updateFields);
      console.info('[userService] Updated existing user profile:', uid);
    }
  } catch (error) {
    console.error('[userService] ensureUserProfile failed:', error);
  }
}

/**
 * Load the full user profile from Firestore.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const ref = doc(db, COLLECTIONS.USERS, uid);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as UserProfile) : null;
  } catch (error) {
    console.error('[userService] getUserProfile failed:', error);
    return null;
  }
}

/**
 * Save a quiz result for a specific topic.
 */
export async function saveQuizResult(
  uid: string,
  topic: string,
  correct: boolean
): Promise<void> {
  try {
    const ref = doc(db, COLLECTIONS.USERS, uid);
    const snap = await getDoc(ref);
    const existing = snap.exists() ? (snap.data() as UserProfile) : null;
    const progress = { ...(existing?.quizProgress ?? {}) };
    progress[topic] = { correct, answeredAt: new Date().toISOString() };

    const results = Object.values(progress);
    const quizScore = results.filter(r => r.correct).length;
    const quizTotal = results.length;
    const completedAll = quizScore >= 3;

    await updateDoc(ref, {
      [`quizProgress.${topic}`]: {
        correct,
        answeredAt: new Date().toISOString(),
      } satisfies QuizResult,
      quizScore,
      quizTotal,
      completedAll,
      updatedAt: serverTimestamp(),
    });
    console.info(`[userService] Saved quiz result for ${topic}:`, correct,
      `(score: ${quizScore}/${quizTotal}, completedAll: ${completedAll})`);
  } catch (error) {
    console.error('[userService] saveQuizResult failed:', error);
  }
}

/**
 * Update the user's display name in Firestore ONLY.
 * The caller is responsible for also updating Firebase Auth if needed.
 */
export async function updateDisplayName(
  uid: string,
  displayName: string
): Promise<void> {
  try {
    const ref = doc(db, COLLECTIONS.USERS, uid);
    await updateDoc(ref, {
      displayName,
      updatedAt: serverTimestamp(),
    });
    console.info('[userService] Updated display name:', displayName);
  } catch (error) {
    console.error('[userService] updateDisplayName failed:', error);
    throw error;
  }
}

/**
 * Update the user's profile photo URLs in Firestore.
 */
export async function updateProfilePhoto(
  uid: string,
  photoURL: string,
  customPhotoURL: string
): Promise<void> {
  try {
    const ref = doc(db, COLLECTIONS.USERS, uid);
    await updateDoc(ref, {
      photoURL,
      customPhotoURL,
      updatedAt: serverTimestamp(),
    });
    console.info('[userService] Updated profile photo');
  } catch (error) {
    console.error('[userService] updateProfilePhoto failed:', error);
    throw error;
  }
}

/**
 * Remove the user's custom profile photo (revert to Google photo).
 */
export async function removeProfilePhoto(
  uid: string,
  googlePhotoURL: string | null
): Promise<void> {
  try {
    const ref = doc(db, COLLECTIONS.USERS, uid);
    await updateDoc(ref, {
      photoURL: googlePhotoURL,
      customPhotoURL: null,
      updatedAt: serverTimestamp(),
    });
    console.info('[userService] Removed custom profile photo');
  } catch (error) {
    console.error('[userService] removeProfilePhoto failed:', error);
    throw error;
  }
}

// ── User Count ──────────────────────────────────────────────────────────

export async function getUserCount(): Promise<number> {
  try {
    const usersRef = collection(db, COLLECTIONS.USERS);
    const snapshot = await getCountFromServer(usersRef);
    return snapshot.data().count;
  } catch (error) {
    console.error('[userService] getUserCount failed:', error);
    return 0;
  }
}

/**
 * Check if user has completed all modules (eligible for certificate).
 */
export async function isCertificateEligible(uid: string): Promise<boolean> {
  const profile = await getUserProfile(uid);
  if (!profile?.quizProgress) return false;
  const correct = Object.values(profile.quizProgress).filter(r => r.correct).length;
  return correct >= 3;
}
