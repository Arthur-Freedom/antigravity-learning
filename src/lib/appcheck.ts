// ── Firebase App Check ──────────────────────────────────────────────────
// Protects backend services from abuse by verifying requests come from
// your real web app.

import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
  type AppCheck,
} from 'firebase/app-check';
import { app } from './firebase';

// Debug token for localhost
if (import.meta.env.DEV) {
  // @ts-expect-error — Firebase uses this global to enable debug mode
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN || true;
  console.info('[appcheck] 🔧 Debug mode enabled (localhost)');
}

let appCheckInstance: AppCheck | null = null;

export function initAppCheck(siteKey?: string): AppCheck | null {
  if (appCheckInstance) return appCheckInstance;

  const key = siteKey ?? import.meta.env.VITE_RECAPTCHA_ENTERPRISE_KEY;

  if (import.meta.env.DEV) {
    const debugToken = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN;
    if (!debugToken || debugToken === 'true') {
      console.info(
        '[appcheck] ⏭️  Skipping App Check on localhost (no debug token configured).'
      );
      return null;
    }
  }

  if (!key && !import.meta.env.DEV) {
    console.warn('[appcheck] ⚠️  No ReCAPTCHA Enterprise key found. App Check is NOT active.');
    return null;
  }

  try {
    appCheckInstance = initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(
        key || '6Lc_placeholder_for_debug'
      ),
      isTokenAutoRefreshEnabled: true,
    });

    console.info('[appcheck] ✅ App Check initialized');
    return appCheckInstance;
  } catch (error) {
    console.error('[appcheck] ❌ Failed to initialize App Check:', error);
    return null;
  }
}
