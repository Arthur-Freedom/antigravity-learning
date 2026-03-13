// ── Online Presence Tracking ────────────────────────────────────────────
// Uses Firebase Realtime Database to track online users.

import { getDatabase, ref, set, onValue, off, onDisconnect, serverTimestamp as rtdbTimestamp } from 'firebase/database';
import { app } from '../lib/firebase';
import { onAuthChange } from './authService';

let onlineCount = 0;
let countCallback: ((count: number) => void) | null = null;
let connectedListenerRef: ReturnType<typeof ref> | null = null;

/**
 * Initialize presence tracking.
 * 
 * Listener Lifecycle:
 * 1. Attaches a generic `.info/connected` listener when the user authenticates.
 * 2. When the client connects (or reconnects) to RTDB, it sets the user's status 
 *    to `online: true` and configures an `onDisconnect` hook to remove the status.
 * 3. The generic `/status` listener handles counting total online users.
 * 
 * Guard: If the user signs in/out repeatedly, the previous `.info/connected`
 * listener is cleaned up before attaching a new one to prevent stacking.
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
      // Clean up previous connection listener to prevent stacking
      if (connectedListenerRef) {
        off(connectedListenerRef);
        connectedListenerRef = null;
      }

      if (user) {
        const userStatusRef = ref(rtdb, `status/${user.uid}`);
        const connectedRef = ref(rtdb, '.info/connected');
        connectedListenerRef = connectedRef;

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
