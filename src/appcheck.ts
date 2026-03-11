// ── Firebase App Check ──────────────────────────────────────────────────
// Protects backend services (Firestore, Storage, Cloud Functions) from
// abuse by verifying that requests come from your real web app.
//
// Uses ReCAPTCHA Enterprise provider for production and a debug token
// in development (localhost).

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
  type AppCheck,
} from 'firebase/app-check';

// ── Firebase app (reuse existing instance) ──────────────────────────────
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ── Debug Token for localhost ───────────────────────────────────────────
// In development, App Check uses a debug token instead of ReCAPTCHA.
// This token must be registered in the Firebase Console under:
//   Project Settings → App Check → Apps → Manage Debug Tokens
//
// The debug provider is only enabled when running on localhost.
if (import.meta.env.DEV) {
  // Enable the debug provider for local development
  // @ts-expect-error — Firebase uses this global to enable debug mode
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN || true;
  console.info('[appcheck] 🔧 Debug mode enabled (localhost)');
}

// ── Initialize App Check ────────────────────────────────────────────────
// ReCAPTCHA Enterprise is the recommended provider for web apps.
// It runs invisibly in the background — no user interaction needed.
//
// To set up:
// 1. Enable ReCAPTCHA Enterprise API in Google Cloud Console
// 2. Create a ReCAPTCHA Enterprise key for your domain
// 3. Set the key in .env as VITE_RECAPTCHA_ENTERPRISE_KEY
// 4. Register the key in Firebase Console → App Check → ReCAPTCHA Enterprise

let appCheckInstance: AppCheck | null = null;

/**
 * Initialize Firebase App Check.
 * Call this once at app startup, BEFORE any Firestore/Storage calls.
 *
 * @param siteKey — Your ReCAPTCHA Enterprise site key.
 *                  Get this from Google Cloud Console → ReCAPTCHA Enterprise.
 */
export function initAppCheck(siteKey?: string): AppCheck | null {
  if (appCheckInstance) return appCheckInstance;

  const key = siteKey ?? import.meta.env.VITE_RECAPTCHA_ENTERPRISE_KEY;

  if (!key && !import.meta.env.DEV) {
    console.warn(
      '[appcheck] ⚠️  No ReCAPTCHA Enterprise key found. ' +
        'Set VITE_RECAPTCHA_ENTERPRISE_KEY in .env. ' +
        'App Check is NOT active — your backend is unprotected.'
    );
    return null;
  }

  try {
    appCheckInstance = initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(
        key || '6Lc_placeholder_for_debug' // Placeholder for debug mode
      ),
      // Optional: set to true to auto-refresh the token before it expires.
      isTokenAutoRefreshEnabled: true,
    });

    console.info('[appcheck] ✅ App Check initialized');
    return appCheckInstance;
  } catch (error) {
    console.error('[appcheck] ❌ Failed to initialize App Check:', error);
    return null;
  }
}
