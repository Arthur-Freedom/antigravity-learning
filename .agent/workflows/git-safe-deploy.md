---
description: Safe end-to-end git commit, build verification, and deploy pipeline
---

This workflow provides a safe, ordered sequence for committing changes and deploying the full stack to production.

// turbo-all

## Pre-flight Checks

Before starting, verify:
- Dev server is running (`npm run dev`) and the app loads without console errors
- No uncommitted changes that should NOT be deployed

## Steps

1. **Type-check the frontend**: `npx tsc --noEmit`

2. **Build the frontend**: `npm run build`

3. **Build Cloud Functions** (if functions were changed): `npm --prefix functions run build`

4. **Stage changes**: `& "C:\Program Files\Git\bin\git.exe" add -A`

5. **Check for secrets**: `& "C:\Program Files\Git\bin\git.exe" diff --cached --name-only | Select-String -Pattern "\.env$|\.env\.|secret|password|api.key"`

6. **Commit**: `& "C:\Program Files\Git\bin\git.exe" commit --no-gpg-sign -m "<descriptive commit message>"`
   If this hangs, ask the user to commit manually in their terminal.

7. **Push to GitHub**: `& "C:\Program Files\Git\bin\git.exe" push`

8. **Deploy hosting** (frontend): `npx firebase deploy --only hosting --project antigravity-learning`

9. **Deploy Firestore** (if rules or indexes changed):
   ```
   npx firebase deploy --only firestore --project antigravity-learning
   ```

10. **Deploy functions** (if Cloud Functions changed):
    ```
    npx firebase deploy --only functions --project antigravity-learning 2>&1 | Out-File -FilePath C:\tmp\deploy-functions-output.txt -Encoding utf8
    ```
    Then verify: `Get-Content C:\tmp\deploy-functions-output.txt` — all functions must show "Successful".

11. **Deploy storage rules** (if storage rules changed):
    ```
    npx firebase deploy --only storage --project antigravity-learning
    ```

12. **MANDATORY — Post-deploy smoke test**:
    - Open https://antigravity-learning.web.app in the browser
    - Verify the page loads without console errors
    - **Test every feature that was changed** — click buttons, submit forms, trigger the actual feature
    - If Cloud Functions were changed, check logs: `npx firebase functions:log -n 20`
    - **DO NOT** declare success until the changed features work end-to-end on the live site

## Full Deploy Shortcut

If you need to deploy everything at once (use with caution):
```
npm run build && npx firebase deploy --project antigravity-learning
```

## Rollback Strategy

If something breaks after deploy:
1. **Check the Firebase Console** for function errors or rule issues
2. **Revert hosting** via Firebase Console: Hosting → Release history → Rollback
3. **Revert code**: `git revert HEAD` → rebuild → redeploy
