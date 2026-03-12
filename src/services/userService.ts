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
        xp: 0,
        level: 1,
        streak: 0,
        lastLoginDate: '',
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
      const completedAll = existingData.completedAll ?? (quizScore >= 9);
      const xp = existingData.xp ?? 0;
      const level = existingData.level ?? 1;
      const streak = existingData.streak ?? 0;
      const lastLoginDate = existingData.lastLoginDate ?? '';

      const updateFields: Record<string, unknown> = {
        photoURL: data.photoURL,
        quizScore,
        quizTotal,
        completedAll,
        xp,
        level,
        streak,
        lastLoginDate,
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
    const completedAll = quizScore >= 9;

    let xp = existing?.xp ?? 0;
    if (correct && !(existing?.quizProgress?.[topic]?.correct)) {
      xp += 50; // Award 50 XP for passing a quiz module
    }
    const level = Math.floor(Math.sqrt(xp / 100)) + 1;

    await updateDoc(ref, {
      [`quizProgress.${topic}`]: {
        correct,
        answeredAt: new Date().toISOString(),
      } satisfies QuizResult,
      quizScore,
      quizTotal,
      completedAll,
      xp,
      level,
      updatedAt: serverTimestamp(),
    });
    console.info(`[userService] Saved quiz result for ${topic}:`, correct,
      `(score: ${quizScore}/${quizTotal}, completedAll: ${completedAll}, xp: ${xp})`);

    // ── Read-back verification ──────────────────────────────────────
    // After a short delay, verify the data wasn't stripped by the
    // server-side sanitiser (onUserDataWrite). This catches deployment
    // mismatches where the Cloud Function doesn't recognise the topic.
    setTimeout(async () => {
      try {
        const verifySnap = await getDoc(ref);
        if (verifySnap.exists()) {
          const verifyData = verifySnap.data() as UserProfile;
          if (!verifyData.quizProgress?.[topic]) {
            console.error(
              `[userService] ⚠️ READ-BACK FAILED: Quiz result for "${topic}" was saved but then stripped by server!`,
              `This usually means the Cloud Function's VALID_TOPICS does not include "${topic}".`,
              `Fix: Add "${topic}" to the config/quizTopics Firestore doc or redeploy functions.`
            );
          }
        }
      } catch {
        // Verification is best-effort — don't block on failures
      }
    }, 2000);
  } catch (error) {
    console.error('[userService] saveQuizResult failed:', error);
  }
}

/**
 * Check the user's lastLoginDate and update their streak and XP daily.
 */
export async function applyDailyLoginStreak(uid: string): Promise<void> {
  try {
    const ref = doc(db, COLLECTIONS.USERS, uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const profile = snap.data() as UserProfile;
    const now = new Date();
    // Use local date string to keep it simple, e.g., '2023-10-25'
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    if (profile.lastLoginDate === todayStr) {
      // Already logged in today, do nothing
      return;
    }

    let newStreak = profile.streak ?? 0;
    let newXp = profile.xp ?? 0;

    if (!profile.lastLoginDate) {
      // First time tracking login
      newStreak = 1;
    } else {
      // Parse last login string
      const [y, m, d] = profile.lastLoginDate.split('-').map(Number);
      const lastLogin = new Date(y, m - 1, d);
      const diffTime = Math.abs(now.getTime() - lastLogin.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays === 1) {
        // Logged in yesterday
        newStreak += 1;
      } else {
        // Missed a day
        newStreak = 1;
      }
    }

    newXp += 10; // Daily login XP
    const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;

    await updateDoc(ref, {
      streak: newStreak,
      xp: newXp,
      level: newLevel,
      lastLoginDate: todayStr,
      updatedAt: serverTimestamp(),
    });
    console.info(`[userService] Applied daily login streak for ${uid}. Streak: ${newStreak}, XP: ${newXp}`);
  } catch (error) {
    console.error('[userService] applyDailyLoginStreak failed:', error);
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
  return correct >= 9;
}
