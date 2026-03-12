---
name: firestore-data
description: Complete reference for the Firestore data model — collections, schemas, indexes, real-time listeners, and data migration patterns
---

# Firestore Data Model — Complete Reference

All database operations go through service modules in `src/services/`. Never import Firestore directly in pages or components.

## Collections

### `users/{uid}` — User Profiles

The primary collection. One document per authenticated user, keyed by Firebase Auth UID.

```typescript
interface UserProfile {
  // Identity
  displayName: string;          // max 50 chars (server enforced)
  email: string;                // from Google Auth
  photoURL: string | null;      // Google profile photo
  customPhotoURL?: string;      // Uploaded custom photo (Firebase Storage URL)

  // Quiz progress
  quizProgress: Record<string, QuizResult>;  // topic → result
  quizScore: number;            // denormalized: count of correct answers
  quizTotal: number;            // denormalized: count of total attempts
  completedAll: boolean;        // denormalized: quizScore >= 9

  // Gamification
  xp: number;                   // total experience points
  level: number;                // calculated from xp
  streak: number;               // consecutive login days
  lastLoginDate: string;        // "YYYY-MM-DD" format

  // System
  createdAt: Timestamp;         // set on first sign-in, immutable
  updatedAt: Timestamp;         // updated on every write
  congratsEmailSentAt?: Timestamp;  // set by Cloud Function
  welcomeEmailSentAt?: Timestamp;   // set by Cloud Function

  // Admin (optional, set by Cloud Function)
  isAdmin?: boolean;
  adminGrantedBy?: string;
  adminGrantedAt?: Timestamp;
}
```

### `mail/{mailId}` — Email Audit Log

Written by Cloud Functions only (Admin SDK). Client access fully denied.

```typescript
{
  to: string;
  subject: string;
  userId: string;
  type: 'quiz_completion' | 'welcome';
  status: 'sent' | 'failed';
  messageId?: string;
  error?: string;
  createdAt: Timestamp;
}
```

### `audit/{docId}` — Admin Audit Trail

Admin-readable audit records for privileged actions.

```typescript
{
  action: 'reset_user_progress';
  targetUid: string;
  performedBy: string;
  timestamp: Timestamp;
}
```

### `rateLimits/aiHints/users/{uid}` — AI Hint Rate Limiting

Used by the `getAiHint` Cloud Function to enforce 10 hints/day/user.

```typescript
{
  date: string;   // "YYYY-MM-DD" (UTC)
  count: number;  // hints used today
}
```

## Service Modules

| Service | File | Purpose |
|---------|------|---------|
| `userService` | `src/services/userService.ts` | User CRUD, quiz saves, profile updates, daily streak |
| `leaderboardService` | `src/services/leaderboardService.ts` | Ranked queries, real-time listeners, fallback sorting |
| `authService` | `src/services/authService.ts` | Google sign-in, auth state, user mapping |
| `storageService` | `src/services/storageService.ts` | Profile photo upload/download |
| `presenceService` | `src/services/presenceService.ts` | Online user count (Firebase Realtime Database) |
| `functionsService` | `src/services/functionsService.ts` | HTTPS callable wrappers (admin, AI hints) |

## Composite Indexes

**File:** `firestore.indexes.json`

| Fields | Use Case |
|--------|----------|
| `quizScore` DESC, `quizTotal` ASC | Default leaderboard ranking |
| `completedAll` ASC, `quizScore` DESC | Filter certified users |

**Note:** The leaderboard currently uses an `xp > 0` + `orderBy('xp', 'desc')` query, which works as a single-field query and does **not** require a composite index. If you add a multi-field leaderboard query (e.g., `where` + `orderBy` on different fields), you'll need to add a composite index.

After modifying indexes, deploy with `npx firebase deploy --only firestore:indexes` and wait 1-5 minutes for them to build.

## Real-Time Listeners

Some services use `onSnapshot` for real-time updates. These **MUST** be cleaned up in the page's `destroy()` function to prevent memory leaks:

```typescript
// In a service:
export function onLeaderboardUpdate(
  topN: number,
  callback: (entries: LeaderboardEntry[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const usersRef = collection(db, COLLECTIONS.USERS);
  return onSnapshot(usersRef, (snapshot) => {
    // ... process and sort entries
    callback(entries.slice(0, topN));
  }, (error) => {
    onError?.(error);
  });
}

// In a page's init():
unsubscribe = onLeaderboardUpdate(20, (entries) => {
  renderLeaderboard(entries);
});

// In a page's destroy():
export function destroy() {
  if (unsubscribe) unsubscribe();
}
```

## Adding a New Collection

1. Define the TypeScript interface in `src/types/`
2. Add the collection name to `src/constants/collections.ts`
3. Create a new service in `src/services/`
4. Add security rules in `firestore.rules`
5. Add indexes to `firestore.indexes.json` if needed
6. Deploy: `npx firebase deploy --only firestore`

## Data Migration / Backfilling

When adding new fields to existing users, backfill them in `ensureUserProfile()`:

```typescript
// In the "else" branch (existing user):
const newField = existingData.newField ?? defaultValue;
updateFields.newField = newField;
```

This runs on every sign-in, so all active users get the new field automatically.
