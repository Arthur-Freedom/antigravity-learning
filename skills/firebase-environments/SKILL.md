---
name: Firebase Environment Setup
description: Checklist and guide for setting up a new Firebase environment (dev, staging, etc.) to match production. Read this BEFORE creating any new Firebase project.
---

# Firebase Environment Setup

## When to use this skill

- Setting up a **new Firebase project** (dev, staging, etc.)
- **Auditing** an existing project to verify parity with production
- After adding a **new Firebase service** to production

## Pre-Setup: Scan the Codebase

**CRITICAL:** Before setting up any Firebase project, scan the codebase for ALL Firebase services in use. Do NOT rely on memory or `firebase.json` alone — some services (like Realtime Database) may be used in code without being in `firebase.json`.

Run these checks:

```bash
# 1. Check firebase.json for configured services
cat firebase.json

# 2. Scan for ALL Firebase SDK imports in the codebase
grep -r "firebase/" src/ --include="*.ts" | grep "import" | sort -u

# 3. Specifically check for services that are easy to miss:
grep -r "firebase/database" src/     # Realtime Database
grep -r "firebase/messaging" src/    # Cloud Messaging
grep -r "firebase/analytics" src/    # Analytics
grep -r "firebase/app-check" src/    # App Check
grep -r "firebase/remote-config" src/ # Remote Config
grep -r "firebase/performance" src/   # Performance Monitoring

# 4. Check Cloud Functions for secrets and env vars
grep -r "process.env" functions/src/ --include="*.ts"
grep -r "secrets:" functions/src/ --include="*.ts"

# 5. Check for environment files
ls -la functions/.env* .env*
```

## Complete Setup Checklist

Use this checklist for every new Firebase project. Check off each item:

### Project Creation
- [ ] Create Firebase project with clear name (e.g., `projectname-dev`)
- [ ] Set up billing (Blaze plan) — use the same billing account as production

### Core Services
- [ ] **Authentication** — enable same providers (Google Sign-In, email/password, anonymous, etc.)
- [ ] **Cloud Firestore** — create database, deploy security rules
- [ ] **Firebase Storage** — activate via console ("Get Started"), deploy security rules
- [ ] **Realtime Database** — create if used (check `firebase/database` imports!)
- [ ] **Cloud Functions** — build and deploy all functions
- [ ] **Hosting** — auto-created with project (not needed for dev, but available)

### Secrets & Environment Variables
- [ ] `GEMINI_API_KEY` — create a separate key per project (Google Cloud Console > Credentials)
- [ ] `SMTP_EMAIL` — set via `firebase functions:secrets:set`
- [ ] `SMTP_PASSWORD` — set via `firebase functions:secrets:set` (Gmail App Password)
- [ ] `ADMIN_EMAILS` — set via `firebase functions:secrets:set`
- [ ] Any other `process.env.*` variables found in step 4 of the scan

### Frontend Config
- [ ] Create `.env.development` with dev project config
- [ ] Create `.env.production` with production project config  
- [ ] Verify `.env*` files are in `.gitignore`
- [ ] Restart dev server to pick up new `.env.development`

### Verification (MANDATORY — Do NOT skip)

**RULE: CLI success ≠ service is working.** A CLI command can report "success" while the service was never actually provisioned. You MUST verify every service by opening its Firebase Console page.

#### Step 1: Open each console page and confirm the service is active

For each service, open the URL and confirm it shows data/settings (NOT a "Get Started" or "Create database" button):

- [ ] **Auth:** `https://console.firebase.google.com/project/<id>/authentication/users`
  - ✅ PASS: Shows "Users" tab (even if empty)
  - ❌ FAIL: Shows "Get Started" button
- [ ] **Firestore:** `https://console.firebase.google.com/project/<id>/firestore`
  - ✅ PASS: Shows empty database with "+ Start collection" option
  - ❌ FAIL: Shows "Create database" button
- [ ] **Storage:** `https://console.firebase.google.com/project/<id>/storage`
  - ✅ PASS: Shows empty bucket with "Upload file" option
  - ❌ FAIL: Shows "Get Started" button
- [ ] **Realtime Database:** `https://console.firebase.google.com/project/<id>/database`
  - ✅ PASS: Shows database URL with "null" root node
  - ❌ FAIL: Shows "Create database" button
- [ ] **Functions:** `https://console.firebase.google.com/project/<id>/functions`
  - ✅ PASS: Lists all 7 functions with "Active" status
  - ❌ FAIL: Shows fewer functions or "Get Started"

#### Step 2: Verify secrets are set

```bash
# List all secrets for the project
npx firebase functions:secrets:access GEMINI_API_KEY --project <id> 2>&1 | head -1
npx firebase functions:secrets:access SMTP_EMAIL --project <id> 2>&1 | head -1
npx firebase functions:secrets:access SMTP_PASSWORD --project <id> 2>&1 | head -1
npx firebase functions:secrets:access ADMIN_EMAILS --project <id> 2>&1 | head -1
```
Each should return a value (not an error).

