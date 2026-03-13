---
description: How to safely update and deploy Firestore/Storage security rules
---

This workflow ensures security rules are updated correctly and deployed safely.

## Important Context

- **Firestore rules**: `firestore.rules` — controls read/write access to all Firestore collections
- **Storage rules**: `storage.rules` — controls read/write access to Firebase Storage (profile photos)
- **Admin SDK bypasses rules** — Cloud Functions always have full access regardless of rules
- **Rules are NOT backwards-compatible** — a bad deploy can lock out all users immediately

## Steps

1. **Understand the current rule structure** by reading `firestore.rules`:
   - `users/{userId}`: public reads, owner-only writes
   - `audit/{docId}`: admin reads only, no client writes
   - `mail/{mailId}`: fully denied (Admin SDK only)
   - Default: deny all

2. **Make your changes** to `firestore.rules` or `storage.rules`:
   - Always test that `request.auth != null` before accessing `request.auth.uid`
   - For new collections, add an explicit `match` block — don't rely on the default deny
   - If adding field validation, ensure ALL existing users would pass the validation

3. **Double-check for common pitfalls**:
   - ❌ Don't use `resource.data` in create rules (resource doesn't exist yet on create)
   - ❌ Don't forget `request.auth.uid == userId` for owner-only writes
   - ❌ Don't block `updatedAt` from being a server timestamp
   - ✅ Use `request.resource.data` for incoming data validation
   - ✅ Use `resource.data` for existing data checks (in update rules)

4. **Back up current rules** before deploying:
   ```
   copy firestore.rules firestore.rules.bak
   ```

// turbo
5. **Deploy Firestore rules to PRODUCTION**: `npx firebase deploy --only firestore:rules --project antigravity-learning`

// turbo
5b. **Deploy Firestore rules to DEV**: `npx firebase deploy --only firestore:rules --project antigravity-learning-dev`

// turbo
6. **Deploy Storage rules to PRODUCTION** (if changed): `npx firebase deploy --only storage --project antigravity-learning`

// turbo
6b. **Deploy Storage rules to DEV** (if changed): `npx firebase deploy --only storage --project antigravity-learning-dev`

7. **Verify in Firebase Console**:
   - Open the Firestore link from [`LINKS.md`](../../LINKS.md) → Rules tab
   - Confirm the rules are active
   - Use the Rules Playground to test read/write scenarios

8. **If something breaks**, rollback immediately:
   ```
   copy firestore.rules.bak firestore.rules
   npx firebase deploy --only firestore:rules
   ```
