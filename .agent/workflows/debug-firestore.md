---
description: How to debug Firestore data issues (permission errors, missing fields, broken queries)
---

This workflow helps diagnose and fix common Firestore issues in the Antigravity Learning platform.

## Quick Diagnosis Checklist

Before changing code, identify the symptom:

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| `PERMISSION_DENIED` on read | User not authenticated or reading another user's protected data | Check `firestore.rules` — reads on `users/` are public (`allow read: if true`) |
| `PERMISSION_DENIED` on write | Field validation failing in rules, or writing to wrong UID | Check the `allow write` rule — must be `request.auth.uid == userId` |
| Missing fields on existing users | New field added but not backfilled | Add default value in `ensureUserProfile()` in `src/services/userService.ts` |
| Leaderboard not sorting | Composite index not built yet | Check `firestore.indexes.json`, deploy with `npx firebase deploy --only firestore:indexes` |
| Data reverted/weird values | Server-side sanitiser correcting data | Check `onUserDataWrite` in `functions/src/index.ts` — the `_sanitizedAt` loop guard |

## Steps

1. **Check the browser console** — Firestore errors always include the collection path and error code

2. **Verify auth state** — Run this in the browser console:
   ```javascript
   // Check current Firebase Auth user
   firebase.auth().currentUser
   ```

3. **Check security rules locally**:
   - Open `firestore.rules`
   - For `users/{userId}`: reads are public, writes require `auth.uid == userId`
   - For `mail/` and `audit/`: client access is fully denied (Admin SDK only)

4. **Inspect the Firestore document** in the Firebase Console:
   - Open the Firestore link from [`LINKS.md`](../../LINKS.md) (Dev or Prod as appropriate)
   - Navigate to `users/{uid}`
   - Verify all expected fields are present

5. **Check for field backfilling** — When you add new fields to `UserProfile`, existing users won't have them. Fix this in `ensureUserProfile()`:
   ```typescript
   // In the else branch (existing user):
   const newField = existingData.newField ?? 'default_value';
   ```

6. **Check composite indexes** — If leaderboard queries fail:
   // turbo
   - Deploy indexes: `npx firebase deploy --only firestore:indexes`
   - Wait 1-5 minutes for indexes to build

7. **Check Cloud Functions logs** for server-side errors:
   // turbo
   - View recent logs: `npx firebase functions:log --only onUserDataWrite -n 20`

8. **If data is being silently corrected**, check the server-side sanitiser:
   - Open `functions/src/index.ts`
   - Look at `onUserDataWrite` — it validates displayName, quizProgress keys, and recalculates denormalized fields
   - The `_sanitizedAt` field prevents infinite trigger loops
