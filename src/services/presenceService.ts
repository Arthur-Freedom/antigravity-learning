// ── Online Presence Tracking ────────────────────────────────────────────
// Uses Firebase Realtime Database to track online users.

import { getDatabase, ref, set, onValue, onDisconnect, serverTimestamp as rtdbTimestamp } from 'firebase/database';
import { app } from '../lib/firebase';
import { onAuthChange } from './authService';

let onlineCount = 0;
let countCallback: ((count: number) => void) | null = null;

/**
 * Initialize presence tracking.
 */
export function initPresence(): void {
  try {
    const rtdb = getDatabase(app);

    const statusRef = ref(rtdb, 'status');
    onValue(statusRef, (snapshot) => {
      onlineCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
      if (countCallback) countCallback(onlineCount);
    }, (error) => {
      console.warn('[presenceService] RTDB listener error:', error.message);
    });

    onAuthChange((user) => {
      if (user) {
        const userStatusRef = ref(rtdb, `status/${user.uid}`);
        const connectedRef = ref(rtdb, '.info/connected');

        onValue(connectedRef, (snap) => {
          if (snap.val() === true) {
            onDisconnect(userStatusRef).remove();
            set(userStatusRef, {
              online: true,
              lastSeen: rtdbTimestamp(),
            });
          }
        });
      }
    });
  } catch (error) {
    console.warn('[presenceService] Failed to initialize:', error);
  }
}

/**
 * Subscribe to online count changes.
 */
export function onOnlineCountChange(callback: (count: number) => void): void {
  countCallback = callback;
  callback(onlineCount);
}

/**
 * Get the current online user count.
 */
export function getOnlineCount(): number {
  return onlineCount;
}
