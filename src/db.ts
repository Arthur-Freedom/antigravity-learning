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
  type Firestore,
} from 'firebase/firestore';

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
  createdAt: unknown; // Firestore server timestamp
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
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(ref, profile);
      console.info('[db] Created new user profile:', uid);
    } else {
      // Returning user → update display info only
      await updateDoc(ref, {
        displayName: data.displayName,
        photoURL: data.photoURL,
        updatedAt: serverTimestamp(),
      });
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
    await updateDoc(ref, {
      [`quizProgress.${topic}`]: {
        correct,
        answeredAt: new Date().toISOString(),
      } satisfies QuizResult,
      updatedAt: serverTimestamp(),
    });
    console.info(`[db] Saved quiz result for ${topic}:`, correct);
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
