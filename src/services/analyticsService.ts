// ── Analytics Service ────────────────────────────────────────────────────
// Centralised event tracking using Firebase Analytics (GA4).
// Every module that needs to track an event imports from here.
// Gracefully no-ops if analytics is blocked (e.g. ad-blockers).

import { logEvent as firebaseLogEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { analytics } from '../lib/firebase';

// ── Internal: get analytics instance (async because of isSupported check) ──

async function getAnalytics() {
  return await analytics;
}

// ── Core logging helper ─────────────────────────────────────────────────

async function logEvent(name: string, params?: Record<string, string | number | boolean>): Promise<void> {
  try {
    const instance = await getAnalytics();
    if (instance) {
      firebaseLogEvent(instance, name, params);
    }
  } catch {
    // Silently fail — analytics should never break the app
  }
}

// ── User Identity ───────────────────────────────────────────────────────

/** Set the user ID for all future analytics events */
export async function identifyUser(uid: string): Promise<void> {
  try {
    const instance = await getAnalytics();
    if (instance) {
      setUserId(instance, uid);
    }
  } catch { /* no-op */ }
}

/** Set custom user properties (e.g. tier, level, completion status) */
export async function setUserProps(props: Record<string, string>): Promise<void> {
  try {
    const instance = await getAnalytics();
    if (instance) {
      setUserProperties(instance, props);
    }
  } catch { /* no-op */ }
}

// ── Page Views ──────────────────────────────────────────────────────────

/** Track a virtual page view (SPA route change) */
export function trackPageView(path: string): void {
  logEvent('page_view', {
    page_path: path,
    page_title: document.title,
  });
}

// ── Authentication Events ───────────────────────────────────────────────

/** User signed up (first login / new account) */
export function trackSignUp(method: string = 'google'): void {
  logEvent('sign_up', { method });
}

/** User logged in (returning user) */
export function trackLogin(method: string = 'google'): void {
  logEvent('login', { method });
}

// ── Learning Events ─────────────────────────────────────────────────────

/** User started a quiz on a lesson page */
export function trackQuizStarted(topic: string): void {
  logEvent('quiz_started', { topic });
}

/** User completed a quiz (all questions answered) */
export function trackQuizCompleted(topic: string, score: number, total: number, passed: boolean): void {
  logEvent('quiz_completed', {
    topic,
    score,
    total,
    passed,
    percentage: Math.round((score / total) * 100),
  });
}

/** User earned their certificate (completed all modules) */
export function trackCertificateEarned(): void {
  logEvent('certificate_earned');
}

/** User downloaded the certificate */
export function trackCertificateDownload(): void {
  logEvent('certificate_download');
}

/** User shared certificate on social media */
export function trackCertificateShare(platform: string): void {
  logEvent('certificate_share', { platform });
}

// ── Engagement Events ───────────────────────────────────────────────────

/** User opened a learning module page */
export function trackModuleViewed(module: string): void {
  logEvent('module_viewed', { module });
}

/** User used the AI hint feature */
export function trackAiHintUsed(topic: string): void {
  logEvent('ai_hint_used', { topic });
}

/** User changed their profile picture */
export function trackProfilePhotoChanged(): void {
  logEvent('profile_photo_changed');
}

/** User changed their display name */
export function trackProfileNameChanged(): void {
  logEvent('profile_name_changed');
}
