# Environment Separation — Quality Self-Evaluation & Lessons Learned

> Written by the agent that performed the work, for all future agents.
> Date: 2026-03-13

---

## What Was Done

The goal was to achieve **100% separation** between `antigravity-learning` (production) and `antigravity-learning-dev` (development) environments across all layers of the stack.

### Issues Found & Fixed

| # | Layer | Problem | Fix Applied |
|---|-------|---------|------------|
| 1 | **Extensions** | All 4 extension `.env` files referenced prod bucket/config, even when deployed to dev | Created per-project `.env.<projectId>` files (Firebase's official mechanism) |
| 2 | **Cloud Functions / Email** | `mail.ts` hardcoded `https://antigravity-learning.web.app` in all email CTAs — dev users got prod links | Added `getBaseUrl()` that reads `process.env.GCLOUD_PROJECT` at runtime |
| 3 | **Frontend / Certificate** | `certificate.ts` hardcoded prod URL in the social sharing modal | Changed to `window.location.origin` — dynamically resolves at runtime |
| 4 | **Smoke Tests** | `smoke-tests.ts` hardcoded `PROJECT_ID = "antigravity-learning"` | Changed to `process.env.GCLOUD_PROJECT \|\| "antigravity-learning-dev"` |
| 5 | **Analytics** | Dev hosted site was sending GA events to prod measurement ID | Added `build:dev` script; deploy workflow now uses `--mode development` for dev builds |

---

## Honest Quality Assessment

### What was done well ✅

- **Correct mechanism for extensions** — Used Firebase's official project-specific `.env.<projectId>` file naming convention. This is the documented best practice and hooks directly into the `firebase deploy` CLI without any custom scripting.
- **Runtime detection in functions** — `GCLOUD_PROJECT` environment variable is set automatically by the Firebase/GCP runtime. It's reliable, zero-configuration, and the correct signal to use inside Cloud Functions. No secrets or env hacks required.
- **Frontend uses `window.location.origin`** — The absolute right approach. The URL is always correct regardless of environment, CDN, custom domains, or preview channels. Immune to future project renames.
- **Tests updated to match** — Mail unit tests were updated to import `getBaseUrl()` and validate dynamic behavior rather than hardcoded strings. Tests still pass (35/35).
- **Smoke test now defaults to dev** — The correct default. Running smoke tests should never touch production by default.

### What could be better ⚠️

1. **`getBaseUrl()` in `mail.ts` is implicit** — Using `GCLOUD_PROJECT` is reliable but not obvious to a future agent. A new contributor who reads the function won't immediately understand where that env var comes from. It should have an inline comment explaining its origin.

2. **The two remaining bare `.env` extension files** — The old `delete-user-data.env`, `storage-resize-images.env`, etc. files were removed. However, Firebase's `firebase deploy --only extensions` command currently uses the bare `.env` as a **fallback** if no project-specific file is found. We should have verified this behavior in the Firebase docs before removing them to ensure no regression.

3. **`SMTP_CONNECTION_URI` in extension env files** — The `firestore-send-email.env.*` files still contain the same SMTP credentials for both dev and prod. Ideally, dev should use a test/sandbox SMTP account (e.g., Mailtrap or a dev Gmail alias) so test emails from dev don't hit real user inboxes. This was **not fixed** during this session.

4. **No deployment validation** — The extension `.env` changes and functions changes were not re-deployed to verify the full cycle. The unit tests pass, but the live validation step (deploy → trigger a user creation → confirm the welcome email links to dev URL) was skipped.

5. **SKILL.md not updated** — The `skills/firebase-environments/SKILL.md` was not updated to reflect the new extension env file convention or the `getBaseUrl()` pattern. This is fixed below.

### Rating

| Dimension | Score | Notes |
|-----------|-------|-------|
| Correctness of approach | 9/10 | Right mechanisms, right APIs |
| Completeness | 7/10 | Missing: SMTP separation, live deploy validation |
| Code quality | 8/10 | Clean, but `getBaseUrl()` needs a comment |
| Test coverage | 9/10 | All tests updated and passing |
| Documentation | 6/10 | SKILL.md not updated during session (fixed now) |
| **Overall** | **8/10** | Solid work. The remaining gaps are known and documented. |

---

## Key Gotchas for Future Agents

### 1. Firebase Extension `.env` files — project-specific naming
The Firebase CLI supports per-project extension configuration using file naming convention:
```
extensions/<extension-id>.env.<firebase-project-id>
```
Example:
```
extensions/delete-user-data.env.antigravity-learning        ← prod
extensions/delete-user-data.env.antigravity-learning-dev    ← dev
```
When you run `firebase deploy --project antigravity-learning-dev`, the CLI automatically picks the `-dev` version. **Do NOT use bare `.env` files** as they act as cross-environment fallbacks and defeat isolation.

### 2. `GCLOUD_PROJECT` in Cloud Functions
Inside any Cloud Function, the GCP runtime automatically sets `process.env.GCLOUD_PROJECT` to the active project ID. This is the canonical way to branch logic between environments:
```typescript
const isProd = process.env.GCLOUD_PROJECT !== "antigravity-learning-dev";
```
Never hardcode project IDs inside function logic. Never.

### 3. Frontend URLs — always use `window.location.origin`
For any code that creates shareable URLs, share links, or social meta tags, always use:
```typescript
const siteUrl = window.location.origin; // e.g., https://antigravity-learning.web.app
```
This is immune to config drift, custom domains, and future project renames.

### 4. `build:dev` for hosted dev environments
`npm run dev` runs the Vite dev server and correctly loads `.env.development`.
But `npm run build` (used by most CI/CD) **always loads `.env.production`**.

For the **hosted dev site** (`antigravity-learning-dev.web.app`), you must use:
```bash
npm run build:dev  # = vite build --mode development
```
This is now defined in `package.json`. **Never deploy the dev site using `npm run build`.**

### 5. Smoke tests should default to dev, not prod
Any emulator or local smoke test that needs a project ID should default to the dev project, not production. A developer running `npm run test:smoke` locally should never touch prod data.

---

## Remaining Work (Not Done)

The following items were identified but not resolved in this session:

- [ ] **Separate SMTP accounts for dev/prod** — Dev should use Mailtrap (or a `+dev` Gmail alias) so test emails don't reach real inboxes and are clearly distinguishable from production emails.
- [ ] **Live deploy + end-to-end validation** — Re-deploy functions and extensions to dev, trigger a test user registration, and confirm the welcome email links point to `antigravity-learning-dev.web.app`.
- [ ] **Dev email templates** — Consider adding an `[DEV]` prefix to email subjects when running in dev mode so test emails are distinguishable if they do reach an inbox.
