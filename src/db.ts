// ── Firestore Database Abstraction ──────────────────────────────────────
// All Firestore reads/writes go through this module.
// Pattern: each user gets a document at  users/{uid}

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
  where,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore';
import { getAuth, updateProfile } from 'firebase/auth';

// ── Firebase app (reuse existing instance from auth.ts) ─────────────────
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db: Firestore = getFirestore(app);

// ── Types ───────────────────────────────────────────────────────────────

export interface QuizResult {
  correct: boolean;
  answeredAt: string; // ISO timestamp
}

export interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string | null;
  theme: 'light' | 'dark';
  quizProgress: Record<string, QuizResult>;
  // ── Denormalized leaderboard fields (kept in sync on every quiz save) ──
  quizScore: number;     // count of correct answers
  quizTotal: number;     // count of total attempts
  completedAll: boolean; // true when quizScore >= 3
  createdAt: unknown;    // Firestore server timestamp
  updatedAt: unknown;
}

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
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      // First-time user → create full profile
      const profile: UserProfile = {
        displayName: data.displayName,
        email: data.email,
        photoURL: data.photoURL,
        theme: 'light',
        quizProgress: {},
        quizScore: 0,
        quizTotal: 0,
        completedAll: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(ref, profile);
      console.info('[db] Created new user profile:', uid);
    } else {
      // Returning user → update display info + backfill denormalized fields
      // Note: Do NOT overwrite displayName if user has a custom one in Firestore
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

      // Only set displayName if the user doesn't already have one in Firestore
      if (!existingData.displayName) {
        updateFields.displayName = data.displayName;
      }

      await updateDoc(ref, updateFields);
      console.info('[db] Updated existing user profile:', uid);
    }
  } catch (error) {
    console.error('[db] ensureUserProfile failed:', error);
  }
}

/**
 * Load the full user profile from Firestore.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as UserProfile) : null;
  } catch (error) {
    console.error('[db] getUserProfile failed:', error);
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
    const ref = doc(db, 'users', uid);

    // Read current progress to recalculate denormalized fields
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
    console.info(`[db] Saved quiz result for ${topic}:`, correct,
      `(score: ${quizScore}/${quizTotal}, completedAll: ${completedAll})`);
  } catch (error) {
    console.error('[db] saveQuizResult failed:', error);
  }
}

/**
 * Save the user's theme preference.
 */
export async function saveThemePreference(
  uid: string,
  theme: 'light' | 'dark'
): Promise<void> {
  try {
    const ref = doc(db, 'users', uid);
    await updateDoc(ref, {
      theme,
      updatedAt: serverTimestamp(),
    });
    console.info('[db] Saved theme preference:', theme);
  } catch (error) {
    console.error('[db] saveThemePreference failed:', error);
  }
}

/**
 * Update the user's display name in both Firestore and Firebase Auth.
 */
export async function updateDisplayName(
  uid: string,
  displayName: string
): Promise<void> {
  try {
    // Update Firestore
    const ref = doc(db, 'users', uid);
    await updateDoc(ref, {
      displayName,
      updatedAt: serverTimestamp(),
    });

    // Also update Firebase Auth profile so the name persists across reloads
    const currentUser = getAuth().currentUser;
    if (currentUser && currentUser.uid === uid) {
      await updateProfile(currentUser, { displayName });
    }

    console.info('[db] Updated display name:', displayName);
  } catch (error) {
    console.error('[db] updateDisplayName failed:', error);
    throw error;
  }
}

// ── Leaderboard ─────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL: string | null;
  score: number;      // number of correct quizzes
  total: number;      // total quizzes attempted
  completedAll: boolean;
}

/**
 * Fetch all users and rank them by quiz score.
 * Returns top N entries sorted by score descending.
 */
export async function getLeaderboard(topN = 20): Promise<LeaderboardEntry[]> {
  try {
    // ── Server-side query using composite index ──────────────────────
    // Index: quizScore DESC, quizTotal ASC → Firestore handles ranking.
    // Only users who have attempted at least 1 quiz are returned
    // (quizTotal > 0 filter via where clause).
    const usersRef = collection(db, 'users');
    const leaderboardQuery = query(
      usersRef,
      where('quizTotal', '>', 0),
      orderBy('quizScore', 'desc'),
      orderBy('quizTotal', 'asc'),
      limit(topN)
    );
    const snapshot = await getDocs(leaderboardQuery);

    const entries: LeaderboardEntry[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as UserProfile;
      entries.push({
        uid: docSnap.id,
        displayName: data.displayName ?? 'Anonymous',
        photoURL: data.photoURL ?? null,
        score: data.quizScore ?? 0,
        total: data.quizTotal ?? 0,
        completedAll: data.completedAll ?? false,
      });
    });

    return entries;
  } catch (error) {
    console.error('[db] getLeaderboard failed:', error);
    // Fallback: fetch all users and sort client-side (for existing data
    // that may not have denormalized fields yet)
    return getLeaderboardFallback(topN);
  }
}

/**
 * Fallback leaderboard that works without indexes or denormalized fields.
 * Used when the indexed query fails (e.g. indexes not deployed yet or
 * legacy data without quizScore/quizTotal fields).
 */
async function getLeaderboardFallback(topN: number): Promise<LeaderboardEntry[]> {
  try {
    console.info('[db] Using fallback leaderboard (client-side sort)');
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);

    const entries: LeaderboardEntry[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as UserProfile;
      const progress = data.quizProgress ?? {};
      const results = Object.values(progress);
      const correct = results.filter(r => r.correct).length;

      if (results.length > 0) {
        entries.push({
          uid: docSnap.id,
          displayName: data.displayName ?? 'Anonymous',
          photoURL: data.photoURL ?? null,
          score: correct,
          total: results.length,
          completedAll: correct >= 3,
        });
      }
    });

    entries.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.total - b.total;
    });

    return entries.slice(0, topN);
  } catch (fallbackError) {
    console.error('[db] Fallback leaderboard also failed:', fallbackError);
    return [];
  }
}

/**
 * Subscribe to real-time leaderboard updates via Firestore onSnapshot.
 * Calls `callback` with the latest sorted LeaderboardEntry[] whenever
 * any user document in the collection changes.
 *
 * @returns An unsubscribe function — call it to stop listening.
 */
export function onLeaderboardUpdate(
  topN: number,
  callback: (entries: LeaderboardEntry[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const usersRef = collection(db, 'users');

  const unsubscribe = onSnapshot(
    usersRef,
    (snapshot) => {
      const entries: LeaderboardEntry[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as UserProfile;
        const progress = data.quizProgress ?? {};
        const results = Object.values(progress);
        const correct = results.filter(r => r.correct).length;

        if (results.length > 0) {
          entries.push({
            uid: docSnap.id,
            displayName: data.displayName ?? 'Anonymous',
            photoURL: data.photoURL ?? null,
            score: correct,
            total: results.length,
            completedAll: correct >= 3,
          });
        }
      });

      // Sort: score desc, then fewer attempts first
      entries.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.total - b.total;
      });

      callback(entries.slice(0, topN));
    },
    (error) => {
      console.error('[db] onLeaderboardUpdate error:', error);
      onError?.(error);
    },
  );

  console.info('[db] 🔴 Real-time leaderboard listener attached');
  return unsubscribe;
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
