---
name: google-auth
description: Architecture and implementation rules for adding Google Authentication to the Antigravity learning website
---

# Google Authentication Implementation Guide

When asked to implement Google Login for this project, you MUST adhere to the following architectural patterns:

## 1. Core Technology
- Use **Firebase Authentication**.
- Do not use NextAuth or raw OAuth flow unless explicitly commanded otherwise.
- Initialize the Firebase App using a `.env` file for credentials.

## 2. UI Integration
- The Google Login button should be placed in the `header.navbar`.
- It should use the `.btn` class styling but have a distinctly different color or icon compared to standard navigation buttons.
- Upon successful login, the button should display the user's Google profile picture or first name, along with a "Logout" option.

## 3. Code Structure
- All authentication logic must be abstracted into a new dedicated module, e.g., `src/auth.ts`.
- `main.ts` should only import the initialization functions and UI bindings from `auth.ts`, it should not contain raw Firebase configuration objects.

By following these rules, the auth implementation will remain clean and consistent with the existing Vite+Vanilla TS architecture.
