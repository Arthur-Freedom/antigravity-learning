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