#### Step 3: Verify localhost connects to the correct project

- [ ] Open `http://localhost:5173` in browser
- [ ] Open DevTools → Console
- [ ] Look for Firebase project ID in network requests — must match the dev project ID
- [ ] Confirm "0 Learners Enrolled" (empty dev database = correct)
- [ ] Try signing in with Google — a new user should appear in the **dev** Auth console, NOT production

#### Step 4: Cross-environment smoke test

- [ ] Sign in on localhost → check user appears in dev project Auth console
- [ ] Sign in on live site → check user appears in production Auth console
- [ ] Confirm they are DIFFERENT Auth databases (different UIDs for same Google account)

**Only declare setup "complete" after ALL verification checks pass.**

## Current Projects

| Environment | Project ID | Console |
|-------------|-----------|---------|
| **Production** | `antigravity-learning` | [Console](https://console.firebase.google.com/project/antigravity-learning) |
| **Development** | `antigravity-learning-dev` | [Console](https://console.firebase.google.com/project/antigravity-learning-dev) |

## How Vite Loads the Right Config

Vite automatically loads environment files based on the command:

- `npm run dev` → `.env.development` → **dev project** (Vite dev server on localhost)
- `npm run build:dev` → `.env.development` → **dev project** (built bundle for hosted dev site)
- `npm run build` → `.env.production` → **prod project** (built bundle for production)

> ⚠️ **CRITICAL:** Always use `npm run build:dev` to build for the hosted dev site. `npm run build` **always** loads `.env.production` and will pollute your dev environment with production config.

No code changes needed. The `src/lib/firebase.ts` reads `import.meta.env.VITE_FIREBASE_*` variables.

## Firebase Services Used in This Project

| Service | SDK Import | Where Used |
|---------|-----------|------------|
| Auth | `firebase/auth` | `src/services/authService.ts` |
| Firestore | `firebase/firestore` | `src/services/userService.ts`, `leaderboardService.ts` |
| Storage | `firebase/storage` | `src/services/storageService.ts` |
| Realtime Database | `firebase/database` | `src/services/presenceService.ts` |
| App Check | `firebase/app-check` | `src/lib/appcheck.ts` |
| Functions | `firebase/functions` | `src/services/functionsService.ts` |
| Analytics | `firebase/analytics` | `src/lib/firebase.ts` — `VITE_FIREBASE_MEASUREMENT_ID` |

**Keep this table updated** when adding new Firebase services!

---

## Firebase Extensions — Per-Environment Configuration

Extension configuration files use a project-specific naming convention. **Do NOT use bare `.env` files** — they act as cross-environment fallbacks and defeat isolation.

**Correct pattern:**
```
extensions/<extension-id>.env.<firebase-project-id>
```

**Current extension files:**
```
extensions/
  delete-user-data.env.antigravity-learning        ← prod bucket
  delete-user-data.env.antigravity-learning-dev    ← dev bucket
  storage-resize-images.env.antigravity-learning
  storage-resize-images.env.antigravity-learning-dev
  firestore-counter.env.antigravity-learning
  firestore-counter.env.antigravity-learning-dev
  firestore-send-email.env.antigravity-learning
  firestore-send-email.env.antigravity-learning-dev
```

When you run `firebase deploy --only extensions --project antigravity-learning-dev`, the CLI automatically picks the `-dev` variant.

---

## Dynamic URL Resolution Patterns

### In Cloud Functions — use `GCLOUD_PROJECT`
The GCP runtime automatically sets `process.env.GCLOUD_PROJECT` to the active project ID. Use it to resolve environment-specific values:
```typescript
// In functions/src/helpers/mail.ts
export function getBaseUrl(): string {
  // GCLOUD_PROJECT is set automatically by the GCP runtime (no config needed)
  return process.env.GCLOUD_PROJECT === "antigravity-learning-dev"
    ? "https://antigravity-learning-dev.web.app"
    : "https://antigravity-learning.web.app";
}
```
**Never hardcode project URLs in Cloud Function code.**

### In Frontend code — use `window.location.origin`
For any shareable URL, social share link, or canonical URL:
```typescript
const siteUrl = window.location.origin; // Always correct, immune to project renames
```
**Never hardcode `https://antigravity-learning.web.app` in frontend source code.**

---

## Remaining Known Gaps

See `skills/firebase-environments/ENVIRONMENT_SEPARATION.md` for a full evaluation.

- **SMTP separation** — Dev and prod currently share the same SMTP credentials. Ideally dev uses a test inbox (Mailtrap or a `+dev` Gmail alias).
- **Dev email subject prefix** — Emails sent from dev functions should be prefixed `[DEV]` to prevent confusion if they reach a real inbox.
