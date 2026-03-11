// ── Leaderboard Service ─────────────────────────────────────────────────
// All leaderboard queries, real-time listeners, and activity feed data.
// Firestore-only — no Auth, no DOM.

import {
  collection,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { COLLECTIONS } from '../constants/collections';
import type {
  UserProfile,
  LeaderboardEntry,
  RecentSignup,
  RecentAction,
} from '../types/user';

// Re-export types for consumers
export type { LeaderboardEntry, RecentSignup, RecentAction };

// ── Leaderboard ─────────────────────────────────────────────────────────

export async function getLeaderboard(topN = 20): Promise<LeaderboardEntry[]> {
  try {
    const usersRef = collection(db, COLLECTIONS.USERS);
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
        xp: data.xp ?? 0,
        level: data.level ?? 1,
      });
    });

    return entries;
  } catch (error) {
    console.error('[leaderboardService] getLeaderboard failed:', error);
    return getLeaderboardFallback(topN);
  }
}

async function getLeaderboardFallback(topN: number): Promise<LeaderboardEntry[]> {
  try {
    console.info('[leaderboardService] Using fallback (client-side sort)');
    const usersRef = collection(db, COLLECTIONS.USERS);
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
          xp: data.xp ?? 0,
          level: data.level ?? 1,
        });
      }
    });

    entries.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.total - b.total;
    });

    return entries.slice(0, topN);
  } catch (fallbackError) {
    console.error('[leaderboardService] Fallback also failed:', fallbackError);
    return [];
  }
}

/**
 * Subscribe to real-time leaderboard updates.
 * @returns An unsubscribe function.
 */
export function onLeaderboardUpdate(
  topN: number,
  callback: (entries: LeaderboardEntry[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const usersRef = collection(db, COLLECTIONS.USERS);

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
            xp: data.xp ?? 0,
            level: data.level ?? 1,
          });
        }
      });

      entries.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.total - b.total;
      });

      callback(entries.slice(0, topN));
    },
    (error) => {
      console.error('[leaderboardService] onLeaderboardUpdate error:', error);
      onError?.(error);
    },
  );

  console.info('[leaderboardService] 🔴 Real-time leaderboard listener attached');
  return unsubscribe;
}

// ── Recent Signups ──────────────────────────────────────────────────────

export async function getRecentSignups(count = 5): Promise<RecentSignup[]> {
  try {
    const usersRef = collection(db, COLLECTIONS.USERS);
    const recentQuery = query(usersRef, orderBy('createdAt', 'desc'), limit(count));
    const snapshot = await getDocs(recentQuery);

    const signups: RecentSignup[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const ts = data.createdAt?.toDate?.() ?? new Date();
      signups.push({
        uid: docSnap.id,
        displayName: data.displayName ?? 'Anonymous',
        photoURL: data.photoURL ?? null,
        createdAt: ts.toISOString(),
      });
    });

    return signups;
  } catch (error) {
    console.error('[leaderboardService] getRecentSignups failed:', error);
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.USERS));
      const all: RecentSignup[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const ts = data.createdAt?.toDate?.() ?? new Date(0);
        all.push({
          uid: docSnap.id,
          displayName: data.displayName ?? 'Anonymous',
          photoURL: data.photoURL ?? null,
          createdAt: ts.toISOString(),
        });
      });
      all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return all.slice(0, count);
    } catch {
      return [];
    }
  }
}

// ── Recent Activity ─────────────────────────────────────────────────────

export async function getRecentActivity(count = 5): Promise<RecentAction[]> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.USERS));

    const actions: RecentAction[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as UserProfile;
      const progress = data.quizProgress ?? {};

      for (const [topic, result] of Object.entries(progress)) {
        const label = topic.charAt(0).toUpperCase() + topic.slice(1);
        actions.push({
          uid: docSnap.id,
          displayName: data.displayName ?? 'Anonymous',
          photoURL: data.photoURL ?? null,
          action: result.correct
            ? `✅ Passed ${label} Quiz`
            : `🔄 Attempted ${label} Quiz`,
          timestamp: result.answeredAt,
        });
      }
    });

    actions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return actions.slice(0, count);
  } catch (error) {
    console.error('[leaderboardService] getRecentActivity failed:', error);
    return [];
  }
}

// ── Activity Feed Listener (for real-time component) ────────────────────

interface ActivityItem {
  name: string
  topic: string
  passed: boolean
  timestamp: string
}

/**
 * Subscribe to real-time activity feed updates.
 * @returns An unsubscribe function.
 */
export function onActivityFeedUpdate(
  maxItems: number,
  callback: (items: ActivityItem[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const usersRef = collection(db, COLLECTIONS.USERS);
  const q = query(usersRef, orderBy('updatedAt', 'desc'), limit(10));

  return onSnapshot(q, (snapshot) => {
    const items: ActivityItem[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const progress = data.quizProgress ?? {};
      const name = data.displayName ?? 'Someone';

      let latestTopic = '';
      let latestTime = '';
      let latestPassed = false;

      for (const [topic, result] of Object.entries(progress)) {
        const r = result as { correct: boolean; answeredAt: string };
        if (!latestTime || r.answeredAt > latestTime) {
          latestTime = r.answeredAt;
          latestTopic = topic;
          latestPassed = r.correct;
        }
      }

      if (latestTopic) {
        items.push({ name, topic: latestTopic, passed: latestPassed, timestamp: latestTime });
      }
    });

    items.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    callback(items.slice(0, maxItems));
  }, (error) => {
    console.error('[leaderboardService] Activity feed error:', error);
    onError?.(error);
  });
}
