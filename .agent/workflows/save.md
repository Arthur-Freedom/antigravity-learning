---
description: Save all work to GitHub — use at end of every work session
---

This workflow commits and pushes all current changes to GitHub as a safe backup.

## Pre-flight Checks

// turbo
1. **Type-check frontend** — don't push broken code:
   ```
   npx tsc --noEmit
   ```
   If this fails, fix the errors before continuing. Never push code that doesn't compile.

// turbo
2. **Type-check Cloud Functions** (if any functions files changed):
   ```
   npm --prefix functions run build
   ```
   If this fails, fix the errors before continuing.

## Save Steps

// turbo
3. **Check what changed**: `git status`
   Review the list. If anything looks unexpected (files you didn't intend to change), investigate before committing.

// turbo
4. **Stage all changes**: `git add -A`

// turbo
5. **Verify no secrets are staged** — check that `.env` files and secrets are NOT being committed:
   ```
   git diff --cached --name-only | Select-String -Pattern "\.env$|\.env\.|secret|password|api.key"
   ```
   If any matches appear, **STOP** — unstage them with `git reset HEAD <file>` and add them to `.gitignore`.

6. **Commit with a descriptive message** following this format:
   ```
   git commit -m "<type>: <what changed>"
   ```

   Types:
   - `feat:` — new feature
   - `fix:` — bug fix
   - `docs:` — documentation or workflow changes
   - `refactor:` — code restructuring (no behavior change)
   - `style:` — CSS/visual changes
   - `chore:` — maintenance, dependency updates

   Examples:
   - `feat: add daily login streak to profile page`
   - `fix: quiz progress not saving for modules 4-9`
   - `docs: update workflows with --project flags`

// turbo
7. **Push to GitHub**: `git push`
   If push fails:
   - **Authentication error**: Run `git credential-manager github login` or check GitHub token
   - **Rejected (behind remote)**: Run `git pull --rebase` first, then push again
   - **Network error**: Check internet connection, retry

8. **Confirm**: Tell the user:
   - ✅ Code is backed up on GitHub
   - 📝 Summary of what was committed (number of files, key changes)
   - 🔗 Link: https://github.com/Arthur-Freedom/antigravity-learning

## When to use

- At the end of every work session
- Before deploying (the `/git-safe-deploy` workflow does this automatically)
- Anytime the user asks to "save" or "back up" their work

## Important Notes

- **Git path**: On this system, git is at `C:\Program Files\Git\bin\git.exe`. If `git` is not recognized, use the full path.
- **Never push `.env` files** — they contain Firebase API keys. They should always be in `.gitignore`.
- **Never push `node_modules/`** — already in `.gitignore`.
