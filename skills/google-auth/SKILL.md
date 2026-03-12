---
name: google-auth
description: Architecture and implementation rules for Google Authentication on the Antigravity learning website
---

# Google Authentication Implementation Guide

When modifying authentication for this project, you MUST adhere to the following architectural patterns:

## 1. Core Technology
- Use **Firebase Authentication** with `GoogleAuthProvider` and `signInWithPopup`
- Firebase App is initialized in `src/lib/firebase.ts` using `.env` variables (`VITE_FIREBASE_*`)
- Do not use NextAuth or raw OAuth flow unless explicitly commanded otherwise

## 2. Code Structure

| File | Purpose |
|------|---------|
| `src/services/authService.ts` | All auth logic — sign-in, sign-out, auth state listener, user mapping |
| `src/components/auth-button.ts` | UI component for the login/logout button in the navbar |
| `src/types/user.ts` | `AppUser` interface (decoupled from Firebase `User`) |

### Key functions in `authService.ts`:
- `loginWithGoogle()` — triggers Google sign-in popup, returns `AppUser`
- `logout()` — signs out the current user
- `getCurrentUser()` — returns current `AppUser | null` (synchronous)
- `onAuthChange(callback)` — subscribes to auth state changes, returns unsubscribe function
- `getRawFirebaseUser()` — returns raw Firebase `User` (only for ID token access)
- `getGooglePhotoURL()` — gets the Google provider photo URL directly
- `updateAuthProfile(data)` — updates Firebase Auth profile (displayName, photoURL)

### Important patterns:
- All functions return/emit `AppUser` — never expose raw Firebase `User` to consumers
- `onAuthChange()` returns an `Unsubscribe` function that callers must store and call for cleanup
- Auth state is NOT globally cached — use `getCurrentUser()` for synchronous checks or `onAuthChange()` for reactive updates

## 3. UI Integration
- The Google Login button lives in `header.navbar` and is initialized via `bindAuthUI('google-login-btn')` in `main.ts`
- **Logged out**: white button with Google icon, "Sign in with Google" text
- **Logged in**: green gradient button showing profile photo/initial, display name, streak 🔥, and logout option
- Logout uses a confirmation dialog (`src/components/logout-dialog.ts`)
- `main.ts` imports `bindAuthUI` from `src/components/auth-button.ts` — it does NOT contain auth logic directly

## 4. Auth + Firestore
On sign-in, `auth-button.ts` calls:
1. `ensureUserProfile(uid, data)` — creates or backfills the Firestore user document
2. `applyDailyLoginStreak(uid)` — checks/updates the daily login streak
