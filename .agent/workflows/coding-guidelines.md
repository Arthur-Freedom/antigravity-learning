---
description: coding guidelines all agents must follow when working on this project
---

# Coding Guidelines

## Do NOT open the browser for every change

- Make code edits directly. Do NOT open the browser, take screenshots, or use browser_subagent to "verify" routine changes.
- The dev server (`npm run dev`) is already running. If TypeScript compiles without errors, the change works.
- Only use the browser when:
  1. The user explicitly asks you to check something visually
  2. You are debugging a visual bug that cannot be reasoned about from code alone
  3. You need to interact with the running app (click buttons, test flows)

## General Rules

- Trust the compiler. If Vite/TypeScript doesn't throw errors, move on.
- Be fast. Make the edit, confirm no build errors, done.
- Don't over-verify. One screenshot max if truly needed, not multiple.

## Environment Separation (CRITICAL)

This project uses **two separate Firebase projects**:
- **Dev** (`antigravity-learning-dev`): Used by `npm run dev` (localhost). Has its own database, users, and storage.
- **Production** (`antigravity-learning`): Used by `npm run build` (live site). Has real users and data.

Rules:
- **NEVER** point localhost at the production Firebase project.
- **NEVER** hardcode Firebase config values — always use `import.meta.env.VITE_FIREBASE_*` variables.
- The `.env.development` file is loaded automatically for `npm run dev`. The `.env.production` file is loaded for `npm run build`.
- When running Firebase CLI commands during development, use: `npx firebase use antigravity-learning-dev`
- When deploying, the `/git-safe-deploy` workflow handles switching to the production project.

## Deploy Rules

- **ALWAYS use `/git-safe-deploy` to deploy.** Never use `/deploy` directly — it skips the Git commit step.
- A successful `firebase deploy` only means the code uploaded and the container started. It does NOT mean the feature works.
- **After every deploy, you MUST smoke-test the changed feature on the live site.** This is not optional.
- For Cloud Functions: check `firebase functions:log` for runtime errors after triggering the feature.
- For UI changes: open the live URL and actually interact with the feature.
- Never write a "Deploy Complete ✅" summary until you've confirmed the feature works end-to-end.

## Feature Flags (Remote Config)

- **Before hardcoding a feature toggle**, check if it should be a Remote Config flag instead.
- Use `getFlag('flag_name')` from `src/services/remoteConfigService.ts` to check boolean flags.
- Use `getConfigValue('key')` for string config values.
- Current flags: `ai_hints_enabled`, `leaderboard_enabled`, `presence_enabled`, `maintenance_banner`.
- To add a new flag: add a default in `remoteConfigService.ts` DEFAULTS object, then add the parameter in the Firebase Console → Remote Config.

## Git Safety

- **NEVER run `git revert` without first reviewing what it will undo**: `git diff HEAD~1` or `git show <commit>`.
- Always push to GitHub before deploying, so you have a record of what's live.
- Use descriptive commit messages that explain what changed and why.
- **Git path**: On this system, git is at `C:\Program Files\Git\bin\git.exe`. Use `& "C:\Program Files\Git\bin\git.exe"` in PowerShell.
- **GPG signing**: If `git commit` hangs with no output, it's likely waiting for a GPG passphrase. Use `--no-gpg-sign` or ask the user to commit manually.

## Verification Standards (CRITICAL)

**RULE: "CLI success" ≠ "it works."** Never declare any setup, deploy, or infrastructure task complete based only on CLI output.

### For Firebase/infrastructure setup:
- **ALWAYS open the Firebase Console** and visually confirm each service is active (not showing "Get Started" or "Create database").
- Follow the full verification protocol in `skills/firebase-environments/SKILL.md`.
- Never say "✅ Done" for any Firebase service without console verification.

### For deploys:
- **ALWAYS smoke-test** the changed feature on the live site after deploying.
- A "Deploy complete!" message from the CLI means the upload succeeded — it does NOT mean the feature works.

### For any task:
- If you told the user something is "done" or "complete," you must have **verified it works**, not just that the command ran.
- If you cannot verify (e.g., you can't open the console), explicitly tell the user: "I ran the command but could not verify — please check [URL]."

