# 🛡️ Code Health & Best Practices

> **Last audited:** March 13 2026 by Antigravity agent  
> **Audit result:** All 7 rules passing. Zero TypeScript errors.  
> **Test command:** `npx tsc --noEmit` — must exit with code 0 before any PR/deploy.

This document is the source of truth for code quality standards. Every agent working on this project MUST read this before making changes.

---

## The 7 Golden Rules

### 1. Environment Failsafe — "Always Declare Your Destination"

Every Firebase CLI command MUST include an explicit `--project` flag.

```bash
# ✅ Correct
firebase deploy --only functions --project antigravity-learning-dev

# ❌ NEVER do this — targets the default, which may be prod
firebase deploy --only functions
```

All environment-specific values (API keys, measurement IDs, project IDs) live **only** in:
- `.env.development` — loaded by `npm run dev`
- `.env.production` — loaded by `npm run build`

**Never** hardcode env values inline. **Never** create a third config system.

---

### 2. Listener Teardown — "If You Open It, Close It"

Every `onSnapshot` call returns an unsubscribe function. **Always store it and call it.**

**Pattern used in this project:**
```typescript
// Module-level variable to hold the unsubscribe handle
let unsubscribe: (() => void) | null = null

export function init(): void {
  // Guard against double-init (prevents listener stacking on re-navigation)
  if (unsubscribe) { unsubscribe(); unsubscribe = null }
  
  unsubscribe = onSnapshot(query, (snapshot) => { /* ... */ }, (error) => { /* ... */ })
}

// Router calls this when navigating away
export function destroy(): void {
  if (unsubscribe) { unsubscribe(); unsubscribe = null }
}
```

All pages with listeners (`leaderboard.ts`, `home.ts`, `activity-feed.ts`) export a `destroy()` function that the router calls automatically. **Every new page with a listener must follow this same pattern.**

---

### 3. Query Sandbox — "Test Locally First"

Any Firestore query combining `where()` + `orderBy()`, or multiple `where()` clauses, **requires a composite index**.

**Workflow before pushing a new query:**
1. Write the query in the service file
2. Run `npm run dev` and navigate to the affected page
3. Open browser DevTools → Console
4. Look for a red Firestore error with a URL in it
5. **Click that URL** — it auto-creates the index in `firestore.indexes.json`
6. Deploy the indexes: `firebase deploy --only firestore:indexes --project <env>`

Skipping this step WILL cause the feature to crash in production.

---

### 4. No Hidden Constants — "Name Everything"

XP rewards, level thresholds, module counts — any number that drives logic must be a named constant.

**Current named constants:**

| Constant | Value | File | Purpose |
|----------|-------|------|---------|
| `XP_PER_QUIZ_PASS` | 50 | `userService.ts` | XP awarded for passing a quiz |
| `XP_PER_DAILY_LOGIN` | 10 | `userService.ts` | XP awarded for daily login |
| `MODULES_FOR_CERTIFICATE` | (see file) | `constants/collections.ts` | Modules needed to earn cert |
| `COLLECTIONS.USERS` | `'users'` | `constants/collections.ts` | Firestore collection name |

If you add a new reward, threshold, or collection name: **add it to `constants/collections.ts` first**, then use the constant.

---

### 5. Import Isolation — "Only Pack What You Need"

**Rule:** Firebase must NEVER be imported directly in `src/pages/` or `src/components/`.

- Pages and components import from `src/services/` only
- Services import from `src/lib/firebase.ts` only
- `src/lib/firebase.ts` is the single place Firebase is initialized

**Verify with:**
```bash
# Should return zero results
grep -r "from 'firebase" src/pages/ src/components/
```

All imports use **modular v9 syntax**: `import { doc, getDoc } from 'firebase/firestore'`  
Never: `import * as firestore from 'firebase/firestore'`  
Never: `import firebase from 'firebase/compat/app'`

---

### 6. Never Die Silently — "Always Fail Visibly"

Every `async` function that calls Firestore, Auth, or Cloud Functions MUST have a `try/catch`.

**Frontend pattern:** Catch → `showToast({ message: '...', type: 'error' })`  
**Backend (Cloud Functions) pattern:** Catch → `logger.error('[functionName] Failed:', error)` ← uses `firebase-functions` `logger`, NOT `console.error`.

```typescript
// ✅ Frontend
async function loadData(): Promise<void> {
  try {
    const profile = await getUserProfile(uid)
    // ...
  } catch (err) {
    console.error('[page] Failed to load:', err)
    showToast({ message: 'Could not load data. Please try refreshing.', type: 'error' })
  }
}

// ✅ Backend (Cloud Functions)
import { logger } from 'firebase-functions'
try {
  // ...
} catch (error) {
  logger.error('[myFunction] Failed:', error) // appears in GCP Cloud Logging with severity
}
```

---

### 7. Type Safety — "Trust Nothing, Type Everything"

**Rules:**
- Zero `any` types — TypeScript strict mode is ON (`tsconfig.json`: `"strict": true`)
- Zero `unknown` for Firestore document fields — use proper union types
- Firestore timestamp fields are typed as `Timestamp | FieldValue | null`
  - `Timestamp` = what you get on reads
  - `FieldValue` = what `serverTimestamp()` returns on writes
  - Both are required in the union

The canonical type definitions live in `src/types/user.ts`. Always import from there.

```typescript
import type { UserProfile, QuizResult } from '../types/user'
```

---

## Architecture Overview

```
src/
├── lib/
│   └── firebase.ts        ← Firebase init. ONLY import point for the SDK.
├── constants/
│   └── collections.ts     ← All collection names + business constants (XP, etc.)
├── types/
│   └── user.ts            ← All domain types (UserProfile, LeaderboardEntry, etc.)
├── services/              ← All Firebase calls. Pages call these, not Firebase directly.
│   ├── authService.ts
│   ├── userService.ts
│   ├── leaderboardService.ts
│   ├── storageService.ts
│   ├── presenceService.ts
│   ├── remoteConfigService.ts
│   └── functionsService.ts
├── components/            ← Reusable UI. Zero Firebase imports.
└── pages/                 ← Route pages. Zero Firebase imports.
```

---

## Quick Health Checks for Agents

Before committing or deploying, verify:

```bash
# 1. TypeScript compiles with zero errors
npx tsc --noEmit

# 2. No Firebase leaking into pages or components
grep -r "from 'firebase" src/pages/ src/components/
# Expected: no output

# 3. No compat imports anywhere
grep -r "firebase/compat" src/
# Expected: no output
```

---

## Known Patterns to Avoid

| ❌ Anti-pattern | ✅ Correct pattern |
|-----------------|-------------------|
| `await someFirestoreCall()` without try/catch | Wrap in `try/catch`, show Toast on error |
| `xp += 50` inline | `xp += XP_PER_QUIZ_PASS` from named constant |
| `createdAt: unknown` | `createdAt: Timestamp \| FieldValue \| null` |
| `import { getFirestore } from 'firebase/firestore'` in a page | Import service function from `src/services/` |
| `firebase deploy --only hosting` | Always append `--project antigravity-learning` or `--project antigravity-learning-dev` |
| `onSnapshot(...) ` without storing the return value | Always `const unsub = onSnapshot(...)` and call `unsub()` in `destroy()` |
