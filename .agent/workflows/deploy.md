---
description: Build and deploy to Firebase Hosting
---

This workflow builds the Vite app and deploys it to Firebase Hosting.

// turbo
1. Build the production bundle: `npm run build`

// turbo
2. Deploy to Firebase Hosting: `npx firebase deploy --only hosting`

// turbo
3. Deploy Firestore security rules: `npx firebase deploy --only firestore:rules`

// turbo
4. Echo the live URL: `echo "🚀 Deployed to https://antigravity-learning.web.app"`
