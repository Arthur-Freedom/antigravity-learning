---
description: How to build, test, and deploy Cloud Functions
---

This workflow covers deploying Cloud Functions for the Antigravity Learning platform.

## Architecture Quick Reference

- **Runtime**: Node 20, Firebase Functions v2
- **Source**: `functions/src/index.ts` (single file, ~850 lines)
- **Deployed functions**: onQuizCompletion, getCompletionStatus, setAdminClaim, resetUserProgress, getAiHint, onUserDataWrite, onUserCreated
- **Dependencies**: Nodemailer (SMTP email), @google/genai (Gemini AI hints)
- **Secrets**: `SMTP_EMAIL`, `SMTP_PASSWORD`, `ADMIN_EMAILS`, `GEMINI_API_KEY` (all in Secret Manager — NOT in `.env` files)
- **Rate limits**: `getAiHint` is capped at 10 hints/day/user via `rateLimits/aiHints/users/{uid}`
- **Smoke tests**: `functions/src/smoke-tests.ts` — runs against emulator to catch runtime errors

## Steps

1. **Make your changes** in `functions/src/index.ts`

// turbo
2. **Build the functions** to check for TypeScript errors:
   ```
   npm --prefix functions run build
   ```

3. **Check for common issues**:
   - If adding a new function, make sure it's exported (`export const myFunction = ...`)
   - If using new environment variables, add them to `functions/.env`
   - **NEVER** put a secret in both `functions/.env` AND `secrets: [...]` in the function config — Cloud Run will reject the deploy with an overlap error
   - If using new npm packages, install them in the functions directory:
     ```
     npm --prefix functions install <package-name>
     ```
   - Firestore triggers: make sure the document path matches your collection structure

4. **Run smoke tests against the emulator** (MANDATORY before deploying):
   - Terminal 1 — start emulators:
     ```
     npx firebase emulators:start --only functions,firestore
     ```
   - Terminal 2 — run the tests:
     ```
     npm --prefix functions run test
     ```
   - If any test fails, **STOP** — fix the issue before deploying.
   - The smoke tests verify: auth rejection, argument validation, Firestore paths, rate limit storage.

// turbo
5. **Deploy only functions**: `npx firebase deploy --only functions --project antigravity-learning 2>&1 | Out-File -FilePath C:\tmp\deploy-functions-output.txt -Encoding utf8`

// turbo
6. **Read the deploy output** to verify all functions show "Successful" and there are no errors:
   ```
   Get-Content C:\tmp\deploy-functions-output.txt
   ```
   If any function shows "Failed", STOP and investigate before continuing.

// turbo
7. **Check logs for runtime errors**: `npx firebase functions:log -n 20 --project antigravity-learning 2>&1 | Out-File -FilePath C:\tmp\fn-logs.txt -Encoding utf8`

// turbo
8. **Read the logs**:
   ```
   Get-Content C:\tmp\fn-logs.txt
   ```

9. **MANDATORY — Smoke test the changed feature in the browser**:
   - Navigate to the relevant page on the LIVE site (https://antigravity-learning.web.app)
   - Actually trigger the feature you changed (click buttons, submit forms, etc.)
   - Open browser DevTools → Console tab and check for errors
   - Open browser DevTools → Network tab and verify the callable returned 200
   - **DO NOT** declare success until you've confirmed the feature works end-to-end
   - If the feature cannot be tested in the browser (e.g., a Firestore trigger), check the Cloud Functions logs for the expected log output

> **Why this step exists**: On 2026-03-12, functions were deployed successfully but the AI Hint feature was broken at runtime. The deploy output showed all green, but the feature was never actually tested. This step prevents that from happening again.

## Troubleshooting

| Issue | Solution |
|-------|---------|
| Build fails with type errors | Check `functions/tsconfig.json` — currently targets `es2022` |
| Function timeout | Default is 60s; increase with `timeoutSeconds` option in the function config |
| Secrets not available | Set via `firebase functions:secrets:set SECRET_NAME` (NOT in `.env` if using `secrets:` config) |
| Secret overlaps `.env` variable | Remove the key from `functions/.env` — `secrets: [...]` pulls from Secret Manager |
| Trigger not firing | Verify the document path matches exactly (e.g. `users/{userId}`) |
| Infinite trigger loop | Add a `_sanitizedAt` guard like `onUserDataWrite` does |
| Deploy succeeds but feature broken | Always smoke-test — deploy success ≠ feature works |
| Emulator won't start | Check if ports 5001/8080 are already in use: `netstat -ano | findstr :5001` |
