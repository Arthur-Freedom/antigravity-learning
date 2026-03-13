---
description: coding guidelines all agents must follow when working on this project
---

# Coding Guidelines

## Project Links

- **Always check `LINKS.md`** in the project root before providing any Firebase console, Google Cloud, or project-related links to the user. That file is the source of truth for all project URLs.
- Do NOT construct console URLs from memory or patterns — use the documented links.

## Environments

- The project uses two Firebase environments: `dev` (`antigravity-learning-dev`) and `prod` (`antigravity-learning`).
- Always deploy to **dev first**, then prod after verification.

## Firebase Regions — Critical

Dev and prod use **different Firestore regions**. This affects extensions, rules, and any region-aware Firebase features:

| Project | Firestore Region | Cloud Functions |
|---|---|---|
| `antigravity-learning-dev` | `nam5` | `us-central1` |
| `antigravity-learning` | `asia-southeast1` | `us-central1` |

- Never assume both projects share the same region.
- When deploying extensions that have a `DATABASE_REGION` param, it **must** match the target project's Firestore region.
- See `extensions/README.md` for extension-specific guidance.
- See `.agents/workflows/deploy-extensions.md` for step-by-step deploy instructions.

## Extensions

- All extensions are configured in the `extensions/` directory (one `.env` file per extension).
- Extensions are registered in `firebase.json` under the `"extensions"` key.
- **Never deploy extensions via the Firebase Console without also updating the local `.env` files** — this creates drift between code and console state.
- Prefer CLI deploys (`npx firebase-tools deploy --only extensions`) to keep git as the source of truth.
- If a CLI deploy is blocked by an unrelated extension, use the Console only as a last resort and document it.

## Code Style

- Follow existing patterns in the codebase.
- Use TypeScript for all new code.
- Services go in `src/services/`, components in `src/components/`, pages in `src/pages/`.
