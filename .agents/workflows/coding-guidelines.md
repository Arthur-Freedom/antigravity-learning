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

## Code Style

- Follow existing patterns in the codebase.
- Use TypeScript for all new code.
- Services go in `src/services/`, components in `src/components/`, pages in `src/pages/`.
