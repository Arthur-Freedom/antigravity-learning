---
name: cloud-functions
description: Complete reference for Cloud Functions — triggers, callables, SMTP email, AI tutor, server-side validation, secrets management, and deployment
---

# Cloud Functions — Complete Reference

All Cloud Functions live in `functions/src/index.ts` and run on **Node 20** with **Firebase Functions v2**.

## Deployed Functions

| Function | Type | Trigger | Purpose |
|----------|------|---------|---------|
| `onQuizCompletion` | Firestore trigger | `users/{userId}` update | Sends congratulations email when all quizzes passed |
| `getCompletionStatus` | HTTPS Callable | Client call | Server-side quiz status verification (App Check enforced) |
| `setAdminClaim` | HTTPS Callable | Client call | Grants admin custom claim (App Check enforced) |
| `resetUserProgress` | HTTPS Callable | Client call | Admin-only reset of user quiz/XP data |
| `getAiHint` | HTTPS Callable | Client call | Gemini-powered Socratic quiz hints (rate limited, 10/day per user) |
| `onUserDataWrite` | Firestore trigger | `users/{userId}` write | Server-side data validation & sanitisation |
| `onUserCreated` | Firestore trigger | `users/{userId}` create | Sends branded welcome email to new users |

## Adding a New Function

### Firestore Trigger

```typescript
import { onDocumentUpdated } from "firebase-functions/v2/firestore";

export const myTrigger = onDocumentUpdated(
  "collection/{docId}",
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;

    // Your logic here
    logger.info("Trigger fired", { docId: event.params.docId });
  }
);
```

### HTTPS Callable

```typescript
import { onCall, HttpsError } from "firebase-functions/v2/https";

export const myCallable = onCall(
  { enforceAppCheck: true },  // Enable App Check for security
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }

    // Your logic here — use Admin SDK (bypasses Firestore rules)
    const uid = request.auth.uid;
    return { success: true };
  }
);
```

## Environment & Secrets

### Local development (functions/.env)
```
SMTP_EMAIL=your-gmail@gmail.com
SMTP_PASSWORD=your-16-char-app-password
GEMINI_API_KEY=your-gemini-api-key
ADMIN_EMAILS=admin@example.com,admin2@example.com
```

### Production secrets (Blaze plan)
```bash
firebase functions:secrets:set SMTP_EMAIL
firebase functions:secrets:set SMTP_PASSWORD
firebase functions:secrets:set GEMINI_API_KEY
```

Reference secrets in function config:
```typescript
export const myFunc = onCall(
  { secrets: ["GEMINI_API_KEY"] },
  async (request) => {
    const apiKey = process.env.GEMINI_API_KEY;
  }
);
```

## Calling Functions from the Frontend

The project wraps all callable function invocations in `src/services/functionsService.ts`:

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../lib/firebase';

const functions = getFunctions(app);

export async function getAiHintForQuiz(
  question: string, options: string[], wrongAnswer: string
): Promise<{ hint: string; hintsRemaining: number }> {
  const getAiHint = httpsCallable<
    { question: string; options: string[]; wrongAnswer: string },
    { hint: string; hintsRemaining: number }
  >(functions, 'getAiHint');
  const result = await getAiHint({ question, options, wrongAnswer });
  return result.data;
}
```

## Rate Limiting (AI Hints)

The `getAiHint` function enforces **10 hints per user per day**:
- Tracked in `rateLimits/aiHints/users/{uid}` (Firestore)
- Resets daily based on UTC date
- Returns `hintsRemaining` count with each response
- Throws `resource-exhausted` error when limit is reached

## Preventing Infinite Trigger Loops

When a Firestore trigger writes back to the same document it was triggered on, it can create an infinite loop. Use a timestamp guard:

```typescript
// In the trigger:
if (afterData._sanitizedAt && beforeData?._sanitizedAt &&
    afterData._sanitizedAt === beforeData._sanitizedAt) {
  return;  // Skip — we just wrote this
}

// When writing corrections:
fixes._sanitizedAt = FieldValue.serverTimestamp();
await db.doc(`users/${userId}`).update(fixes);
```

## Email System (Nodemailer)

The platform sends two types of emails:
1. **Welcome email** (`onUserCreated`) — sent on first sign-up
2. **Congratulations email** (`onQuizCompletion`) — sent when all 9 modules passed

Both use Gmail SMTP via Nodemailer. Templates are inline HTML functions at the bottom of `index.ts`.

### Gmail Setup
1. Enable 2-Step Verification on your Google account
2. Generate an App Password at https://myaccount.google.com/apppasswords
3. Use the 16-character password as `SMTP_PASSWORD`

## Build & Deploy

```bash
# Build only
npm --prefix functions run build

# Deploy only functions
npx firebase deploy --only functions

# View logs
npx firebase functions:log -n 30

# View specific function logs
npx firebase functions:log --only onQuizCompletion -n 20
```
