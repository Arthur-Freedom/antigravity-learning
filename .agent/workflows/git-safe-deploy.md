---
description: Safe end-to-end git commit, build verification, and deploy pipeline
---

This workflow provides a safe, ordered sequence for committing changes and deploying the full stack to production.

## Pre-flight Checks

Before starting, verify:
- Dev server is running (`npm run dev`) and the app loads without console errors
- No uncommitted changes that should NOT be deployed

## Steps

// turbo
1. **Type-check the frontend**: `npx tsc --noEmit`

// turbo
2. **Build the frontend**: `npm run build`

// turbo
3. **Build Cloud Functions** (if functions were changed): `npm --prefix functions run build`

4. **Stage and commit**:
   ```
   git add -A
   git commit -m "<descriptive commit message>"
   ```

5. **Push to GitHub**: `git push`

// turbo
6. **Deploy hosting** (frontend): `npx firebase deploy --only hosting --project antigravity-learning`

7. **Deploy Firestore** (if rules or indexes changed):
   ```
   npx firebase deploy --only firestore --project antigravity-learning
   ```

8. **Deploy functions** (if Cloud Functions changed):
   ```
   npx firebase deploy --only functions --project antigravity-learning 2>&1 | Out-File -FilePath C:\tmp\deploy-functions-output.txt -Encoding utf8
   ```
   Then verify: `Get-Content C:\tmp\deploy-functions-output.txt` — all functions must show "Successful".

9. **Deploy storage rules** (if storage rules changed):
   ```
   npx firebase deploy --only storage --project antigravity-learning
   ```

10. **MANDATORY — Post-deploy smoke test**:
   - Open https://antigravity-learning.web.app in the browser
   - Verify the page loads without console errors
   - **Test every feature that was changed** — click buttons, submit forms, trigger the actual feature
   - If Cloud Functions were changed, check logs: `npx firebase functions:log -n 20`
   - **DO NOT** declare success until the changed features work end-to-end on the live site
   - A successful `firebase deploy` only means the code uploaded — it does NOT mean the feature works

## Full Deploy Shortcut

If you need to deploy everything at once (use with caution):
```
npm run build && npx firebase deploy --project antigravity-learning
```

## Rollback Strategy

If something breaks after deploy:
1. **Check the Firebase Console** for function errors or rule issues
2. **Revert hosting** to a previous version via the Firebase Console: Hosting → Release history → Rollback
3. **Revert code**: `git revert HEAD` → rebuild → redeploy
