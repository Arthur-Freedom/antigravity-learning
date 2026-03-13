---
description: Build and deploy to Firebase Hosting
---

This workflow builds the Vite app and deploys it to Firebase Hosting.

> **IMPORTANT**: Always deploy to **dev first**, then production. This applies to ALL Firebase deployments (hosting, functions, extensions, security rules).

// turbo-all

1. **Build the DEV bundle** (uses `.env.development`): `npm run build:dev`

2. **Deploy to DEV first**: `npx firebase deploy --only hosting --project antigravity-learning-dev`

3. **Deploy Firestore security rules to DEV**: `npx firebase deploy --only firestore:rules --project antigravity-learning-dev`

4. **Smoke test DEV site**:
   - Open https://antigravity-learning-dev.web.app in the browser
   - Verify the page loads — no blank screen, no console errors
   - **DO NOT proceed to production until dev passes**

5. **Build the PRODUCTION bundle** (uses `.env.production`): `npm run build`

6. **Deploy to PRODUCTION**: `npx firebase deploy --only hosting --project antigravity-learning`

7. **Deploy Firestore security rules to PRODUCTION**: `npx firebase deploy --only firestore:rules --project antigravity-learning`

8. **MANDATORY — Smoke test the PRODUCTION site**:
   - Open https://antigravity-learning.web.app in the browser
   - Verify the page loads — no blank screen, no console errors
   - If you changed a specific page or feature, navigate to it and confirm it works
   - Check the browser DevTools Console for JavaScript errors
   - **DO NOT** declare deploy complete until this step passes
