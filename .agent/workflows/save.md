---
description: Save all work to GitHub — use at end of every work session
---

This workflow commits and pushes all current changes to GitHub as a backup.

## Steps

// turbo
1. **Check for changes**: `git status`

// turbo
2. **Stage all changes**: `git add -A`

3. **Commit with a descriptive message**: `git commit -m "<describe what changed>"`

// turbo
4. **Push to GitHub**: `git push`

5. **Confirm**: Tell the user their code is safely backed up on GitHub.

## When to use

- At the end of every work session
- Before deploying (the `/git-safe-deploy` workflow does this automatically)
- Anytime the user asks to "save" or "back up" their work
