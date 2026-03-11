---
description: How to add a new backend feature (Firebase/Firestore)
---

This workflow describes how to add a new backend feature to the Antigravity Learning platform.

## Architecture Quick Reference

- **Firebase app instance** is shared between `auth.ts` and `db.ts` using `getApps().length ? getApp() : initializeApp(config)`
- **All Firestore operations** go through `src/db.ts` — never import Firestore directly in pages
- **Auth state** is accessed via `getCurrentUser()` (sync) or `onAuthChange()` (async listener) from `src/auth.ts`
- **Environment variables** use the `VITE_` prefix (Vite requirement) and are accessed via `import.meta.env`

## Steps

1. **Add Firestore functions** in `src/db.ts`:
   - Define TypeScript interfaces for your data
   - Create async functions for CRUD operations
   - Wrap all Firestore calls in try/catch with console.error logging
   - Export functions for use in pages/components

2. **Update Firestore security rules** in `firestore.rules`:
   - Add a new `match` block for your collection
   - Validate data schemas with helper functions
   - Test that users can only access their own data
   - Deploy rules: `npx firebase deploy --only firestore:rules`

3. **Create UI** in `src/pages/` or `src/components/`:
   - **Page**: export `render()` (HTML string) and `init()` (event binding)
   - **Component**: export functions that can be called from any page
   - Register pages as routes in `src/main.ts` via `registerRoutes()`

4. **Handle auth state** properly:
   - Use `getCurrentUser()` for synchronous checks (may be null on page load)
   - Use `onAuthChange()` for async checks (waits for Firebase Auth to resolve)
   - Always handle the "not logged in" case gracefully

5. **Add styles** in `src/style.css`:
   - Follow the existing design system variables (--bg-primary, --text-primary, etc.)
   - Add dark mode overrides if needed (`body.dark-theme .your-class`)
   - Add responsive breakpoints for mobile (768px) and tablet (1024px)

6. **Test and deploy**:
   - `npx tsc --noEmit` — verify no TypeScript errors
   - `npm run build` — verify production build
   - `npx firebase deploy --only hosting` — deploy to live site
