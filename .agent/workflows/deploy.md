---
description: Build and deploy to Firebase Hosting
---

This workflow builds the Vite app and deploys it to Firebase Hosting.

// turbo-all

1. **Build the production bundle**: `npm run build`

2. **Deploy to Firebase Hosting**: `npx firebase deploy --only hosting --project antigravity-learning`

3. **Deploy Firestore security rules**: `npx firebase deploy --only firestore:rules --project antigravity-learning`

4. **MANDATORY — Smoke test the live site**:
   - Open https://antigravity-learning.web.app in the browser
   - Verify the page loads — no blank screen, no console errors
   - If you changed a specific page or feature, navigate to it and confirm it works
   - Check the browser DevTools Console for JavaScript errors
   - **DO NOT** declare deploy complete until this step passes
