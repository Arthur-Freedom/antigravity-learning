// ── Firebase Remote Config Service ──────────────────────────────────────
// Manages feature flags via Firebase Remote Config.
// Import getFlag() / getConfigValue() in any component to check flags.

import { getRemoteConfig, fetchAndActivate, getBoolean, getString, type RemoteConfig } from 'firebase/remote-config';
import { app } from '../lib/firebase';

// ── Default Values ──────────────────────────────────────────────────────
// These are used when Remote Config hasn't fetched yet or the key is missing.
const DEFAULTS: Record<string, string | number | boolean> = {
  ai_hints_enabled: true,
  leaderboard_enabled: true,
  presence_enabled: true,
  maintenance_banner: '',
};

let remoteConfig: RemoteConfig | null = null;
let initialized = false;

// ── Init ────────────────────────────────────────────────────────────────
// Call once at app startup. Non-blocking — fetches in background.
export async function initRemoteConfig(): Promise<void> {
  try {
    remoteConfig = getRemoteConfig(app);

    // Dev: fetch every 60s. Prod: default 12 hours.
    const isDev = import.meta.env.DEV;
    remoteConfig.settings.minimumFetchIntervalMillis = isDev ? 60_000 : 3_600_000;

    // Set defaults so getFlag() works even before first fetch
    remoteConfig.defaultConfig = DEFAULTS;

    await fetchAndActivate(remoteConfig);
    initialized = true;
    console.log('[RemoteConfig] Fetched and activated');
  } catch (err) {
    // Non-fatal — app works fine with defaults
    console.warn('[RemoteConfig] Fetch failed, using defaults:', err);
  }
}

// ── Getters ─────────────────────────────────────────────────────────────

/** Get a boolean feature flag. Returns the default if RC isn't ready. */
export function getFlag(key: string): boolean {
  if (!remoteConfig) return (DEFAULTS[key] as boolean) ?? false;
  return getBoolean(remoteConfig, key);
}

/** Get a string config value. Returns the default if RC isn't ready. */
export function getConfigValue(key: string): string {
  if (!remoteConfig) return (DEFAULTS[key] as string) ?? '';
  return getString(remoteConfig, key);
}

/** Whether Remote Config has completed its first fetch. */
export function isRemoteConfigReady(): boolean {
  return initialized;
}
